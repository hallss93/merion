import { Container, Graphics, Text } from 'pixi.js';

export class BetControl {
  public readonly container = new Container();
  private readonly panel = new Graphics();
  private readonly minusButton = new Graphics();
  private readonly plusButton = new Graphics();
  private readonly valueText = new Text({
    text: 'BET: 0.00',
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: 22,
      fontWeight: '600',
    },
  });
  private enabled = true;
  private onIncreaseHandler: (() => void) | null = null;
  private onDecreaseHandler: (() => void) | null = null;

  public constructor() {
    this.container.addChild(this.panel);
    this.container.addChild(this.minusButton);
    this.container.addChild(this.plusButton);
    this.container.addChild(this.valueText);

    this.valueText.anchor.set(0.5);
    this.valueText.position.set(130, 31);
    this.setupButton(this.minusButton, () => this.onDecreaseHandler?.());
    this.setupButton(this.plusButton, () => this.onIncreaseHandler?.());
    this.redraw();
  }

  public onIncrease(handler: () => void): void {
    this.onIncreaseHandler = handler;
  }

  public onDecrease(handler: () => void): void {
    this.onDecreaseHandler = handler;
  }

  public setValue(value: number): void {
    this.valueText.text = `BET: ${value.toFixed(2)}`;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.alpha = enabled ? 1 : 0.5;
    this.container.cursor = enabled ? 'pointer' : 'default';
  }

  private setupButton(button: Graphics, onTap: () => void): void {
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.on('pointertap', () => {
      if (!this.enabled) {
        return;
      }
      onTap();
    });
  }

  private redraw(): void {
    this.panel.clear();
    this.panel
      .roundRect(0, 0, 260, 62, 14)
      .fill({ color: 0x111111, alpha: 0.78 })
      .stroke({ color: 0x777777, width: 2 });

    this.minusButton.clear();
    this.minusButton
      .roundRect(8, 11, 42, 40, 10)
      .fill(0x2f2f2f)
      .stroke({ color: 0xa0a0a0, width: 1 });
    const minusText = new Text({
      text: '-',
      style: { fill: 0xffffff, fontFamily: 'Arial', fontSize: 28, fontWeight: '700' },
    });
    minusText.anchor.set(0.5);
    minusText.position.set(29, 31);
    this.minusButton.addChild(minusText);

    this.plusButton.clear();
    this.plusButton
      .roundRect(210, 11, 42, 40, 10)
      .fill(0x2f2f2f)
      .stroke({ color: 0xa0a0a0, width: 1 });
    const plusText = new Text({
      text: '+',
      style: { fill: 0xffffff, fontFamily: 'Arial', fontSize: 26, fontWeight: '700' },
    });
    plusText.anchor.set(0.5);
    plusText.position.set(231, 31);
    this.plusButton.addChild(plusText);
  }
}
