import type { PaylinePattern, PaytableRule } from './SlotTypes';

export const DEFAULT_PAYTABLE: PaytableRule[] = [
  { symbol: 'Dynamit', payouts: { 3: 1.3, 4: 2.2, 5: 3.5, 6: 5 } },
  { symbol: 'Handcuffs', payouts: { 3: 1.2, 4: 2, 5: 3.2, 6: 4.8 } },
  { symbol: 'Cell', payouts: { 3: 1.1, 4: 1.9, 5: 3, 6: 4.6 } },
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
  { symbol: 'Littera_A', payouts: { 3: 0.8, 4: 1.4, 5: 2.2, 6: 3.2 } },
  { symbol: 'Littera_K', payouts: { 3: 0.7, 4: 1.3, 5: 2, 6: 3 } },
  { symbol: 'Littera_Q', payouts: { 3: 0.6, 4: 1.2, 5: 1.8, 6: 2.8 } },
  { symbol: 'Littera_J', payouts: { 3: 0.5, 4: 1, 5: 1.6, 6: 2.4 } },
  { symbol: 'Number_10', payouts: { 3: 0.4, 4: 0.9, 5: 1.4, 6: 2.1 } },
  { symbol: 'Safe', payouts: { 3: 1, 4: 1.8, 5: 3, 6: 4 } },
  { symbol: 'Bank', payouts: { 3: 1.1, 4: 2, 5: 3.2, 6: 4.2 } },
];

// 10 paylines oficiais para grade 6x5 (linhas 0-4).
export const OFFICIAL_PAYLINES: PaylinePattern[] = [
  [0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3],
  [4, 4, 4, 4, 4, 4],
  [0, 1, 2, 2, 1, 0],
  [4, 3, 2, 2, 3, 4],
  [1, 2, 3, 3, 2, 1],
  [3, 2, 1, 1, 2, 3],
  [0, 0, 1, 2, 3, 4],
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
