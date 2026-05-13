import type { SymbolDefinition } from '../../config/gameSceneConfig';

export type SlotPhase = 'idle' | 'spinning' | 'evaluating' | 'showingWin' | 'settling';

export type RngMode = 'fair' | 'mock';

export type SpinBlockReason = 'not_idle' | 'insufficient_balance' | null;

export type PaylinePattern = number[];

export interface LineWin {
  lineId: number;
  symbol: string;
  count: number;
  multiplier: number;
  amount: number;
}

export interface SpinResult {
  matrix: SymbolDefinition[][];
  wins: LineWin[];
  totalMultiplier: number;
  totalWin: number;
}

export interface PaytableRule {
  symbol: string;
  payouts: Partial<Record<3 | 4 | 5 | 6, number>>;
}
