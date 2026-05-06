import { Container, Graphics, Text } from 'pixi.js';

type StartHandler = () => void;

export class HomeView {
  public readonly container = new Container();
  private readonly layoutRoot = new Container();

  private readonly referenceWidth = 1920;
  private readonly referenceHeight = 1080;

  private readonly backgroundLayer = new Container();
  private readonly mainStructureLayer = new Container();
  private readonly characterLayer = new Container();
  private readonly uiLayer = new Container();
  private readonly overlayLayer = new Container();

  private readonly background = new Graphics();
  private readonly reelFrame = new Graphics();
  private readonly characterPlaceholder = new Graphics();
  private readonly decorPlaceholder = new Graphics();
  private readonly title = new Text({
    text: 'BANK ROBERRY SLOT',
    style: {
      fill: 0xffcf40,
      fontFamily: 'Arial',
      fontSize: 44,
      fontWeight: '700',
      stroke: { color: 0x1f0c00, width: 5 },
    },
  });
  private readonly subtitle = new Text({
    text: 'Cena inicial pronta para integrar assets e fluxo.',
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: 20,
    },
  });
  private readonly startButton = new Graphics();
  private readonly startLabel = new Text({
    text: 'START',
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: '700',
    },
  });
  private readonly topBar = new Graphics();
  private readonly bottomBar = new Graphics();
  private readonly titleBackplate = new Graphics();
  private readonly footerBackplate = new Graphics();
  private readonly popupOverlay = new Graphics();
  private readonly popupLabel = new Text({
    text: 'POPUP / OVERLAY',
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: '700',
    },
  });

  private startHandler: StartHandler | null = null;
  private isStartEnabled = true;

  public constructor() {
    this.container.sortableChildren = true;
    this.layoutRoot.sortableChildren = true;
    this.backgroundLayer.zIndex = 0;
    this.mainStructureLayer.zIndex = 10;
    this.characterLayer.zIndex = 20;
    this.uiLayer.zIndex = 30;
    this.overlayLayer.zIndex = 40;
    this.background.zIndex = 0;
    this.reelFrame.zIndex = 10;
    this.decorPlaceholder.zIndex = 20;
    this.characterPlaceholder.zIndex = 30;
    this.topBar.zIndex = 0;
    this.bottomBar.zIndex = 1;
    this.titleBackplate.zIndex = 2;
    this.footerBackplate.zIndex = 3;
    this.title.zIndex = 4;
    this.subtitle.zIndex = 5;
    this.startButton.zIndex = 6;
    this.startLabel.zIndex = 7;
    this.popupOverlay.zIndex = 0;
    this.popupLabel.zIndex = 1;

    this.startButton.eventMode = 'static';
    this.startButton.cursor = 'pointer';
    this.startButton.on('pointertap', () => {
      if (!this.isStartEnabled) {
        return;
      }

      this.startHandler?.();
    });

    this.backgroundLayer.addChild(this.background);
    this.mainStructureLayer.addChild(this.reelFrame);
    this.characterLayer.addChild(this.decorPlaceholder);
    this.characterLayer.addChild(this.characterPlaceholder);
    this.uiLayer.addChild(this.topBar);
    this.uiLayer.addChild(this.bottomBar);
    this.uiLayer.addChild(this.titleBackplate);
    this.uiLayer.addChild(this.footerBackplate);
    this.uiLayer.addChild(this.title);
    this.uiLayer.addChild(this.subtitle);
    this.uiLayer.addChild(this.startButton);
    this.uiLayer.addChild(this.startLabel);
    this.overlayLayer.addChild(this.popupOverlay);
    this.overlayLayer.addChild(this.popupLabel);

    this.overlayLayer.visible = false;

    this.layoutRoot.addChild(this.backgroundLayer);
    this.layoutRoot.addChild(this.mainStructureLayer);
    this.layoutRoot.addChild(this.characterLayer);
    this.layoutRoot.addChild(this.uiLayer);
    this.layoutRoot.addChild(this.overlayLayer);
    this.container.addChild(this.layoutRoot);
  }

  public onStart(handler: StartHandler): void {
    this.startHandler = handler;
  }

  public setVisible(isVisible: boolean): void {
    this.container.visible = isVisible;
  }

  public setSubtitle(text: string): void {
    this.subtitle.text = text;
  }

  public setStartEnabled(enabled: boolean): void {
    this.isStartEnabled = enabled;
    this.startButton.alpha = enabled ? 1 : 0.55;
    this.startLabel.alpha = enabled ? 1 : 0.65;
    this.startButton.cursor = enabled ? 'pointer' : 'default';
  }

  public setOverlayVisible(visible: boolean, label?: string): void {
    if (label) {
      this.popupLabel.text = label;
    }

    this.overlayLayer.visible = visible;
  }

  public resize(width: number, height: number): void {
    const centerX = this.referenceWidth * 0.5;
    const centerY = this.referenceHeight * 0.5;
    const scale = this.getResponsiveScale(width, height);
    const contentWidth = this.referenceWidth * scale;
    const contentHeight = this.referenceHeight * scale;

    this.layoutRoot.scale.set(scale);
    this.layoutRoot.position.set(
      (width - contentWidth) * 0.5,
      (height - contentHeight) * 0.5,
    );

    this.background.clear();
    this.background
      .rect(0, 0, this.referenceWidth, this.referenceHeight)
      .fill(0x2b1403);

    this.reelFrame.clear();
    this.reelFrame
      .roundRect(centerX - 430, centerY - 285, 860, 570, 22)
      .fill(0x111111)
      .stroke({ color: 0x8f8f8f, width: 6 });

    this.decorPlaceholder.clear();
    this.decorPlaceholder
      .roundRect(92, 150, 180, 160, 14)
      .fill(0x4a2e14)
      .stroke({ color: 0xa56a2f, width: 3 });

    this.characterPlaceholder.clear();
    this.characterPlaceholder
      .roundRect(this.referenceWidth - 330, this.referenceHeight - 560, 210, 420, 24)
      .fill(0xa55c1b)
      .stroke({ color: 0xffc77a, width: 3 });

    this.topBar.clear();
    this.topBar
      .rect(0, 0, this.referenceWidth, 90)
      .fill({ color: 0x2a2a2a, alpha: 0.92 });

    this.bottomBar.clear();
    this.bottomBar
      .rect(0, this.referenceHeight - 116, this.referenceWidth, 116)
      .fill({ color: 0x1f1f1f, alpha: 0.94 });

    this.titleBackplate.clear();
    this.titleBackplate
      .roundRect(centerX - 340, 18, 680, 62, 12)
      .fill({ color: 0x000000, alpha: 0.35 });

    this.footerBackplate.clear();
    this.footerBackplate
      .roundRect(centerX - 430, this.referenceHeight - 106, 860, 68, 14)
      .fill({ color: 0x000000, alpha: 0.3 });

    this.title.anchor.set(0.5);
    this.subtitle.anchor.set(0.5);
    this.startLabel.anchor.set(0.5);
    this.popupLabel.anchor.set(0.5);

    this.title.x = centerX;
    this.title.y = 48;
    this.title.style.dropShadow = {
      alpha: 0.55,
      angle: 1.2,
      blur: 3,
      color: 0x000000,
      distance: 3,
    };
    this.subtitle.x = centerX;
    this.subtitle.y = this.referenceHeight - 76;
    this.subtitle.style.dropShadow = {
      alpha: 0.45,
      angle: 1.2,
      blur: 2,
      color: 0x000000,
      distance: 2,
    };

    const buttonWidth = 180;
    const buttonHeight = 58;
    const buttonX = centerX - buttonWidth * 0.5;
    const buttonY = this.referenceHeight - 56 - buttonHeight * 0.5;
    this.startButton.clear();
    this.startButton
      .roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 14)
      .fill(0xb62b2b)
      .stroke({ color: 0xffd3a1, width: 2 });
    this.startLabel.x = centerX;
    this.startLabel.y = this.referenceHeight - 56;

    this.popupOverlay.clear();
    this.popupOverlay
      .rect(0, 0, this.referenceWidth, this.referenceHeight)
      .fill({ color: 0x000000, alpha: 0.56 });
    this.popupLabel.x = centerX;
    this.popupLabel.y = centerY;
  }

  private getResponsiveScale(width: number, height: number): number {
    const fitScale = Math.min(width / this.referenceWidth, height / this.referenceHeight);

    if (width <= 900) {
      return Math.max(0.5, Math.min(fitScale, 0.72));
    }

    if (width <= 1366) {
      return Math.max(0.68, Math.min(fitScale, 0.9));
    }

    return Math.max(0.84, Math.min(fitScale, 1));
  }
}
