import type { RngMode } from './SlotTypes';

export const SLOT_BET_OPTIONS = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500, 999] as const;

export const DEFAULT_RNG_MODE: RngMode = 'fair';
