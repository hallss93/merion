import type { Container } from 'pixi.js';
import type { IScene } from '../scenes/types';

export class SceneManager {
  private readonly sceneRoot: Container;
  private currentScene: IScene | null = null;

  public constructor(sceneRoot: Container) {
    this.sceneRoot = sceneRoot;
  }

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

  public resize(width: number, height: number): void {
    this.currentScene?.resize(width, height);
  }
}
