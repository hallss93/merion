import { Assets, Container, Sprite, Texture } from 'pixi.js';

/** Botão SPIN com feedback visual de hover e clique. */
export class SpinButton {
  public readonly container = new Container();
  private readonly spinSprite = new Sprite(Texture.EMPTY);
  private clickHandler: (() => void) | null = null;
  private enabled = true;
  private assetsReady = false;
  private static readonly HOVER_SCALE = 1.03;
  private static readonly PRESSED_SCALE = 0.98;

  public constructor() {
    this.container.addChild(this.spinSprite);
    this.spinSprite.eventMode = 'static';
    this.spinSprite.cursor = 'pointer';
    this.spinSprite.on('pointertap', () => {
      if (!this.enabled) {
        return;
      }
      this.clickHandler?.();
    });
    this.spinSprite.on('pointerover', () => {
      if (this.enabled) {
        this.spinSprite.scale.set(SpinButton.HOVER_SCALE);
      }
    });
    this.spinSprite.on('pointerdown', () => {
      if (this.enabled) {
        this.spinSprite.scale.set(SpinButton.PRESSED_SCALE);
      }
    });
    this.spinSprite.on('pointerup', () => {
      if (this.enabled) {
        this.spinSprite.scale.set(SpinButton.HOVER_SCALE);
      }
    });
    this.spinSprite.on('pointerout', () => {
      this.spinSprite.scale.set(1);
    });
  }

  /** Registra o callback do giro. */
  public onClick(handler: () => void): void {
    this.clickHandler = handler;
  }

  /** Habilita ou desabilita o botão. */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.alpha = enabled ? 1 : 0.5;
    this.spinSprite.cursor = enabled ? 'pointer' : 'default';
    this.spinSprite.eventMode = enabled ? 'static' : 'none';
  }

  /** Carrega a textura do botão spin. */
  public async ensureAssets(): Promise<void> {
    if (this.assetsReady) {
      return;
    }
    await Assets.load('/assets/ui/hud/spin.png');
    this.spinSprite.texture =
      (Assets.get('/assets/ui/hud/spin.png') as Texture | undefined) ?? Texture.EMPTY;
    this.assetsReady = true;
  }

  public getSize(): { width: number; height: number } {
    return {
      width: this.spinSprite.width,
      height: this.spinSprite.height,
    };
  }
}
