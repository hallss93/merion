import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { ImageNumberDisplay } from './ImageNumberDisplay';

const PANEL_BASE_SIZE = {
  balance: { width: 217, height: 127 },
  win: { width: 360, height: 145 },
  bet: { width: 186, height: 126 },
} as const;

const PANEL_TARGET_HEIGHT = 128;
const PANEL_GAP = 0;
const BALANCE_MAX = 9_999;
const WIN_MAX = 9_999_999;
const BET_MAX = 999;

export class BalancePanel {
  public readonly container = new Container();
  public readonly valuesGroup = new Container();
  private readonly balanceSprite = new Sprite(Texture.EMPTY);
  private readonly betSprite = new Sprite(Texture.EMPTY);
  private readonly winSprite = new Sprite(Texture.EMPTY);
  private readonly balanceDisplay = new ImageNumberDisplay({}, -10, 44, 4);
  private readonly betDisplay = new ImageNumberDisplay({}, -6, 44);
  private readonly winDisplay = new ImageNumberDisplay({}, -10, 44, 4);
  private digitsReady = false;

  public constructor() {
    this.valuesGroup.sortableChildren = true;
    this.balanceSprite.blendMode = 'normal';
    this.betSprite.blendMode = 'normal';
    this.winSprite.blendMode = 'normal';
    this.balanceSprite.zIndex = 1;
    this.winSprite.zIndex = 2;
    this.betSprite.zIndex = 3;
    this.balanceDisplay.container.zIndex = 11;
    this.winDisplay.container.zIndex = 12;
    this.betDisplay.container.zIndex = 13;
    this.container.addChild(this.valuesGroup);
    this.valuesGroup.addChild(this.balanceSprite);
    this.valuesGroup.addChild(this.betSprite);
    this.valuesGroup.addChild(this.winSprite);
    this.valuesGroup.addChild(this.balanceDisplay.container);
    this.valuesGroup.addChild(this.betDisplay.container);
    this.valuesGroup.addChild(this.winDisplay.container);
    this.redraw();
  }

  public async ensureAssets(): Promise<void> {
    if (this.digitsReady) {
      return;
    }

    const urls = [
      '/assets/ui/hud/balance.png',
      '/assets/ui/hud/bet.png',
      '/assets/ui/hud/win.png',
      '/assets/ui/hud/comma.png',
      ...Array.from({ length: 10 }, (_, n) => `/assets/ui/hud/${n}.png`),
    ];
    await Assets.load(urls);

    const textureMap: Record<string, Texture> = {
      ',': (Assets.get('/assets/ui/hud/comma.png') as Texture | undefined) ?? Texture.EMPTY,
    };
    for (let n = 0; n <= 9; n += 1) {
      textureMap[String(n)] =
        (Assets.get(`/assets/ui/hud/${n}.png`) as Texture | undefined) ?? Texture.EMPTY;
    }

    this.balanceSprite.texture =
      (Assets.get('/assets/ui/hud/balance.png') as Texture | undefined) ?? Texture.EMPTY;
    this.betSprite.texture =
      (Assets.get('/assets/ui/hud/bet.png') as Texture | undefined) ?? Texture.EMPTY;
    this.winSprite.texture =
      (Assets.get('/assets/ui/hud/win.png') as Texture | undefined) ?? Texture.EMPTY;

    this.balanceDisplay.setTextureMap(textureMap);
    this.betDisplay.setTextureMap(textureMap);
    this.winDisplay.setTextureMap(textureMap);
    this.digitsReady = true;
    this.redraw();
  }

  public update(balance: number, bet: number, win: number): void {
    if (!this.digitsReady) {
      return;
    }
    const safeBalance = this.clampToInteger(balance, BALANCE_MAX);
    const safeBet = this.clampToInteger(bet, BET_MAX);
    const safeWin = this.clampToInteger(win, WIN_MAX);
    this.balanceDisplay.setText(this.formatBalance(safeBalance));
    this.betDisplay.setText(this.formatBet(safeBet));
    this.winDisplay.setText(this.formatWin(safeWin));
  }

  public getSize(): { width: number; height: number } {
    const bounds = this.valuesGroup.getLocalBounds();
    const width = bounds.width * this.valuesGroup.scale.x;
    const height = bounds.height * this.valuesGroup.scale.y;
    return { width, height };
  }

  public setGroupScale(scale: number): void {
    this.valuesGroup.scale.set(scale);
  }

  private redraw(): void {
    const balanceScale = PANEL_TARGET_HEIGHT / PANEL_BASE_SIZE.balance.height;
    const winScale = PANEL_TARGET_HEIGHT / PANEL_BASE_SIZE.win.height;
    const betScale = PANEL_TARGET_HEIGHT / PANEL_BASE_SIZE.bet.height;

    this.balanceSprite.scale.set(balanceScale);
    this.winSprite.scale.set(winScale);
    this.betSprite.scale.set(betScale);

    const balanceWidth = PANEL_BASE_SIZE.balance.width * balanceScale;
    const winWidth = PANEL_BASE_SIZE.win.width * winScale;

    this.balanceSprite.position.set(0, 0);
    this.winSprite.position.set(balanceWidth + PANEL_GAP, 0);
    this.betSprite.position.set(balanceWidth + PANEL_GAP + winWidth + PANEL_GAP, 0);

    this.balanceDisplay.container.position.set(
      this.balanceSprite.x + balanceWidth * 0.6,
      PANEL_TARGET_HEIGHT * 0.54,
    );
    this.winDisplay.container.position.set(
      this.winSprite.x + winWidth * 0.56,
      PANEL_TARGET_HEIGHT * 0.58,
    );
    this.betDisplay.container.position.set(
      this.betSprite.x + this.betSprite.width * 0.6,
      PANEL_TARGET_HEIGHT * 0.54,
    );
  }

  private clampToInteger(value: number, max: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    const normalized = Math.max(0, Math.floor(value));
    return Math.min(normalized, max);
  }

  private formatBalance(value: number): string {
    const padded = value.toString().padStart(4, '0');
    return `${padded.slice(0, 1)},${padded.slice(1)}`;
  }

  private formatWin(value: number): string {
    const padded = value.toString().padStart(7, '0');
    return `${padded.slice(0, 1)},${padded.slice(1, 4)},${padded.slice(4)}`;
  }

  private formatBet(value: number): string {
    return value.toString().padStart(3, '0');
  }
}
