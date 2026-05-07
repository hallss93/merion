import { describe, expect, it } from 'vitest';
import { SpinEngine } from './SpinEngine';
import type { SymbolDefinition } from '../../config/gameSceneConfig';

const SYMBOL_A: SymbolDefinition = { folder: 'Bank', prefix: 'Bank_' };
const SYMBOL_B: SymbolDefinition = { folder: 'Cell', prefix: 'Cell_' };

describe('SpinEngine', () => {
  it('gera matriz com dimensoes esperadas', () => {
    const engine = new SpinEngine('mock');
    const result = engine.spin({
      bet: 10,
      symbols: [SYMBOL_A, SYMBOL_B],
      rows: 5,
      columns: 6,
    });

    expect(result.matrix).toHaveLength(5);
    for (const row of result.matrix) {
      expect(row).toHaveLength(6);
    }
  });

  it('retorna totais consistentes com as linhas vencedoras', () => {
    const engine = new SpinEngine('mock');
    const result = engine.spin({
      bet: 10,
      symbols: [SYMBOL_A],
      rows: 5,
      columns: 6,
    });

    const sumMultiplier = result.wins.reduce((acc, item) => acc + item.multiplier, 0);
    const sumAmount = result.wins.reduce((acc, item) => acc + item.amount, 0);

    expect(result.totalMultiplier).toBe(sumMultiplier);
    expect(result.totalWin).toBe(sumAmount);
    expect(result.totalWin).toBeGreaterThan(0);
  });
});
