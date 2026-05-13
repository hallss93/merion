import { AnimatedSprite, Assets, Container, Sprite, Texture } from 'pixi.js';
import type { IScene } from './types';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import {
  COIN_SYMBOL_DEFINITIONS,
  GAME_SCENE_CONFIG,
  OBJECT_SYMBOL_DEFINITIONS,
  SPINE_WIN_DEFINITIONS,
  type SymbolDefinition,
} from '../config/gameSceneConfig';
import { SlotStore } from '../state/SlotStore';
import { SpinEngine } from '../domain/slot/SpinEngine';
import { getWinStageIndices as computeWinStageIndices } from '../domain/slot/winOverlayStages';
import { SpinButton } from '../ui/components/SpinButton';
import { BetControl } from '../ui/components/BetControl';
import { BalancePanel } from '../ui/components/BalancePanel';
import { ReloadButton } from '../ui/components/ReloadButton';
import type { SlotState } from '../state/SlotStore';
import type { SpinResult } from '../domain/slot/SlotTypes';

export class GameScene implements IScene {
  public readonly container = new Container();
  private readonly backgroundSprite = new Sprite(Texture.EMPTY);
  private readonly reelsContainer = new Container();
  private readonly hudContainer = new Container();
  private readonly mainButtonContainer = new Container();
  private readonly bigWinOverlay = new Container();
  private readonly bigWinDim = new Sprite(Texture.WHITE);
  private readonly slotStore = new SlotStore();
  private readonly spinEngine = new SpinEngine();
  private readonly spinButton = new SpinButton();
  private readonly reloadButton = new ReloadButton();
  private readonly betControl = new BetControl();
  private readonly balancePanel = new BalancePanel();
  private foxSpine: Spine | null = null;
  private readonly reelSprites: AnimatedSprite[] = [];
  private readonly symbolTextureCache = new Map<string, Texture[]>();
  private bigWinSprite: AnimatedSprite | null = null;
  private activeSpineWin: Spine | null = null;
  private shouldSkipWinFeedback = false;
  private symbolsReady = false;
  private currentSymbolMode: 'objects' | 'coins' | null = null;
  private lastWidth = 1920;
  private lastHeight = 1080;
  private readonly spinTimeoutIds: number[] = [];
  private spinInputLocked = false;
  private unsubscribeStore: (() => void) | null = null;

  public constructor() {
    this.container.sortableChildren = true;
    this.container.addChild(this.backgroundSprite);
    this.reelsContainer.zIndex = GAME_SCENE_CONFIG.reel.zIndex;
    this.container.addChild(this.reelsContainer);
    this.hudContainer.sortableChildren = true;
    this.hudContainer.zIndex = 10000;
    this.container.addChild(this.hudContainer);
    this.mainButtonContainer.sortableChildren = true;
    this.mainButtonContainer.zIndex = 3;
    this.bigWinOverlay.zIndex = GAME_SCENE_CONFIG.winOverlay.zIndex;
    this.bigWinDim.tint = 0x000000;
    this.bigWinDim.alpha = GAME_SCENE_CONFIG.winOverlay.dimAlpha;
    this.bigWinOverlay.addChild(this.bigWinDim);
    this.bigWinOverlay.visible = false;
    this.bigWinOverlay.eventMode = 'static';
    this.bigWinOverlay.on('pointertap', () => {
      if (this.slotStore.getSnapshot().phase === 'showingWin') {
        this.shouldSkipWinFeedback = true;
      }
    });
    this.container.addChild(this.bigWinOverlay);
    this.setupHud();
    this.bindStore();
  }

  public onEnter(): void {
    this.container.visible = true;
    this.hudContainer.visible = true;
    void this.ensureHudAssets();
    this.ensureFoxSpine();
    void this.ensureReelSymbols();
    void this.ensureBigWinAnimation();
    void this.preloadSpineWinAssets();
    this.refreshHudFromState(this.slotStore.getSnapshot());

    const texture = Assets.get('main_game_screen') as Texture | undefined;
    if (texture) {
      this.backgroundSprite.texture = texture;
      this.resize(this.lastWidth, this.lastHeight);
      return;
    }

    void this.loadMainGameTexture();
  }

  public onExit(): void {
    this.clearAllWinTimers();
    this.clearSpinTimers();
    for (const sprite of this.reelSprites) {
      sprite.stop();
    }
    if (this.bigWinSprite) {
      this.bigWinSprite.stop();
    }
    if (this.activeSpineWin) {
      this.activeSpineWin.destroy();
      this.activeSpineWin = null;
    }
    this.bigWinSprite?.stop();
    this.bigWinOverlay.visible = false;
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
    this.layoutBigWin(width, height);
    this.layoutHud(width, height);
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
      const urls = symbolDefinitions.flatMap((symbol) => this.buildSymbolUrls(symbol));
      await Assets.load(urls);
      this.createOrUpdateReelGrid(symbolDefinitions, true);
      this.symbolsReady = true;
      this.currentSymbolMode = nextMode;
    } else if (this.currentSymbolMode !== nextMode) {
      this.createOrUpdateReelGrid(symbolDefinitions, true);
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

  private buildBigWinUrls(): string[] {
    const urls: string[] = [];
    for (let i = 0; i <= 45; i += 1) {
      const frame = String(i).padStart(2, '0');
      urls.push(`/assets/sequences/Wins/Big_Win/Big_Win_${frame}.png`);
    }
    return urls;
  }

  private createOrUpdateReelGrid(
    symbolDefinitions: SymbolDefinition[],
    randomizeOrder: boolean,
  ): void {
    const spriteCount = GAME_SCENE_CONFIG.reel.columns * GAME_SCENE_CONFIG.reel.rows;
    this.ensureReelSpritePool(spriteCount);

    for (let row = 0; row < GAME_SCENE_CONFIG.reel.rows; row += 1) {
      for (let col = 0; col < GAME_SCENE_CONFIG.reel.columns; col += 1) {
        const spriteIndex = row * GAME_SCENE_CONFIG.reel.columns + col;
        const sprite = this.reelSprites[spriteIndex];
        if (!sprite) {
          continue;
        }

        const symbol = randomizeOrder
          ? symbolDefinitions[Math.floor(Math.random() * symbolDefinitions.length)]
          : symbolDefinitions[spriteIndex % symbolDefinitions.length];
        const textures = this.getSymbolTextures(symbol);
        if (textures.length === 0) {
          continue;
        }

        sprite.textures = textures;
        sprite.loop = true;
        sprite.animationSpeed =
          (0.18 + ((row + col) % 4) * 0.02) * GAME_SCENE_CONFIG.animationSpeedMultiplier;
        sprite.gotoAndPlay(
          (row + col * 3 + Math.floor(Math.random() * GAME_SCENE_CONFIG.reel.minRandomOffset)) %
            textures.length,
        );
      }
    }
  }

  private ensureReelSpritePool(targetCount: number): void {
    while (this.reelSprites.length < targetCount) {
      const sprite = new AnimatedSprite([Texture.EMPTY]);
      sprite.anchor.set(0.5);
      sprite.zIndex = GAME_SCENE_CONFIG.reel.zIndex;
      this.reelsContainer.addChild(sprite);
      this.reelSprites.push(sprite);
    }

    while (this.reelSprites.length > targetCount) {
      const sprite = this.reelSprites.pop();
      if (!sprite) {
        continue;
      }
      sprite.stop();
      sprite.destroy();
    }
  }

  private getSymbolTextures(symbol: SymbolDefinition): Texture[] {
    const cacheKey = `${this.getSequenceGroupFolder()}/${symbol.folder}`;
    const cached = this.symbolTextureCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const textures = this.buildSymbolUrls(symbol)
      .map((url) => Assets.get(url) as Texture | undefined)
      .filter((texture): texture is Texture => Boolean(texture));
    this.symbolTextureCache.set(cacheKey, textures);
    return textures;
  }

  private layoutReels(): void {
    if (this.reelSprites.length === 0) {
      return;
    }
    if (this.backgroundSprite.texture === Texture.EMPTY) {
      return;
    }

    const backgroundWidth = this.backgroundSprite.texture.width * this.backgroundSprite.scale.x;
    const backgroundHeight = this.backgroundSprite.texture.height * this.backgroundSprite.scale.y;
    const backgroundX = this.backgroundSprite.x;
    const backgroundY = this.backgroundSprite.y;

    // Ratios calibrados com base no layout do `main scene 1.png`.
    const startX = backgroundX + backgroundWidth * GAME_SCENE_CONFIG.reel.startXRatio;
    const endX = backgroundX + backgroundWidth * GAME_SCENE_CONFIG.reel.endXRatio;
    const startY = backgroundY + backgroundHeight * GAME_SCENE_CONFIG.reel.startYRatio;
    const endY = backgroundY + backgroundHeight * GAME_SCENE_CONFIG.reel.endYRatio;
    const stepX = (endX - startX) / (GAME_SCENE_CONFIG.reel.columns - 1);
    const stepY = (endY - startY) / (GAME_SCENE_CONFIG.reel.rows - 1);
    const targetCellHeight = backgroundHeight * GAME_SCENE_CONFIG.reel.cellHeightRatio;

    let index = 0;
    for (let row = 0; row < GAME_SCENE_CONFIG.reel.rows; row += 1) {
      for (let col = 0; col < GAME_SCENE_CONFIG.reel.columns; col += 1) {
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
    return this.isCoinRoute() ? COIN_SYMBOL_DEFINITIONS : OBJECT_SYMBOL_DEFINITIONS;
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
      spine.state.timeScale = GAME_SCENE_CONFIG.spineSpeedMultiplier;
      spine.zIndex = GAME_SCENE_CONFIG.fox.zIndex;
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
    const targetHeight =
      height *
      (GAME_SCENE_CONFIG.fox.targetHeightBase +
        widthRatio * GAME_SCENE_CONFIG.fox.targetHeightWidthRatioFactor);
    const spineBounds = this.foxSpine.getLocalBounds();
    const safeHeight = Math.max(spineBounds.height, 1);
    const scale = targetHeight / safeHeight;

    this.foxSpine.scale.set(-scale, scale);
    const foxX =
      width * (GAME_SCENE_CONFIG.fox.xBase - widthRatio * GAME_SCENE_CONFIG.fox.xWidthRatioFactor);
    const foxY =
      height * (GAME_SCENE_CONFIG.fox.yBase - widthRatio * GAME_SCENE_CONFIG.fox.yWidthRatioFactor);
    this.foxSpine.position.set(foxX, foxY);
  }

  private async ensureBigWinAnimation(): Promise<void> {
    if (this.bigWinSprite) {
      return;
    }

    const urls = this.buildBigWinUrls();
    await Assets.load(urls);

    const textures: Texture[] = urls
      .map((url) => Assets.get(url) as Texture | undefined)
      .filter((texture): texture is Texture => Boolean(texture));
    if (textures.length === 0) {
      return;
    }

    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.loop = true;
    sprite.animationSpeed =
      GAME_SCENE_CONFIG.winOverlay.spriteSpeed * GAME_SCENE_CONFIG.animationSpeedMultiplier;
    sprite.zIndex = 1;
    this.bigWinSprite = sprite;
    this.bigWinOverlay.addChild(sprite);
    this.layoutBigWin(this.lastWidth, this.lastHeight);
  }

  private layoutBigWin(width: number, height: number): void {
    this.bigWinDim.width = width;
    this.bigWinDim.height = height;
    this.bigWinDim.position.set(0, 0);

    const winDisplay = this.activeSpineWin ?? this.bigWinSprite;
    if (!winDisplay) {
      return;
    }

    const bounds = winDisplay.getLocalBounds();
    const safeWidth = Math.max(bounds.width, 1);
    const targetWidth = width * GAME_SCENE_CONFIG.winOverlay.targetWidthRatio;
    const scale = targetWidth / safeWidth;
    winDisplay.scale.set(scale);
    winDisplay.position.set(
      width * GAME_SCENE_CONFIG.winOverlay.centerXRatio,
      height * GAME_SCENE_CONFIG.winOverlay.centerYRatio,
    );
  }

  private async showWinStage(stageIndex: number): Promise<void> {
    if (stageIndex === 0) {
      this.showBigWin();
      return;
    }

    const definition = SPINE_WIN_DEFINITIONS[stageIndex - 1];
    if (!definition) {
      return;
    }
    await this.showSpineWin(definition.skeleton, definition.atlas, definition.animation);
  }

  private showBigWin(): void {
    if (!this.bigWinSprite) {
      return;
    }
    this.disposeActiveSpineWin();
    this.bigWinOverlay.visible = true;
    this.bigWinSprite.visible = true;
    this.bigWinSprite.gotoAndPlay(0);
    this.layoutBigWin(this.lastWidth, this.lastHeight);
  }

  private async preloadSpineWinAssets(): Promise<void> {
    const urls = SPINE_WIN_DEFINITIONS.flatMap((definition) => [
      definition.skeleton,
      definition.atlas,
    ]);
    await Assets.load(urls);
  }

  private async showSpineWin(skeleton: string, atlas: string, animation: string): Promise<void> {
    if (this.bigWinSprite) {
      this.bigWinSprite.stop();
      this.bigWinSprite.visible = false;
    }
    this.disposeActiveSpineWin();

    let spineWin: Spine;
    try {
      spineWin = Spine.from({
        skeleton,
        atlas,
        autoUpdate: true,
      });
    } catch {
      return;
    }

    try {
      spineWin.state.setAnimation(0, animation, true);
      spineWin.state.timeScale = GAME_SCENE_CONFIG.spineSpeedMultiplier;
    } catch {
      spineWin.destroy();
      return;
    }

    spineWin.zIndex = 1;
    this.activeSpineWin = spineWin;
    this.bigWinOverlay.visible = true;
    this.bigWinOverlay.addChild(spineWin);
    this.layoutBigWin(this.lastWidth, this.lastHeight);
  }

  private disposeActiveSpineWin(): void {
    if (!this.activeSpineWin) {
      return;
    }
    this.activeSpineWin.destroy();
    this.activeSpineWin = null;
  }

  private clearAllWinTimers(): void {
    this.shouldSkipWinFeedback = true;
    this.bigWinOverlay.visible = false;
    this.disposeActiveSpineWin();
    if (this.bigWinSprite) {
      this.bigWinSprite.stop();
      this.bigWinSprite.visible = false;
    }
  }

  private setupHud(): void {
    this.hudContainer.addChild(this.balancePanel.container);
    this.hudContainer.addChild(this.mainButtonContainer);
    this.mainButtonContainer.addChild(this.betControl.container);
    this.mainButtonContainer.addChild(this.reloadButton.container);
    this.mainButtonContainer.addChild(this.spinButton.container);
    this.spinButton.onClick(() => {
      void this.handleSpinClick();
    });
    this.reloadButton.onClick(() => {
      this.handleReloadClick();
    });
    this.betControl.onIncrease(() => {
      this.slotStore.increaseBet();
    });
    this.betControl.onDecrease(() => {
      this.slotStore.decreaseBet();
    });
  }

  private bindStore(): void {
    if (this.unsubscribeStore) {
      return;
    }
    this.unsubscribeStore = this.slotStore.subscribe((state) => {
      this.refreshHudFromState(state);
    });
  }

  private refreshHudFromState(state: SlotState): void {
    const currentBet = state.betOptions[state.betIndex] ?? 0;
    this.balancePanel.update(state.balance, currentBet, state.lastWin);
    this.betControl.setValue(currentBet);
    const canInteract = state.phase === 'idle';
    this.betControl.setEnabled(canInteract);
    this.spinButton.setEnabled(this.slotStore.canSpin() && !this.spinInputLocked);
    this.reloadButton.setEnabled(canInteract);
  }

  private layoutHud(width: number, height: number): void {
    this.balancePanel.setGroupScale(0.9);
    const balanceSize = this.balancePanel.getSize();
    const betSize = this.betControl.getSize();
    const reloadSize = this.reloadButton.getSize();
    const spinSize = this.spinButton.getSize();
    const overlapBetSpin = Math.round(spinSize.width * 0.32);
    const overlapSpinReload = Math.round(reloadSize.width * 0.3);
    const groupWidth =
      betSize.width + spinSize.width + reloadSize.width - overlapBetSpin - overlapSpinReload;
    const groupHeight = Math.max(betSize.height, reloadSize.height, spinSize.height);
    const bottomY = height - Math.max(balanceSize.height, groupHeight) - 18;
    const alignedY = bottomY + 62;

    this.balancePanel.container.position.set(width * 0.5 - balanceSize.width * 0.5 - 120, alignedY);
    this.mainButtonContainer.scale.set(0.88);
    const scaledGroupWidth = groupWidth * this.mainButtonContainer.scale.x;
    const mainGroupX = width - width * 0.11 - scaledGroupWidth;
    this.mainButtonContainer.position.set(mainGroupX, alignedY);
    this.betControl.container.position.set(0, 0);
    this.spinButton.container.position.set(betSize.width - overlapBetSpin, 0);
    this.reloadButton.container.position.set(
      betSize.width + spinSize.width - overlapBetSpin - overlapSpinReload,
      0,
    );
  }

  private async handleSpinClick(): Promise<void> {
    if (this.spinInputLocked) {
      return;
    }
    this.spinInputLocked = true;
    this.refreshHudFromState(this.slotStore.getSnapshot());

    if (!this.slotStore.startSpin()) {
      this.spinInputLocked = false;
      this.refreshHudFromState(this.slotStore.getSnapshot());
      return;
    }

    this.clearAllWinTimers();
    this.clearSpinTimers();
    this.bigWinOverlay.visible = false;
    this.slotStore.setPhase('spinning');
    const spinSymbols = this.getActiveSymbolDefinitions();

    const spinResult = this.spinEngine.spin({
      bet: this.slotStore.getCurrentBet(),
      symbols: spinSymbols,
      rows: GAME_SCENE_CONFIG.reel.rows,
      columns: GAME_SCENE_CONFIG.reel.columns,
    });
    this.logRound({
      bet: this.slotStore.getCurrentBet(),
      result: spinResult,
    });

    await this.playSpinByColumns(spinSymbols, spinResult.matrix);
    this.slotStore.setPhase('evaluating');
    this.applySpinResult(spinResult);

    if (spinResult.totalWin > 0) {
      this.slotStore.setPhase('showingWin');
      await this.playWinFeedback(spinResult.totalWin);
    }

    this.slotStore.setPhase('settling');
    this.slotStore.settleSpin(spinResult.totalWin);
    await this.waitMs(120);
    this.spinInputLocked = false;
    this.refreshHudFromState(this.slotStore.getSnapshot());
  }

  private applySpinResult(result: SpinResult): void {
    const rows = Math.min(result.matrix.length, GAME_SCENE_CONFIG.reel.rows);
    for (let row = 0; row < rows; row += 1) {
      const rowData = result.matrix[row];
      const columns = Math.min(rowData.length, GAME_SCENE_CONFIG.reel.columns);
      for (let col = 0; col < columns; col += 1) {
        const sprite = this.reelSprites[row * GAME_SCENE_CONFIG.reel.columns + col];
        if (!sprite) {
          continue;
        }

        const textures = this.getSymbolTextures(rowData[col]);
        if (textures.length === 0) {
          continue;
        }

        sprite.textures = textures;
        sprite.gotoAndPlay((row + col) % textures.length);
      }
    }

    this.layoutReels();
  }

  private async playSpinByColumns(
    symbolDefinitions: SymbolDefinition[],
    finalMatrix: SymbolDefinition[][],
  ): Promise<void> {
    const startStaggerMs = 90;
    const minSpinMs = 900;
    const stopStaggerMs = 180;
    const columns = GAME_SCENE_CONFIG.reel.columns;

    for (let col = 0; col < columns; col += 1) {
      this.startColumnSpin(col, symbolDefinitions);
      if (col < columns - 1) {
        await this.waitMs(startStaggerMs);
      }
    }

    await this.waitMs(minSpinMs);

    for (let col = 0; col < columns; col += 1) {
      this.stopColumnWithFinalResult(col, finalMatrix);
      if (col < columns - 1) {
        await this.waitMs(stopStaggerMs);
      }
    }

    this.layoutReels();
  }

  private startColumnSpin(column: number, symbolDefinitions: SymbolDefinition[]): void {
    for (let row = 0; row < GAME_SCENE_CONFIG.reel.rows; row += 1) {
      const sprite = this.getReelSprite(row, column);
      if (!sprite) {
        continue;
      }

      const symbol = symbolDefinitions[Math.floor(Math.random() * symbolDefinitions.length)];
      const textures = this.getSymbolTextures(symbol);
      if (textures.length === 0) {
        continue;
      }

      sprite.textures = textures;
      sprite.loop = true;
      sprite.animationSpeed = 0.62;
      sprite.gotoAndPlay((row + column) % textures.length);
    }
  }

  private stopColumnWithFinalResult(column: number, finalMatrix: SymbolDefinition[][]): void {
    for (let row = 0; row < GAME_SCENE_CONFIG.reel.rows; row += 1) {
      const sprite = this.getReelSprite(row, column);
      if (!sprite) {
        continue;
      }

      const finalSymbol = finalMatrix[row]?.[column];
      if (!finalSymbol) {
        continue;
      }

      const textures = this.getSymbolTextures(finalSymbol);
      if (textures.length === 0) {
        continue;
      }

      sprite.textures = textures;
      sprite.animationSpeed = 0.22;
      sprite.gotoAndStop((row + column) % textures.length);
    }
  }

  private getReelSprite(row: number, column: number): AnimatedSprite | null {
    const index = row * GAME_SCENE_CONFIG.reel.columns + column;
    return this.reelSprites[index] ?? null;
  }

  private async waitMs(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
      const timeoutId = globalThis.setTimeout(() => {
        const index = this.spinTimeoutIds.indexOf(timeoutId);
        if (index >= 0) {
          this.spinTimeoutIds.splice(index, 1);
        }
        resolve();
      }, ms);
      this.spinTimeoutIds.push(timeoutId);
    });
  }

  private async ensureHudAssets(): Promise<void> {
    await Promise.all([
      this.balancePanel.ensureAssets(),
      this.betControl.ensureAssets(),
      this.reloadButton.ensureAssets(),
      this.spinButton.ensureAssets(),
    ]);
    this.layoutHud(this.lastWidth, this.lastHeight);
    this.refreshHudFromState(this.slotStore.getSnapshot());
  }

  private handleReloadClick(): void {
    if (this.slotStore.getSnapshot().phase !== 'idle') {
      return;
    }
    this.createOrUpdateReelGrid(this.getActiveSymbolDefinitions(), true);
    this.layoutReels();
  }

  private clearSpinTimers(): void {
    for (const timeoutId of this.spinTimeoutIds) {
      globalThis.clearTimeout(timeoutId);
    }
    this.spinTimeoutIds.length = 0;
  }

  private async playWinFeedback(totalWin: number): Promise<void> {
    const stageIndices = this.getWinStageIndices(totalWin);
    if (stageIndices.length === 0) {
      return;
    }

    this.shouldSkipWinFeedback = false;
    for (const stageIndex of stageIndices) {
      if (this.shouldSkipWinFeedback) {
        break;
      }
      await this.showWinStage(stageIndex);
      if (this.shouldSkipWinFeedback) {
        break;
      }
      await this.waitMs(GAME_SCENE_CONFIG.winOverlay.stageToTotalDelayMs);
    }

    this.bigWinOverlay.visible = false;
    this.disposeActiveSpineWin();
    if (this.bigWinSprite) {
      this.bigWinSprite.stop();
      this.bigWinSprite.visible = false;
    }
  }

  private getWinStageIndices(totalWin: number): number[] {
    return computeWinStageIndices(totalWin, GAME_SCENE_CONFIG.winOverlay.amountThresholds);
  }

  private logRound(payload: { bet: number; result: SpinResult }): void {
    const { bet, result } = payload;
    console.info('[slot-round]', {
      bet,
      result: {
        matrix: result.matrix.map((row) => row.map((symbol) => symbol.folder)),
        wins: result.wins,
      },
      multiplier: result.totalMultiplier,
      win: result.totalWin,
    });
  }
}
