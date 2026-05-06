import { Container, Graphics, Text } from 'pixi.js';
import type { IScene } from './types';

export class HomeScene implements IScene {
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

  public constructor() {
    this.container.sortableChildren = true;
    this.container.addChild(this.background);
    this.container.addChild(this.title);
    this.container.addChild(this.subtitle);
  }

  public onEnter(): void {
    this.container.visible = true;
  }

  public onExit(): void {
    this.container.visible = false;
  }

  public resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height).fill(0x2b1403);

    this.title.anchor.set(0.5);
    this.subtitle.anchor.set(0.5);

    this.title.x = width * 0.5;
    this.title.y = height * 0.45;

    this.subtitle.x = width * 0.5;
    this.subtitle.y = height * 0.53;
  }
}
