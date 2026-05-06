import { Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { LOADING_VIEW_CONFIG } from '../../config/loadingViewConfig';

export class LoadingView {
  public readonly container = new Container();

  private readonly fallbackBackground = new Graphics();
  private readonly preloaderSprite = new Sprite(Texture.EMPTY);
  private foxSpine: Spine | null = null;
  private readonly label = new Text({
    text: LOADING_VIEW_CONFIG.label.text,
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: LOADING_VIEW_CONFIG.label.fontSize,
      fontWeight: '700',
    },
  });

  public constructor() {
    this.container.sortableChildren = true;
    this.container.addChild(this.fallbackBackground);
    this.container.addChild(this.preloaderSprite);
    this.container.addChild(this.label);
    this.preloaderSprite.zIndex = LOADING_VIEW_CONFIG.preloader.zIndex;
  }

  public setVisible(isVisible: boolean): void {
    this.container.visible = isVisible;
  }

  public resize(width: number, height: number): void {
    this.loadPreloaderTexture();
    this.fitCover(this.preloaderSprite, width, height);
    this.ensureFoxSpine();
    this.positionFox(width, height);
    this.label.visible = !this.hasPreloader();

    this.fallbackBackground.clear();
    this.fallbackBackground.rect(0, 0, width, height).fill(LOADING_VIEW_CONFIG.fallbackColor);
    this.fallbackBackground.visible = !this.hasPreloader();

    this.label.anchor.set(0.5);
    this.label.x = width * 0.5;
    this.label.y = height * 0.5;
  }

  private ensureFoxSpine(): void {
    if (this.foxSpine) {
      return;
    }

    try {
      const spine = Spine.from({
        skeleton: 'spine_fox_json',
        atlas: 'spine_fox_atlas',
        autoUpdate: true,
      });
      spine.state.setAnimation(0, 'Idle', true);
      spine.state.timeScale = LOADING_VIEW_CONFIG.spineSpeedMultiplier;
      spine.zIndex = LOADING_VIEW_CONFIG.fox.zIndex;
      this.foxSpine = spine;
      this.container.addChild(spine);
    } catch {
      this.foxSpine = null;
    }
  }

  private positionFox(width: number, height: number): void {
    if (!this.foxSpine) {
      return;
    }

    const widthRatio = Math.max(
      LOADING_VIEW_CONFIG.fox.minWidthRatio,
      Math.min(width / 1920, 1),
    );
    const targetHeight =
      height *
      (LOADING_VIEW_CONFIG.fox.targetHeightBase +
        widthRatio * LOADING_VIEW_CONFIG.fox.targetHeightWidthRatioFactor);
    const spineBounds = this.foxSpine.getLocalBounds();
    const safeHeight = Math.max(spineBounds.height, 1);
    const scale = targetHeight / safeHeight;

    this.foxSpine.scale.set(-scale, scale);

    // Move para a direita em telas estreitas para preservar composição.
    const foxX =
      width * (LOADING_VIEW_CONFIG.fox.xBase - widthRatio * LOADING_VIEW_CONFIG.fox.xWidthRatioFactor);
    const foxY =
      height * (LOADING_VIEW_CONFIG.fox.yBase - widthRatio * LOADING_VIEW_CONFIG.fox.yWidthRatioFactor);
    this.foxSpine.position.set(foxX, foxY);
  }

  private loadPreloaderTexture(): void {
    const preloader = Assets.get('preloader_full') as Texture | undefined;
    if (preloader) {
      this.preloaderSprite.texture = preloader;
    }
  }

  private fitCover(sprite: Sprite, width: number, height: number): void {
    const baseWidth = sprite.texture.width || 1;
    const baseHeight = sprite.texture.height || 1;
    const scale = Math.max(width / baseWidth, height / baseHeight);
    sprite.scale.set(scale);
    sprite.position.set((width - baseWidth * scale) * 0.5, (height - baseHeight * scale) * 0.5);
  }

  private hasPreloader(): boolean {
    return this.preloaderSprite.texture !== Texture.EMPTY;
  }
}
