import type { RngMode } from './SlotTypes';

/** Valores de aposta disponíveis no HUD. */
export const SLOT_BET_OPTIONS = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500, 999] as const;
/** Saldo inicial ao abrir o jogo. */
export const SLOT_INITIAL_BALANCE = 4000;
/** Índice padrão em SLOT_BET_OPTIONS (7 = aposta 100). */
export const SLOT_DEFAULT_BET_INDEX = 7;

/** Sorteio aleatório em produção; use 'mock' só em testes. */
export const DEFAULT_RNG_MODE: RngMode = 'fair';
