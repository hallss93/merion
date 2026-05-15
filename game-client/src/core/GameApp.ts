import { Application, Container } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { LoadingScene } from '../scenes/LoadingScene';
import { GameScene } from '../scenes/GameScene';
import { AssetService } from '../services/AssetService';

/** Inicializa o Pixi, carrega assets e alterna Loading → Game. */
export class GameApp {
  private readonly hostElement: HTMLDivElement;
  private readonly pixiApp = new Application();
  private readonly rootContainer = new Container();
  private readonly sceneManager = new SceneManager(this.rootContainer);
  private readonly loadingScene = new LoadingScene();
  private readonly gameScene = new GameScene();
  private readonly assetService = new AssetService();

  public constructor(hostElement: HTMLDivElement) {
    this.hostElement = hostElement;
  }

  /** Monta o canvas, registra assets e exibe a cena do slot. */
  public async start(): Promise<void> {
    await this.pixiApp.init({
      resizeTo: globalThis.window,
      antialias: true,
      autoDensity: true,
      background: '#000000',
      backgroundAlpha: 0,
      resolution: Math.min(globalThis.window.devicePixelRatio || 1, 2),
    });

    this.hostElement.tabIndex = 0;
    this.hostElement.setAttribute('role', 'application');
    this.hostElement.setAttribute(
      'aria-label',
      'Caça-níqueis: use Tab para focar esta área; Espaço ou Enter para girar quando o jogo permitir.',
    );
    this.hostElement.replaceChildren(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.rootContainer);

    this.assetService.registerAssets();
    await this.assetService.preloadLoadingScreen();

    this.bindResize();
    const { width, height } = this.pixiApp.screen;
    this.sceneManager.setScene(this.loadingScene, width, height);
    await Promise.all([this.assetService.preloadBoot(), this.simulateInitialLoad()]);

    const nextSize = this.pixiApp.screen;
    this.sceneManager.setScene(this.gameScene, nextSize.width, nextSize.height);
  }

  /** Repassa redimensionamento da janela para a cena ativa. */
  private bindResize(): void {
    this.pixiApp.renderer.on('resize', (newWidth: number, newHeight: number) => {
      this.sceneManager.resize(newWidth, newHeight);
    });
  }

  /** Pausa mínima na tela de loading antes de abrir o jogo. */
  private async simulateInitialLoad(): Promise<void> {
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, 3000);
    });
  }
}
