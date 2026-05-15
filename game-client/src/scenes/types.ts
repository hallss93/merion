import type { Container } from 'pixi.js';

/** Contrato das cenas Pixi: container + ciclo de vida e resize. */
export interface IScene {
  readonly container: Container;
  onEnter(): void;
  onExit(): void;
  resize(width: number, height: number): void;
}
