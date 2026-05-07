import type { PaytableRule } from './SlotTypes';

export const DEFAULT_PAYTABLE: PaytableRule[] = [
  { symbol: 'Golden_coin_4', payouts: { 3: 2, 4: 4, 5: 8, 6: 12 } },
  { symbol: 'Golden_coin_3', payouts: { 3: 1.8, 4: 3.6, 5: 7, 6: 10 } },
  { symbol: 'Golden_coin_2', payouts: { 3: 1.6, 4: 3, 5: 5.5, 6: 8 } },
  { symbol: 'Golden_coin_1', payouts: { 3: 1.4, 4: 2.5, 5: 4.5, 6: 7 } },
  { symbol: 'Silver_coin_4', payouts: { 3: 1.2, 4: 2, 5: 3.5, 6: 5 } },
  { symbol: 'Silver_coin_3', payouts: { 3: 1, 4: 1.8, 5: 3, 6: 4.5 } },
  { symbol: 'Silver_coin_2', payouts: { 3: 0.8, 4: 1.5, 5: 2.6, 6: 4 } },
  { symbol: 'Silver_coin_1', payouts: { 3: 0.7, 4: 1.3, 5: 2.2, 6: 3.5 } },
  { symbol: 'Bronze_coin_4', payouts: { 3: 0.6, 4: 1.1, 5: 2, 6: 3.2 } },
  { symbol: 'Bronze_coin_3', payouts: { 3: 0.5, 4: 1, 5: 1.8, 6: 2.8 } },
  { symbol: 'Bronze_coin_2', payouts: { 3: 0.4, 4: 0.8, 5: 1.5, 6: 2.4 } },
  { symbol: 'Bronze_coin_1', payouts: { 3: 0.3, 4: 0.6, 5: 1.2, 6: 2 } },
  { symbol: 'Safe', payouts: { 3: 1, 4: 1.8, 5: 3, 6: 4 } },
  { symbol: 'Bank', payouts: { 3: 1.1, 4: 2, 5: 3.2, 6: 4.2 } },
];

export function getMultiplierForSymbol(
  symbol: string,
  count: number,
  paytable: PaytableRule[] = DEFAULT_PAYTABLE,
): number {
  if (count < 3) {
    return 0;
  }

  const rule = paytable.find((item) => item.symbol === symbol);
  if (!rule) {
    return 0;
  }

  const cappedCount = Math.min(6, count) as 3 | 4 | 5 | 6;
  return rule.payouts[cappedCount] ?? 0;
}
