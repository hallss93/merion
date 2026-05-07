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
});
