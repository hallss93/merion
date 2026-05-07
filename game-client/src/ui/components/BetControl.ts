import { Assets, Container, Sprite, Texture } from 'pixi.js';

export class BetControl {
  public readonly container = new Container();
  private readonly controlSprite = new Sprite(Texture.EMPTY);
  private readonly hitAreaSprite = new Sprite(Texture.EMPTY);
  private enabled = true;
  private onIncreaseHandler: (() => void) | null = null;
  private onDecreaseHandler: (() => void) | null = null;
  private assetsReady = false;
  private static readonly HOVER_SCALE = 1.03;
  private static readonly PRESSED_SCALE = 0.98;

  public constructor() {
    this.controlSprite.blendMode = 'normal';
    this.container.addChild(this.controlSprite);
    this.container.addChild(this.hitAreaSprite);
    this.hitAreaSprite.alpha = 0.001;
    this.hitAreaSprite.eventMode = 'static';
    this.hitAreaSprite.cursor = 'pointer';
    this.hitAreaSprite.on('pointerover', () => {
      if (this.enabled) {
        this.controlSprite.scale.set(BetControl.HOVER_SCALE);
      }
    });
    this.hitAreaSprite.on('pointerdown', () => {
      if (this.enabled) {
        this.controlSprite.scale.set(BetControl.PRESSED_SCALE);
      }
    });
    this.hitAreaSprite.on('pointerup', () => {
      if (this.enabled) {
        this.controlSprite.scale.set(BetControl.HOVER_SCALE);
      }
    });
    this.hitAreaSprite.on('pointerout', () => {
      this.controlSprite.scale.set(1);
    });
    this.hitAreaSprite.on('pointertap', (event) => {
      if (!this.enabled) {
        return;
      }
      const local = event.getLocalPosition(this.hitAreaSprite);
      if (local.y <= this.hitAreaSprite.height * 0.5) {
        this.onIncreaseHandler?.();
      } else {
        this.onDecreaseHandler?.();
      }
    });
  }

  public onIncrease(handler: () => void): void {
    this.onIncreaseHandler = handler;
  }

  public onDecrease(handler: () => void): void {
    this.onDecreaseHandler = handler;
  }

  public setValue(value: number): void {
    if (!Number.isFinite(value)) {
      return;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.alpha = enabled ? 1 : 0.5;
    this.container.cursor = enabled ? 'pointer' : 'default';
    this.hitAreaSprite.eventMode = enabled ? 'static' : 'none';
  }

  public async ensureAssets(): Promise<void> {
    if (this.assetsReady) {
      return;
    }
    await Assets.load('/assets/ui/hud/cima-baixo.png');
    const texture = (Assets.get('/assets/ui/hud/cima-baixo.png') as Texture | undefined) ?? Texture.EMPTY;
    this.controlSprite.texture = texture;
    this.hitAreaSprite.texture = texture;
    this.assetsReady = true;
  }

  public getSize(): { width: number; height: number } {
    return {
      width: this.controlSprite.width,
      height: this.controlSprite.height,
    };
  }
}
