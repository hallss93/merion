import type { Container } from 'pixi.js';
import type { IScene } from '../scenes/types';

/** Troca a cena visível (Loading, Game, etc.) no container raiz. */
export class SceneManager {
  private readonly sceneRoot: Container;
  private currentScene: IScene | null = null;

  public constructor(sceneRoot: Container) {
    this.sceneRoot = sceneRoot;
  }

  /** Remove a cena atual, entra na nova e aplica o tamanho da tela. */
  public setScene(nextScene: IScene, width: number, height: number): void {
    if (this.currentScene) {
      this.currentScene.onExit();
      this.sceneRoot.removeChild(this.currentScene.container);
    }

    this.currentScene = nextScene;
    this.sceneRoot.addChild(nextScene.container);
    nextScene.resize(width, height);
    nextScene.onEnter();
  }

  /** Atualiza layout da cena ativa ao redimensionar. */
  public resize(width: number, height: number): void {
    this.currentScene?.resize(width, height);
  }
}
