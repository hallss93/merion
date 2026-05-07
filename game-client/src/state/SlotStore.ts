import type { SlotPhase, SpinBlockReason } from '../domain/slot/SlotTypes';
import { SLOT_BET_OPTIONS } from '../domain/slot/SlotRules';

export interface SlotState {
  balance: number;
  betOptions: number[];
  betIndex: number;
  lastWin: number;
  phase: SlotPhase;
}

type Subscriber = (state: SlotState) => void;

export class SlotStore {
  private readonly state: SlotState;
  private readonly subscribers = new Set<Subscriber>();

  public constructor(
    initialBalance = 0,
    betOptions: number[] = [...SLOT_BET_OPTIONS],
  ) {
    this.state = {
      balance: initialBalance,
      betOptions,
      betIndex: 0,
      lastWin: 0,
      phase: 'idle',
    };
  }

  public getSnapshot(): SlotState {
    return { ...this.state };
  }

  public getCurrentBet(): number {
    return this.state.betOptions[this.state.betIndex] ?? 0;
  }

  public canSpin(): boolean {
    return this.getSpinBlockReason() === null;
  }

  public getSpinBlockReason(): SpinBlockReason {
    if (this.state.phase !== 'idle') {
      return 'not_idle';
    }
    if (this.state.balance < this.getCurrentBet()) {
      return 'insufficient_balance';
    }
    return null;
  }

  public increaseBet(): void {
    if (this.state.phase !== 'idle') {
      return;
    }
    this.state.betIndex = Math.min(this.state.betIndex + 1, this.state.betOptions.length - 1);
    this.emit();
  }

  public decreaseBet(): void {
    if (this.state.phase !== 'idle') {
      return;
    }
    this.state.betIndex = Math.max(this.state.betIndex - 1, 0);
    this.emit();
  }

  public startSpin(): boolean {
    if (!this.canSpin()) {
      return false;
    }

    const bet = this.getCurrentBet();
    this.state.balance = Number((this.state.balance - bet).toFixed(2));
    this.state.lastWin = 0;
    this.state.phase = 'spinning';
    this.emit();
    return true;
  }

  public setPhase(phase: SlotPhase): void {
    this.state.phase = phase;
    this.emit();
  }

  public settleSpin(totalWin: number): void {
    this.state.lastWin = Number(totalWin.toFixed(2));
    this.state.balance = Number((this.state.balance + totalWin).toFixed(2));
    this.state.phase = 'idle';
    this.emit();
  }

  public subscribe(subscriber: Subscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.getSnapshot());
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    for (const subscriber of this.subscribers) {
      subscriber(snapshot);
    }
  }
}
