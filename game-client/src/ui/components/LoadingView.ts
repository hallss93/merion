import { Container, Graphics, Text } from 'pixi.js';

export class LoadingView {
  public readonly container = new Container();

  private readonly background = new Graphics();
  private readonly label = new Text({
    text: 'Loading...',
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: 42,
      fontWeight: '700',
    },
  });

  public constructor() {
    this.container.sortableChildren = true;
    this.container.addChild(this.background);
    this.container.addChild(this.label);
  }

  public setVisible(isVisible: boolean): void {
    this.container.visible = isVisible;
  }

  public resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height).fill(0x12081f);
    this.label.anchor.set(0.5);
    this.label.x = width * 0.5;
    this.label.y = height * 0.5;
  }
}
