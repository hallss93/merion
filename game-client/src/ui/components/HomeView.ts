import { Container, Graphics, Text } from 'pixi.js';

type StartHandler = () => void;

export class HomeView {
  public readonly container = new Container();

  private readonly background = new Graphics();
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

  private startHandler: StartHandler | null = null;

  public constructor() {
    this.container.sortableChildren = true;
    this.startButton.eventMode = 'static';
    this.startButton.cursor = 'pointer';
    this.startButton.on('pointertap', () => this.startHandler?.());

    this.container.addChild(this.background);
    this.container.addChild(this.title);
    this.container.addChild(this.subtitle);
    this.container.addChild(this.startButton);
    this.container.addChild(this.startLabel);
  }

  public onStart(handler: StartHandler): void {
    this.startHandler = handler;
  }

  public setVisible(isVisible: boolean): void {
    this.container.visible = isVisible;
  }

  public resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height).fill(0x2b1403);

    this.title.anchor.set(0.5);
    this.subtitle.anchor.set(0.5);
    this.startLabel.anchor.set(0.5);

    this.title.x = width * 0.5;
    this.title.y = height * 0.42;
    this.subtitle.x = width * 0.5;
    this.subtitle.y = height * 0.5;

    const buttonWidth = 180;
    const buttonHeight = 58;
    const buttonX = width * 0.5 - buttonWidth * 0.5;
    const buttonY = height * 0.58 - buttonHeight * 0.5;
    this.startButton.clear();
    this.startButton.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 14).fill(
      0xb62b2b,
    );
    this.startLabel.x = width * 0.5;
    this.startLabel.y = height * 0.58;
  }
}
