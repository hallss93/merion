import { Container, Sprite, Texture } from 'pixi.js';

/** Renderiza um texto usando sprites de dígitos (0–9 e vírgula). */
export class ImageNumberDisplay {
  public readonly container = new Container();
  private textureMap: Record<string, Texture>;
  private readonly spacing: number;
  private readonly maxHeight: number;
  private readonly commaLeftShift: number;
  private readonly sprites: Sprite[] = [];

  public constructor(
    textureMap: Record<string, Texture>,
    spacing = 2,
    maxHeight = 20,
    commaLeftShift = 0,
  ) {
    this.textureMap = textureMap;
    this.spacing = spacing;
    this.maxHeight = maxHeight;
    this.commaLeftShift = commaLeftShift;
  }

  /** Define o mapa caractere → textura dos dígitos. */
  public setTextureMap(textureMap: Record<string, Texture>): void {
    this.textureMap = textureMap;
  }

  /** Exibe um número com duas casas decimais. */
  public setValue(value: number): void {
    this.setText(value.toFixed(2).replace('.', ','));
  }

  /** Monta a string caractere a caractere com os sprites. */
  public setText(text: string): void {
    const chars = text.split('');
    this.ensureSpritePool(chars.length);

    let x = 0;
    for (let i = 0; i < chars.length; i += 1) {
      const char = chars[i];
      const sprite = this.sprites[i];
      const texture = this.textureMap[char] ?? Texture.EMPTY;
      sprite.texture = texture;
      sprite.visible = texture !== Texture.EMPTY;

      const baseHeight = texture.height || 1;
      const punctuationScaleFactor = char === ',' ? 0.68 : 1;
      const scale = (this.maxHeight / baseHeight) * punctuationScaleFactor;
      sprite.scale.set(scale);
      const punctuationOffsetY = char === ',' ? this.maxHeight * 0.4 : 0;
      const punctuationOffsetX = char === ',' ? this.commaLeftShift : 0;
      sprite.position.set(x - punctuationOffsetX, punctuationOffsetY);
      x += texture.width * scale + this.spacing;
    }

    this.container.pivot.set(this.container.width * 0.5, this.maxHeight * 0.5);
  }

  private ensureSpritePool(size: number): void {
    while (this.sprites.length < size) {
      const sprite = new Sprite(Texture.EMPTY);
      sprite.blendMode = 'normal';
      this.sprites.push(sprite);
      this.container.addChild(sprite);
    }
    for (let i = size; i < this.sprites.length; i += 1) {
      this.sprites[i].visible = false;
    }
  }
}
