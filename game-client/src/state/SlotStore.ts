import type { SlotPhase, SpinBlockReason } from '../domain/slot/SlotTypes';
import {
  SLOT_BET_OPTIONS,
  SLOT_DEFAULT_BET_INDEX,
  SLOT_INITIAL_BALANCE,
} from '../domain/slot/SlotRules';

export interface SlotState {
  balance: number;
  betOptions: number[];
  betIndex: number;
  lastWin: number;
  phase: SlotPhase;
}

type Subscriber = (state: SlotState) => void;

/** Estado do jogador: saldo, aposta, fase da rodada e último ganho. */
export class SlotStore {
  private readonly state: SlotState;
  private readonly subscribers = new Set<Subscriber>();

  public constructor(
    initialBalance = SLOT_INITIAL_BALANCE,
    betOptions: number[] = [...SLOT_BET_OPTIONS],
  ) {
    const safeBetIndex = Math.max(0, Math.min(SLOT_DEFAULT_BET_INDEX, betOptions.length - 1));
    this.state = {
      balance: initialBalance,
      betOptions,
      betIndex: safeBetIndex,
      lastWin: 0,
      phase: 'idle',
    };
  }

  /** Cópia do estado atual para a UI ler sem mutar. */
  public getSnapshot(): SlotState {
    return { ...this.state };
  }

  /** Valor da aposta selecionada agora. */
  public getCurrentBet(): number {
    return this.state.betOptions[this.state.betIndex] ?? 0;
  }

  /** True se estiver idle e com saldo suficiente. */
  public canSpin(): boolean {
    return this.getSpinBlockReason() === null;
  }

  /** Motivo pelo qual o giro está bloqueado, ou null se pode girar. */
  public getSpinBlockReason(): SpinBlockReason {
    if (this.state.phase !== 'idle') {
      return 'not_idle';
    }
    if (this.state.balance < this.getCurrentBet()) {
      return 'insufficient_balance';
    }
    return null;
  }

  /** Sobe um nível na lista de apostas (só em idle). */
  public increaseBet(): void {
    if (this.state.phase !== 'idle') {
      return;
    }
    this.state.betIndex = Math.min(this.state.betIndex + 1, this.state.betOptions.length - 1);
    this.emit();
  }

  /** Desce um nível na lista de apostas (só em idle). */
  public decreaseBet(): void {
    if (this.state.phase !== 'idle') {
      return;
    }
    this.state.betIndex = Math.max(this.state.betIndex - 1, 0);
    this.emit();
  }

  /** Debita a aposta e entra em spinning; retorna false se não puder girar. */
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

  /** Atualiza a fase da rodada (spinning, showingWin, etc.). */
  public setPhase(phase: SlotPhase): void {
    this.state.phase = phase;
    this.emit();
  }

  /** Credita o ganho, grava lastWin e volta para idle. */
  public settleSpin(totalWin: number): void {
    this.state.lastWin = Number(totalWin.toFixed(2));
    this.state.balance = Number((this.state.balance + totalWin).toFixed(2));
    this.state.phase = 'idle';
    this.emit();
  }

  /** Inscreve callback na mudança de estado; retorna função para cancelar. */
  public subscribe(subscriber: Subscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.getSnapshot());
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  /** Notifica todos os inscritos com o estado atual. */
  private emit(): void {
    const snapshot = this.getSnapshot();
    for (const subscriber of this.subscribers) {
      subscriber(snapshot);
    }
  }
}
