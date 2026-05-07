import { Container, Graphics, Text } from 'pixi.js';

export class SpinButton {
  public readonly container = new Container();
  private readonly background = new Graphics();
  private readonly label = new Text({
    text: 'SPIN',
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: '700',
    },
  });
  private clickHandler: (() => void) | null = null;
  private enabled = true;

  public constructor() {
    this.container.addChild(this.background);
    this.container.addChild(this.label);
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    this.container.on('pointertap', () => {
      if (!this.enabled) {
        return;
      }
      this.clickHandler?.();
    });
    this.container.on('pointerover', () => {
      if (this.enabled) {
        this.container.scale.set(1.03);
      }
    });
    this.container.on('pointerout', () => {
      this.container.scale.set(1);
    });

    this.redraw();
  }

  public onClick(handler: () => void): void {
    this.clickHandler = handler;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.alpha = enabled ? 1 : 0.5;
    this.container.cursor = enabled ? 'pointer' : 'default';
    this.redraw();
  }

  private redraw(): void {
    this.background.clear();
    this.background
      .roundRect(0, 0, 170, 62, 16)
      .fill(this.enabled ? 0xb62b2b : 0x4a4a4a)
      .stroke({ color: 0xffd3a1, width: 2 });
    this.label.anchor.set(0.5);
    this.label.position.set(85, 31);
  }
}
