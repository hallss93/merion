import { Assets, Container, Sprite, Texture } from 'pixi.js';

/** Botão para embaralhar os símbolos na grade (fora do giro). */
export class ReloadButton {
  public readonly container = new Container();
  private readonly reloadSprite = new Sprite(Texture.EMPTY);
  private clickHandler: (() => void) | null = null;
  private enabled = true;
  private assetsReady = false;
  private static readonly HOVER_SCALE = 1.03;
  private static readonly PRESSED_SCALE = 0.98;

  public constructor() {
    this.container.addChild(this.reloadSprite);
    this.reloadSprite.eventMode = 'static';
    this.reloadSprite.cursor = 'pointer';
    this.reloadSprite.on('pointertap', () => {
      if (!this.enabled) {
        return;
      }
      this.clickHandler?.();
    });
    this.reloadSprite.on('pointerover', () => {
      if (this.enabled) {
        this.reloadSprite.scale.set(ReloadButton.HOVER_SCALE);
      }
    });
    this.reloadSprite.on('pointerdown', () => {
      if (this.enabled) {
        this.reloadSprite.scale.set(ReloadButton.PRESSED_SCALE);
      }
    });
    this.reloadSprite.on('pointerup', () => {
      if (this.enabled) {
        this.reloadSprite.scale.set(ReloadButton.HOVER_SCALE);
      }
    });
    this.reloadSprite.on('pointerout', () => {
      this.reloadSprite.scale.set(1);
    });
  }

  /** Registra o callback do reload. */
  public onClick(handler: () => void): void {
    this.clickHandler = handler;
  }

  /** Habilita ou desabilita o botão. */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.alpha = enabled ? 1 : 0.5;
    this.reloadSprite.cursor = enabled ? 'pointer' : 'default';
    this.reloadSprite.eventMode = enabled ? 'static' : 'none';
  }

  /** Carrega a textura do botão reload. */
  public async ensureAssets(): Promise<void> {
    if (this.assetsReady) {
      return;
    }
    await Assets.load('/assets/ui/hud/reload.png');
    this.reloadSprite.texture =
      (Assets.get('/assets/ui/hud/reload.png') as Texture | undefined) ?? Texture.EMPTY;
    this.assetsReady = true;
  }

  public getSize(): { width: number; height: number } {
    return {
      width: this.reloadSprite.width,
      height: this.reloadSprite.height,
    };
  }
}
