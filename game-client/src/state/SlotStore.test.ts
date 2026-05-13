import { describe, expect, it } from 'vitest';
import { SlotStore } from './SlotStore';

describe('SlotStore', () => {
  it('bloqueia spin por saldo insuficiente', () => {
    const store = new SlotStore(0, [0, 1, 5]);
    expect(store.getCurrentBet()).toBeGreaterThan(0);
    expect(store.canSpin()).toBe(false);
    expect(store.getSpinBlockReason()).toBe('insufficient_balance');
    expect(store.startSpin()).toBe(false);
  });

  it('limita bet no maximo e nao ultrapassa o ultimo indice', () => {
    const store = new SlotStore(100, [0, 1, 5]);
    store.increaseBet();
    store.increaseBet();
    store.increaseBet();

    expect(store.getCurrentBet()).toBe(5);
  });

  it('executa ciclo basico de spin e settle corretamente', () => {
    const store = new SlotStore(20, [0, 5]);
    store.increaseBet();

    expect(store.startSpin()).toBe(true);
    expect(store.getSnapshot().phase).toBe('spinning');
    expect(store.getSnapshot().balance).toBe(15);

    store.settleSpin(12);

    const snapshot = store.getSnapshot();
    expect(snapshot.phase).toBe('idle');
    expect(snapshot.lastWin).toBe(12);
    expect(snapshot.balance).toBe(27);
  });

  it('considera not_idle como bloqueio de spin', () => {
    const store = new SlotStore(20, [0, 5]);
    store.increaseBet();
    store.setPhase('evaluating');

    expect(store.getSpinBlockReason()).toBe('not_idle');
    expect(store.canSpin()).toBe(false);
  });

  it('nao permite segundo startSpin enquanto nao estiver idle', () => {
    const store = new SlotStore(50, [0, 10]);
    store.increaseBet();
    expect(store.startSpin()).toBe(true);
    expect(store.startSpin()).toBe(false);
    expect(store.getSnapshot().phase).toBe('spinning');
  });

  it('nao altera aposta quando increaseBet ou decreaseBet fora de idle', () => {
    const store = new SlotStore(100, [5, 10, 15]);
    store.decreaseBet();
    store.decreaseBet();
    expect(store.getCurrentBet()).toBe(5);
    store.increaseBet();
    expect(store.getCurrentBet()).toBe(10);
    store.setPhase('spinning');
    store.increaseBet();
    store.decreaseBet();
    expect(store.getCurrentBet()).toBe(10);
  });

  it('limita decreaseBet no indice minimo', () => {
    const store = new SlotStore(100, [1, 5, 10]);
    store.decreaseBet();
    store.decreaseBet();
    expect(store.getCurrentBet()).toBe(1);
    store.decreaseBet();
    expect(store.getCurrentBet()).toBe(1);
  });

  it('permite spin com aposta zero sem alterar saldo', () => {
    const store = new SlotStore(100, [0]);
    expect(store.getCurrentBet()).toBe(0);
    expect(store.startSpin()).toBe(true);
    expect(store.getSnapshot().balance).toBe(100);
    store.settleSpin(0);
    expect(store.getSnapshot().balance).toBe(100);
  });

  it('subscribe notifica imediatamente e apos settle', () => {
    const calls: number[] = [];
    const store = new SlotStore(10, [0, 5]);
    const off = store.subscribe(() => {
      calls.push(store.getSnapshot().balance);
    });

    expect(calls.length).toBeGreaterThanOrEqual(1);
    const countAfterSubscribe = calls.length;
    store.increaseBet();
    expect(store.startSpin()).toBe(true);
    store.settleSpin(3);
    expect(calls.length).toBeGreaterThan(countAfterSubscribe);
    off();
  });

  it('getSnapshot retorna copia superficial do estado', () => {
    const store = new SlotStore(10, [0, 5]);
    const snap = store.getSnapshot();
    snap.balance = 999;
    expect(store.getSnapshot().balance).toBe(10);
  });
});
