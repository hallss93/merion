import { Container, Graphics, Text } from 'pixi.js';

type StartHandler = () => void;

export class HomeView {
  public readonly container = new Container();

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

  public constructor() {
    this.container.sortableChildren = true;
    this.backgroundLayer.zIndex = 0;
    this.mainStructureLayer.zIndex = 10;
    this.characterLayer.zIndex = 20;
    this.uiLayer.zIndex = 30;
    this.overlayLayer.zIndex = 40;

    this.startButton.eventMode = 'static';
    this.startButton.cursor = 'pointer';
    this.startButton.on('pointertap', () => this.startHandler?.());

    this.backgroundLayer.addChild(this.background);
    this.mainStructureLayer.addChild(this.reelFrame);
    this.characterLayer.addChild(this.decorPlaceholder);
    this.characterLayer.addChild(this.characterPlaceholder);
    this.uiLayer.addChild(this.topBar);
    this.uiLayer.addChild(this.bottomBar);
    this.uiLayer.addChild(this.title);
    this.uiLayer.addChild(this.subtitle);
    this.uiLayer.addChild(this.startButton);
    this.uiLayer.addChild(this.startLabel);
    this.overlayLayer.addChild(this.popupOverlay);
    this.overlayLayer.addChild(this.popupLabel);

    this.overlayLayer.visible = false;

    this.container.addChild(this.backgroundLayer);
    this.container.addChild(this.mainStructureLayer);
    this.container.addChild(this.characterLayer);
    this.container.addChild(this.uiLayer);
    this.container.addChild(this.overlayLayer);
  }

  public onStart(handler: StartHandler): void {
    this.startHandler = handler;
  }

  public setVisible(isVisible: boolean): void {
    this.container.visible = isVisible;
  }

  public resize(width: number, height: number): void {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.background.clear();
    this.background.rect(0, 0, width, height).fill(0x2b1403);

    this.reelFrame.clear();
    this.reelFrame
      .roundRect(centerX - 260, centerY - 200, 520, 400, 22)
      .fill(0x111111)
      .stroke({ color: 0x8f8f8f, width: 6 });

    this.decorPlaceholder.clear();
    this.decorPlaceholder
      .roundRect(36, 86, 120, 120, 14)
      .fill(0x4a2e14)
      .stroke({ color: 0xa56a2f, width: 3 });

    this.characterPlaceholder.clear();
    this.characterPlaceholder
      .roundRect(width - 210, height - 360, 150, 300, 24)
      .fill(0xa55c1b)
      .stroke({ color: 0xffc77a, width: 3 });

    this.topBar.clear();
    this.topBar.rect(0, 0, width, 72).fill({ color: 0x2a2a2a, alpha: 0.92 });

    this.bottomBar.clear();
    this.bottomBar
      .rect(0, height - 88, width, 88)
      .fill({ color: 0x1f1f1f, alpha: 0.94 });

    this.title.anchor.set(0.5);
    this.subtitle.anchor.set(0.5);
    this.startLabel.anchor.set(0.5);
    this.popupLabel.anchor.set(0.5);

    this.title.x = centerX;
    this.title.y = 38;
    this.subtitle.x = centerX;
    this.subtitle.y = height - 58;

    const buttonWidth = 180;
    const buttonHeight = 58;
    const buttonX = centerX - buttonWidth * 0.5;
    const buttonY = height - 44 - buttonHeight * 0.5;
    this.startButton.clear();
    this.startButton.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 14).fill(
      0xb62b2b,
    );
    this.startLabel.x = centerX;
    this.startLabel.y = height - 44;

    this.popupOverlay.clear();
    this.popupOverlay.rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0.56 });
    this.popupLabel.x = centerX;
    this.popupLabel.y = centerY;
  }
}
