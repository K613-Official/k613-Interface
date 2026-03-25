'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { useK613StakingController } from './useK613StakingController';

export type K613StakingContextValue = Omit<
  ReturnType<typeof useK613StakingController>,
  'gate'
>;

const K613StakingContext = createContext<K613StakingContextValue | null>(null);

export function K613StakingProvider({
  value,
  children,
}: {
  value: K613StakingContextValue;
  children: ReactNode;
}) {
  return <K613StakingContext.Provider value={value}>{children}</K613StakingContext.Provider>;
}

export function useK613StakingPage(): K613StakingContextValue {
  const v = useContext(K613StakingContext);
  if (!v) throw new Error('useK613StakingPage must be used within K613StakingProvider');
  return v;
}
