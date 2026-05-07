import { Container, Graphics, Text } from 'pixi.js';

export class BalancePanel {
  public readonly container = new Container();
  private readonly panel = new Graphics();
  private readonly balanceText = new Text({
    text: 'BALANCE: 0.00',
    style: {
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: '600',
    },
  });
  private readonly betText = new Text({
    text: 'BET: 0.00',
    style: {
      fill: 0xffdb8c,
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: '600',
    },
  });
  private readonly winText = new Text({
    text: 'WIN: 0.00',
    style: {
      fill: 0x6bff93,
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: '700',
    },
  });

  public constructor() {
    this.container.addChild(this.panel);
    this.container.addChild(this.balanceText);
    this.container.addChild(this.betText);
    this.container.addChild(this.winText);
    this.redraw();
  }

  public update(balance: number, bet: number, win: number): void {
    this.balanceText.text = `BALANCE: ${balance.toFixed(2)}`;
    this.betText.text = `BET: ${bet.toFixed(2)}`;
    this.winText.text = `WIN: ${win.toFixed(2)}`;
  }

  private redraw(): void {
    this.panel.clear();
    this.panel
      .roundRect(0, 0, 530, 62, 14)
      .fill({ color: 0x0b0b0b, alpha: 0.76 })
      .stroke({ color: 0x636363, width: 2 });

    this.balanceText.position.set(16, 19);
    this.betText.position.set(226, 19);
    this.winText.position.set(372, 19);
  }
}
