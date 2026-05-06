import { Application, Container } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { LoadingScene } from '../scenes/LoadingScene';
import { HomeScene } from '../scenes/HomeScene';
import { AssetService } from '../services/AssetService';
import { AudioService } from '../services/AudioService';
import { AnimationService } from '../services/AnimationService';

export class GameApp {
  private readonly hostElement: HTMLDivElement;
  private readonly pixiApp = new Application();
  private readonly rootContainer = new Container();
  private readonly sceneManager = new SceneManager(this.rootContainer);
  private readonly loadingScene = new LoadingScene();
  private readonly assetService = new AssetService();
  private readonly audioService = new AudioService();
  private readonly animationService = new AnimationService();
  private readonly homeScene = new HomeScene(
    this.audioService,
    this.animationService,
  );

  public constructor(hostElement: HTMLDivElement) {
    this.hostElement = hostElement;
  }

  public async start(): Promise<void> {
    await this.pixiApp.init({
      resizeTo: globalThis.window,
      antialias: true,
      autoDensity: true,
      background: '#000000',
      backgroundAlpha: 0,
      resolution: Math.min(globalThis.window.devicePixelRatio || 1, 2),
    });

    this.hostElement.replaceChildren(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.rootContainer);

    const { width, height } = this.pixiApp.screen;
    this.sceneManager.setScene(this.loadingScene, width, height);
    this.assetService.registerAssets();

    this.bindResize();
    await Promise.all([this.assetService.preloadBoot(), this.simulateInitialLoad()]);

    const nextSize = this.pixiApp.screen;
    this.sceneManager.setScene(this.homeScene, nextSize.width, nextSize.height);
    void this.assetService.preloadLazy();
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
