import { Application, Container } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { LoadingScene } from '../scenes/LoadingScene';
import { HomeScene } from '../scenes/HomeScene';
import {
  loadAssetGroup,
  loadSequenceGroup,
  registerRuntimeAssets,
} from '../assets/assetLoader';

export class GameApp {
  private readonly hostElement: HTMLDivElement;
  private readonly pixiApp = new Application();
  private readonly rootContainer = new Container();
  private readonly sceneManager = new SceneManager(this.rootContainer);
  private readonly loadingScene = new LoadingScene();
  private readonly homeScene = new HomeScene();

  public constructor(hostElement: HTMLDivElement) {
    this.hostElement = hostElement;
  }

  public async start(): Promise<void> {
    await this.pixiApp.init({
      resizeTo: globalThis.window,
      antialias: true,
      autoDensity: true,
      background: '#000000',
      resolution: Math.min(globalThis.window.devicePixelRatio || 1, 2),
    });

    this.hostElement.replaceChildren(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.rootContainer);

    const { width, height } = this.pixiApp.screen;
    this.sceneManager.setScene(this.loadingScene, width, height);
    registerRuntimeAssets();

    this.bindResize();
    await Promise.all([
      loadAssetGroup('boot'),
      loadSequenceGroup('boot'),
      this.simulateInitialLoad(),
    ]);

    const nextSize = this.pixiApp.screen;
    this.sceneManager.setScene(this.homeScene, nextSize.width, nextSize.height);
    void Promise.all([loadAssetGroup('lazy'), loadSequenceGroup('lazy')]);
  }

  private bindResize(): void {
    this.pixiApp.renderer.on('resize', (newWidth: number, newHeight: number) => {
      this.sceneManager.resize(newWidth, newHeight);
    });
  }

  private async simulateInitialLoad(): Promise<void> {
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, 900);
    });
  }
}
