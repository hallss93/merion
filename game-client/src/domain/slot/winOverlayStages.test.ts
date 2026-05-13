import { describe, expect, it } from 'vitest';
import {
  getPrimaryWinStageIndex,
  getWinStageIndices,
  type WinAmountThresholds,
} from './winOverlayStages';

const THRESHOLDS: WinAmountThresholds = {
  bigWin: 100,
  megaWin: 1000,
  superMegaWin: 5000,
};

describe('getPrimaryWinStageIndex', () => {
  it('retorna null quando totalWin e zero ou negativo', () => {
    expect(getPrimaryWinStageIndex(0, THRESHOLDS)).toBeNull();
    expect(getPrimaryWinStageIndex(-1, THRESHOLDS)).toBeNull();
  });

  it('retorna 0 para qualquer ganho positivo abaixo de bigWin', () => {
    expect(getPrimaryWinStageIndex(1, THRESHOLDS)).toBe(0);
    expect(getPrimaryWinStageIndex(99, THRESHOLDS)).toBe(0);
  });

  it('retorna 0 a partir de bigWin e abaixo de megaWin', () => {
    expect(getPrimaryWinStageIndex(100, THRESHOLDS)).toBe(0);
    expect(getPrimaryWinStageIndex(999, THRESHOLDS)).toBe(0);
  });

  it('retorna 1 a partir de megaWin e abaixo de superMegaWin', () => {
    expect(getPrimaryWinStageIndex(1000, THRESHOLDS)).toBe(1);
    expect(getPrimaryWinStageIndex(4999, THRESHOLDS)).toBe(1);
  });

  it('retorna 2 a partir de superMegaWin', () => {
    expect(getPrimaryWinStageIndex(5000, THRESHOLDS)).toBe(2);
    expect(getPrimaryWinStageIndex(50_000, THRESHOLDS)).toBe(2);
  });
});

describe('getWinStageIndices', () => {
  it('retorna vazio quando nao ha estagio primario', () => {
    expect(getWinStageIndices(0, THRESHOLDS)).toEqual([]);
  });

  it('sempre inclui estagio 3 apos o primario quando ha ganho', () => {
    expect(getWinStageIndices(50, THRESHOLDS)).toEqual([0, 3]);
    expect(getWinStageIndices(100, THRESHOLDS)).toEqual([0, 3]);
    expect(getWinStageIndices(1000, THRESHOLDS)).toEqual([1, 3]);
    expect(getWinStageIndices(5000, THRESHOLDS)).toEqual([2, 3]);
  });
});
