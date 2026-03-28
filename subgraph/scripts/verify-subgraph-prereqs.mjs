import { createPublicClient, http, isAddress } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PAP = '0x20f1827195Bbff32942C43681841d6b2B82651b7';
const RPC = process.env.ARBITRUM_SEPOLIA_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc';

const registryAbi = [
  {
    name: 'getAddressesProviderIdByAddress',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'addressesProvider', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
];

const papAbi = [
  {
    name: 'getPriceOracle',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
];

async function main() {
  const configPath = join(__dirname, '..', 'config', 'k613-arbitrum-sepolia-v3.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const pap = process.env.POOL_ADDRESSES_PROVIDER ?? DEFAULT_PAP;

  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(RPC, { timeout: 20_000 }),
  });

  const regStr = String(config.PoolAddressesProviderRegistryAddress);
  const rewStr = String(config.RewardsControllerAddress);
  if (regStr.toLowerCase().includes('replace') || !isAddress(regStr)) {
    console.error(
      'Set PoolAddressesProviderRegistryAddress in subgraph/config/k613-arbitrum-sepolia-v3.json to the registry from your L2 deployment (official BGD Arbitrum Sepolia registry does not register this PoolAddressesProvider).'
    );
    process.exit(1);
  }
  if (rewStr.toLowerCase().includes('replace') || !isAddress(rewStr)) {
    console.error(
      'Set RewardsControllerAddress in subgraph/config/k613-arbitrum-sepolia-v3.json to your RewardsController (IncentivesController proxy) from deployment.'
    );
    process.exit(1);
  }

  const oracleFromPap = await client.readContract({
    address: pap,
    abi: papAbi,
    functionName: 'getPriceOracle',
  });
  if (oracleFromPap.toLowerCase() !== config.AaveOracleAddress.toLowerCase()) {
    console.warn(
      `Warning: config AaveOracleAddress (${config.AaveOracleAddress}) differs from PoolAddressesProvider.getPriceOracle() (${oracleFromPap}). Update the JSON if you changed the oracle.`
    );
  }

  const providerId = await client.readContract({
    address: config.PoolAddressesProviderRegistryAddress,
    abi: registryAbi,
    functionName: 'getAddressesProviderIdByAddress',
    args: [pap],
  });
  if (providerId === 0n) {
    console.error(
      `PoolAddressesProvider ${pap} is not registered in registry ${config.PoolAddressesProviderRegistryAddress}. The Aave protocol subgraph will not index your pool until this provider is registered in that registry (or you fork the subgraph).`
    );
    process.exit(1);
  }

  console.log('OK: PoolAddressesProvider is registered in the configured registry (id', providerId.toString() + ').');
  console.log('Next: clone aave/protocol-subgraphs, copy this config, run prepare:subgraph, deploy to Subgraph Studio, set NEXT_PUBLIC_SUBGRAPH_ARBITRUM_SEPOLIA_URL.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
