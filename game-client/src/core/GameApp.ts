import { Application, Container } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { LoadingScene } from '../scenes/LoadingScene';
import { HomeScene } from '../scenes/HomeScene';

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
      resizeTo: window,
      antialias: true,
      autoDensity: true,
      background: '#000000',
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    this.hostElement.replaceChildren(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.rootContainer);

    const { width, height } = this.pixiApp.screen;
    this.sceneManager.setScene(this.loadingScene, width, height);

    this.bindResize();
    await this.simulateInitialLoad();

    const nextSize = this.pixiApp.screen;
    this.sceneManager.setScene(this.homeScene, nextSize.width, nextSize.height);
  }

  private bindResize(): void {
    this.pixiApp.renderer.on('resize', (newWidth: number, newHeight: number) => {
      this.sceneManager.resize(newWidth, newHeight);
    });
  }

  private async simulateInitialLoad(): Promise<void> {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 900);
    });
  }
}
