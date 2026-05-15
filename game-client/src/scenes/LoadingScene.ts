import { Container } from 'pixi.js';
import type { IScene } from './types';
import { LoadingView } from '../ui/components/LoadingView';

/** Tela exibida enquanto os assets iniciais carregam. */
export class LoadingScene implements IScene {
  public readonly container = new Container();
  private readonly view = new LoadingView();

  public constructor() {
    this.container.sortableChildren = true;
    this.container.addChild(this.view.container);
  }

  public onEnter(): void {
    this.view.setVisible(true);
  }

  public onExit(): void {
    this.view.setVisible(false);
  }

  public resize(width: number, height: number): void {
    this.view.resize(width, height);
  }
}
