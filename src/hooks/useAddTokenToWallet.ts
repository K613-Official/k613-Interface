import { useCallback, useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useAccount } from 'wagmi';

export type WatchableToken = {
  address: string;
  symbol: string;
  decimals: number;
};

/**
 * MetaMask and its forks reject a watchAsset symbol longer than 11 characters.
 */
const MAX_WALLET_SYMBOL_LENGTH = 11;

/**
 * Connectors known to implement EIP-747. WalletConnect relays the request to the
 * remote wallet, which in practice drops it without ever answering, and the Safe
 * app has no concept of watching an asset — so instead of offering a button that
 * does nothing there, we hide it.
 */
const WATCH_ASSET_CONNECTORS = [
  'injected',
  'metamask',
  'metamasksdk',
  'io.metamask',
  'coinbasewallet',
  'coinbasewalletsdk',
];

const supportsWatchAsset = (connector?: { id?: string; type?: string }): boolean => {
  if (!connector) return false;
  const id = (connector.id ?? '').toLowerCase();
  const type = (connector.type ?? '').toLowerCase();
  if (type === 'injected') return true;
  return WATCH_ASSET_CONNECTORS.includes(id) || WATCH_ASSET_CONNECTORS.includes(type);
};

const errorCode = (error: unknown): number | undefined => {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = e?.code ?? e?.cause?.code;
  return typeof code === 'number' ? code : undefined;
};

const isUserRejection = (error: unknown): boolean => {
  if (errorCode(error) === 4001) return true;
  const name = (error as { name?: string } | null)?.name ?? '';
  if (name === 'UserRejectedRequestError') return true;
  const message = ((error as { message?: string } | null)?.message ?? '').toLowerCase();
  return message.includes('user rejected') || message.includes('user denied');
};

const isMethodNotSupported = (error: unknown): boolean => {
  const code = errorCode(error);
  if (code === -32601 || code === -32004) return true;
  const message = ((error as { message?: string } | null)?.message ?? '').toLowerCase();
  return (
    message.includes('does not exist') ||
    message.includes('not supported') ||
    message.includes('unsupported method') ||
    message.includes('unrecognized method')
  );
};

const ADDED_PREFIX = 'k613.watchAsset.added.';
const DISMISSED_PREFIX = 'k613.watchAsset.dismissed.';

const readFlag = (storage: 'local' | 'session', key: string): boolean => {
  try {
    const store = storage === 'local' ? window.localStorage : window.sessionStorage;
    return store.getItem(key) === '1';
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Never fatal:
    // worst case we offer the token again.
    return false;
  }
};

const writeFlag = (storage: 'local' | 'session', key: string) => {
  try {
    const store = storage === 'local' ? window.localStorage : window.sessionStorage;
    store.setItem(key, '1');
  } catch {
    /* see readFlag */
  }
};

// The prompt and the standalone button mount separate copies of this hook. Without
// a shared notification they would drift apart — adding the token from the dialog
// would leave the button still advertising it. Keep them in sync.
const listeners = new Set<() => void>();
const notifyFlagChange = () => listeners.forEach((listener) => listener());

/**
 * Token icons live at `/icons/tokens/<symbol>.svg`. Wallets need an absolute URL,
 * so resolve it against the current origin.
 */
const tokenImageUrl = (symbol: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return new URL(`/icons/tokens/${symbol.toLowerCase()}.svg`, window.location.origin).toString();
};

/**
 * Offers an ERC-20 to the connected wallet via EIP-747 (`wallet_watchAsset`),
 * reusing the provider's `addERC20Token`.
 *
 * EIP-747 is best-effort by design: a wallet may not implement it and the user may
 * say no. Neither is an error the user can act on, so nothing is ever surfaced —
 * failures resolve to `false` and the caller carries on.
 */
export function useAddTokenToWallet(token: WatchableToken | null) {
  const { addERC20Token } = useWeb3Context();
  const { address: account, chainId, connector, isConnected } = useAccount();

  const [pending, setPending] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [added, setAdded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const storageId =
    token && account ? `${chainId}.${account.toLowerCase()}.${token.address.toLowerCase()}` : null;

  // Flags are hydrated in an effect rather than lazy state so that the server render
  // and the first client render agree.
  useEffect(() => {
    if (!storageId) {
      setAdded(false);
      setDismissed(false);
      return;
    }

    const sync = () => {
      setAdded(readFlag('local', `${ADDED_PREFIX}${storageId}`));
      setDismissed(readFlag('session', `${DISMISSED_PREFIX}${storageId}`));
    };

    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [storageId]);

  const symbolFitsWallet = token ? token.symbol.length <= MAX_WALLET_SYMBOL_LENGTH : false;

  const canAdd = Boolean(
    token &&
      isConnected &&
      account &&
      symbolFitsWallet &&
      !unsupported &&
      supportsWatchAsset(connector)
  );

  /** Whether it is still appropriate to prompt unasked (after a successful tx). */
  const shouldPrompt = canAdd && !added && !dismissed;

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (storageId) {
      writeFlag('session', `${DISMISSED_PREFIX}${storageId}`);
      notifyFlagChange();
    }
  }, [storageId]);

  const addToken = useCallback(async (): Promise<boolean> => {
    if (!token || !canAdd || pending) return false;

    setPending(true);
    try {
      const ok = await addERC20Token({
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        image: tokenImageUrl(token.symbol),
      });

      if (ok) {
        // EIP-747 gives no way to query whether a token is already tracked, so a
        // confirmed add is the only "already added" signal we ever get.
        setAdded(true);
        if (storageId) {
          writeFlag('local', `${ADDED_PREFIX}${storageId}`);
          notifyFlagChange();
        }
      }

      return ok;
    } catch (error) {
      if (isMethodNotSupported(error)) {
        setUnsupported(true);
      } else if (isUserRejection(error)) {
        dismiss();
      }
      return false;
    } finally {
      setPending(false);
    }
  }, [token, canAdd, pending, addERC20Token, storageId, dismiss]);

  return { canAdd, shouldPrompt, added, pending, addToken, dismiss };
}
