import type { Container } from 'pixi.js';

export interface IScene {
  readonly container: Container;
  onEnter(): void;
  onExit(): void;
  resize(width: number, height: number): void;
}
