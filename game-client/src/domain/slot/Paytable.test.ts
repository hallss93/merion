import { describe, expect, it } from 'vitest';
import { DEFAULT_PAYTABLE, getMultiplierForSymbol } from './Paytable';
import type { PaytableRule } from './SlotTypes';

describe('getMultiplierForSymbol', () => {
  it('retorna 0 quando count e menor que 3', () => {
    expect(getMultiplierForSymbol('Bank', 0)).toBe(0);
    expect(getMultiplierForSymbol('Bank', 1)).toBe(0);
    expect(getMultiplierForSymbol('Bank', 2)).toBe(0);
  });

  it('retorna 0 para simbolo inexistente na paytable', () => {
    expect(getMultiplierForSymbol('Simbolo_Inexistente', 5)).toBe(0);
  });

  it('usa payout de 6 quando count e maior que 6', () => {
    const bank6 = getMultiplierForSymbol('Bank', 6);
    expect(getMultiplierForSymbol('Bank', 7)).toBe(bank6);
    expect(getMultiplierForSymbol('Bank', 99)).toBe(bank6);
  });

  it('retorna multiplicadores esperados para contagens 3 a 6 no padrao', () => {
    expect(getMultiplierForSymbol('Bank', 3)).toBe(1.1);
    expect(getMultiplierForSymbol('Bank', 4)).toBe(2);
    expect(getMultiplierForSymbol('Bank', 5)).toBe(3.2);
    expect(getMultiplierForSymbol('Bank', 6)).toBe(4.2);
  });

  it('usa paytable customizada quando informada', () => {
    const custom: PaytableRule[] = [{ symbol: 'Z', payouts: { 3: 10, 4: 20 } }];
    expect(getMultiplierForSymbol('Z', 3, custom)).toBe(10);
    expect(getMultiplierForSymbol('Z', 4, custom)).toBe(20);
    expect(getMultiplierForSymbol('Z', 5, custom)).toBe(0);
    expect(getMultiplierForSymbol('Z', 6, custom)).toBe(0);
  });

  it('retorna 0 quando a faixa de payout nao existe para o count capado', () => {
    const partial: PaytableRule[] = [{ symbol: 'X', payouts: { 3: 1 } }];
    expect(getMultiplierForSymbol('X', 6, partial)).toBe(0);
  });

  it('DEFAULT_PAYTABLE cobre todos os simbolos usados em getMultiplierForSymbol com count 3', () => {
    for (const rule of DEFAULT_PAYTABLE) {
      expect(getMultiplierForSymbol(rule.symbol, 3)).toBeGreaterThan(0);
    }
  });
});
