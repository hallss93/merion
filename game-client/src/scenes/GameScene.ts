import { AnimatedSprite, Assets, Container, Sprite, Texture } from 'pixi.js';
import type { IScene } from './types';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

interface SymbolDefinition {
  folder: string;
  prefix: string;
}

export class GameScene implements IScene {
  public readonly container = new Container();
  private readonly backgroundSprite = new Sprite(Texture.EMPTY);
  private readonly reelsContainer = new Container();
  private foxSpine: Spine | null = null;
  private readonly reelSprites: AnimatedSprite[] = [];
  private symbolsReady = false;
  private currentSymbolMode: 'objects' | 'coins' | null = null;
  private lastWidth = 1920;
  private lastHeight = 1080;
  private readonly objectSymbolDefinitions: SymbolDefinition[] = [
    { folder: 'Bank', prefix: 'Bank_' },
    { folder: 'Cell', prefix: 'Cell_' },
    { folder: 'Dynamit', prefix: 'Dynamit_' },
    { folder: 'Handcuffs', prefix: 'Handcuffs_' },
    { folder: 'Littera_A', prefix: 'Littera_A_' },
    { folder: 'Littera_J', prefix: 'Littera_J_' },
    { folder: 'Littera_K', prefix: 'Littera_K_' },
    { folder: 'Littera_Q', prefix: 'Littera_Q_' },
    { folder: 'Number_10', prefix: 'Number_10_' },
    { folder: 'Safe', prefix: 'Safe_' },
  ];
  private readonly coinSymbolDefinitions: SymbolDefinition[] = [
    { folder: 'Bronze_coin_1', prefix: 'Bronze_coin_1_' },
    { folder: 'Bronze_coin_2', prefix: 'Bronze_coin_2_' },
    { folder: 'Bronze_coin_3', prefix: 'Bronze_coin_3_' },
    { folder: 'Bronze_coin_4', prefix: 'Bronze_coin_4_' },
    { folder: 'Silver_coin_1', prefix: 'Silver_coin_1_' },
    { folder: 'Silver_coin_2', prefix: 'Silver_coin_2_' },
    { folder: 'Silver_coin_3', prefix: 'Silver_coin_3_' },
    { folder: 'Silver_coin_4', prefix: 'Silver_coin_4_' },
    { folder: 'Golden_coin_1', prefix: 'Golden_coin_1_' },
    { folder: 'Golden_coin_2', prefix: 'Golden_coin_2_' },
    { folder: 'Golden_coin_3', prefix: 'Golden_coin_3_' },
    { folder: 'Golden_coin_4', prefix: 'Golden_coin_4_' },
  ];

  public constructor() {
    this.container.sortableChildren = true;
    this.container.addChild(this.backgroundSprite);
    this.reelsContainer.zIndex = 5;
    this.container.addChild(this.reelsContainer);
  }

  public onEnter(): void {
    this.container.visible = true;
    this.ensureFoxSpine();
    void this.ensureReelSymbols();

    const texture = Assets.get('main_game_screen') as Texture | undefined;
    if (texture) {
      this.backgroundSprite.texture = texture;
      this.resize(this.lastWidth, this.lastHeight);
      return;
    }

    void this.loadMainGameTexture();
  }

  public onExit(): void {
    for (const sprite of this.reelSprites) {
      sprite.stop();
    }
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

    this.layoutReels();
    this.positionFox(width, height);
  }

  private async loadMainGameTexture(): Promise<void> {
    const texture = await Assets.load<Texture>('main_game_screen');
    this.backgroundSprite.texture = texture;
    this.resize(this.lastWidth, this.lastHeight);
  }

  private async ensureReelSymbols(): Promise<void> {
    const symbolDefinitions = this.getActiveSymbolDefinitions();
    const nextMode: 'objects' | 'coins' = this.isCoinRoute() ? 'coins' : 'objects';
    if (!this.symbolsReady) {
      const urls = symbolDefinitions.flatMap((symbol) =>
        this.buildSymbolUrls(symbol),
      );
      await Assets.load(urls);
      this.createReelGrid(symbolDefinitions, true);
      this.symbolsReady = true;
      this.currentSymbolMode = nextMode;
    } else if (this.currentSymbolMode !== nextMode || nextMode === 'coins' || nextMode === 'objects') {
      this.createReelGrid(symbolDefinitions, true);
      this.currentSymbolMode = nextMode;
    }

    this.layoutReels();

    for (const sprite of this.reelSprites) {
      if (!sprite.playing) {
        sprite.play();
      }
    }
  }

  private buildSymbolUrls(symbol: SymbolDefinition): string[] {
    const urls: string[] = [];
    for (let i = 0; i <= 45; i += 1) {
      const frame = String(i).padStart(2, '0');
      urls.push(
        `/assets/sequences/${this.getSequenceGroupFolder()}/${symbol.folder}/${symbol.prefix}${frame}.png`,
      );
    }
    return urls;
  }

  private createReelGrid(
    symbolDefinitions: SymbolDefinition[],
    randomizeOrder: boolean,
  ): void {
    for (const sprite of this.reelSprites) {
      sprite.stop();
      sprite.destroy();
    }
    this.reelSprites.length = 0;
    this.reelsContainer.removeChildren();

    const columns = 6;
    const rows = 5;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const symbol = randomizeOrder
          ? symbolDefinitions[Math.floor(Math.random() * symbolDefinitions.length)]
          : symbolDefinitions[(row * columns + col) % symbolDefinitions.length];
        const textures = this.buildSymbolUrls(symbol)
          .map((url) => Assets.get(url) as Texture | undefined)
          .filter((texture): texture is Texture => Boolean(texture));
        if (textures.length === 0) {
          continue;
        }

        const sprite = new AnimatedSprite(textures);
        sprite.anchor.set(0.5);
        sprite.loop = true;
        sprite.animationSpeed = 0.18 + ((row + col) % 4) * 0.02;
        sprite.gotoAndPlay((row + col * 3) % textures.length);
        sprite.zIndex = 6;
        this.reelsContainer.addChild(sprite);
        this.reelSprites.push(sprite);
      }
    }
  }

  private layoutReels(): void {
    if (this.reelSprites.length === 0) {
      return;
    }
    if (this.backgroundSprite.texture === Texture.EMPTY) {
      return;
    }

    const columns = 6;
    const rows = 5;
    const backgroundWidth = this.backgroundSprite.texture.width * this.backgroundSprite.scale.x;
    const backgroundHeight =
      this.backgroundSprite.texture.height * this.backgroundSprite.scale.y;
    const backgroundX = this.backgroundSprite.x;
    const backgroundY = this.backgroundSprite.y;

    // Ratios calibrados com base no layout do `main scene 1.png`.
    const startX = backgroundX + backgroundWidth * 0.266;
    const endX = backgroundX + backgroundWidth * 0.715;
    const startY = backgroundY + backgroundHeight * 0.208;
    const endY = backgroundY + backgroundHeight * 0.803;
    const stepX = (endX - startX) / (columns - 1);
    const stepY = (endY - startY) / (rows - 1);
    const targetCellHeight = backgroundHeight * 0.112;

    let index = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const sprite = this.reelSprites[index];
        index += 1;
        if (!sprite) {
          continue;
        }

        const bounds = sprite.getLocalBounds();
        const safeHeight = Math.max(bounds.height, 1);
        const scale = targetCellHeight / safeHeight;
        sprite.scale.set(scale);
        sprite.position.set(startX + col * stepX, startY + row * stepY);
      }
    }
  }

  private getSequenceGroupFolder(): 'Objects' | 'Coins' {
    return this.isCoinRoute() ? 'Coins' : 'Objects';
  }

  private getActiveSymbolDefinitions(): SymbolDefinition[] {
    return this.isCoinRoute()
      ? this.coinSymbolDefinitions
      : this.objectSymbolDefinitions;
  }

  private isCoinRoute(): boolean {
    return globalThis.location.pathname.toLowerCase().includes('/coins');
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
