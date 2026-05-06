import { Assets, Container, Sprite, Texture } from 'pixi.js';
import type { IScene } from './types';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

export class GameScene implements IScene {
  public readonly container = new Container();
  private readonly backgroundSprite = new Sprite(Texture.EMPTY);
  private foxSpine: Spine | null = null;
  private lastWidth = 1920;
  private lastHeight = 1080;

  public constructor() {
    this.container.sortableChildren = true;
    this.container.addChild(this.backgroundSprite);
  }

  public onEnter(): void {
    this.container.visible = true;
    this.ensureFoxSpine();

    const texture = Assets.get('main_game_screen') as Texture | undefined;
    if (texture) {
      this.backgroundSprite.texture = texture;
      this.resize(this.lastWidth, this.lastHeight);
      return;
    }

    void this.loadMainGameTexture();
  }

  public onExit(): void {
    this.container.visible = false;
  }

  public resize(width: number, height: number): void {
    this.lastWidth = width;
    this.lastHeight = height;
    const baseWidth = this.backgroundSprite.texture.width || 1;
    const baseHeight = this.backgroundSprite.texture.height || 1;
    const scale = Math.max(width / baseWidth, height / baseHeight);
    this.backgroundSprite.scale.set(scale);
    this.backgroundSprite.position.set(
      (width - baseWidth * scale) * 0.5,
      (height - baseHeight * scale) * 0.5,
    );

    this.positionFox(width, height);
  }

  private async loadMainGameTexture(): Promise<void> {
    const texture = await Assets.load<Texture>('main_game_screen');
    this.backgroundSprite.texture = texture;
    this.resize(this.lastWidth, this.lastHeight);
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
      spine.zIndex = 10;
      this.foxSpine = spine;
      this.container.addChild(spine);
      this.positionFox(this.lastWidth, this.lastHeight);
    } catch {
      this.foxSpine = null;
    }
  }

  private positionFox(width: number, height: number): void {
    if (!this.foxSpine) {
      return;
    }

    const widthRatio = Math.max(0.5, Math.min(width / 1920, 1));
    const targetHeight = height * (0.3 + widthRatio * 0.16);
    const spineBounds = this.foxSpine.getLocalBounds();
    const safeHeight = Math.max(spineBounds.height, 1);
    const scale = targetHeight / safeHeight;

    this.foxSpine.scale.set(-scale, scale);
    const foxX = width * (0.92 - widthRatio * 0.05);
    const foxY = height * (0.73 - widthRatio * 0.06);
    this.foxSpine.position.set(foxX, foxY);
  }
}
