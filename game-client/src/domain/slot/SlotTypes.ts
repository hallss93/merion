import type { SymbolDefinition } from '../../config/gameSceneConfig';

/** Fases de uma rodada, da aposta ao retorno ao idle. */
export type SlotPhase = 'idle' | 'spinning' | 'evaluating' | 'showingWin' | 'settling';

export type RngMode = 'fair' | 'mock';

export type SpinBlockReason = 'not_idle' | 'insufficient_balance' | null;

/** Caminho da payline: fileira (0–4) em cada uma das 6 colunas. */
export type PaylinePattern = number[];

/** Resultado de uma payline que pagou na rodada. */
export interface LineWin {
  lineId: number;
  symbol: string;
  count: number;
  multiplier: number;
  amount: number;
}

/** Saída completa de um giro do SpinEngine. */
export interface SpinResult {
  matrix: SymbolDefinition[][];
  wins: LineWin[];
  totalMultiplier: number;
  totalWin: number;
}

/** Multiplicadores de um símbolo para 3, 4, 5 ou 6 matches. */
export interface PaytableRule {
  symbol: string;
  payouts: Partial<Record<3 | 4 | 5 | 6, number>>;
}
