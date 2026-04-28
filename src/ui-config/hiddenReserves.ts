/**
 * Резервы, которые временно прячем из UI (списки, модалки, страница деталей).
 *
 * Why: для wsrUSD на Monad источник AaveOracle указывает на «WSRUSD/RUSD Exchange Rate»
 * с 18 знаками вместо нормированной USD-цены 1e8. Pool читает getAssetPrice напрямую и
 * оценивает 1 wsrUSD как ~$1e10 → любой supply открывает практически безлимитный borrow.
 * До фикса оракула / freeze резерва на контракте — скрываем актив на фронте.
 *
 * How to apply: при появлении новых проблемных резервов добавлять их сюда. Снимать
 * запись только когда исправлено on-chain.
 */
export const HIDDEN_RESERVES_BY_CHAIN: Record<number, string[]> = {
  143: [
    '0x4809010926aec940b550D34a46A52739f996D75D', // wsrUSD — broken oracle source
  ],
};

export const isReserveHidden = (chainId: number, underlyingAsset: string): boolean => {
  const list = HIDDEN_RESERVES_BY_CHAIN[chainId];
  if (!list?.length) return false;
  const key = underlyingAsset.toLowerCase();
  return list.some((addr) => addr.toLowerCase() === key);
};
