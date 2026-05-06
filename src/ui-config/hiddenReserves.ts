/**
 * Резервы, скрытые из UI (списки ассетов, модалки, страница деталей).
 *
 * How to apply: убирать запись только когда проблема, из-за которой ассет скрыт,
 * исправлена on-chain (или резерв заморожен через PoolConfigurator).
 */
export const HIDDEN_RESERVES_BY_CHAIN: Record<number, string[]> = {
  143: [
    '0x4809010926aec940b550D34a46A52739f996D75D', // wsrUSD
  ],
};

export const isReserveHidden = (chainId: number, underlyingAsset: string): boolean => {
  const list = HIDDEN_RESERVES_BY_CHAIN[chainId];
  if (!list?.length) return false;
  const key = underlyingAsset.toLowerCase();
  return list.some((addr) => addr.toLowerCase() === key);
};
