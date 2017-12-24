import { GameRenderer } from '../';
import { ITextureGalleryItem, TextureGalleryItem } from '../model/';

export class TextureGalleryManager {
  private _gameRenderer: GameRenderer;
  private _texturesUrls = [
    {
      name: 'ground-grass',
      hq: 'ground/grass-hq.jpg',
      mq: 'ground/grass-mq.jpg',
      lq: 'ground/grass-lq.jpg'
    },
    {
      name: 'ground-metal',
      hq: 'ground/metal-hq.jpg',
      mq: 'ground/metal-mq.jpg',
      lq: 'ground/metal-lq.jpg'
    },
    {
      name: 'ground-pavement',
      hq: 'ground/pavement-hq.jpg',
      mq: 'ground/pavement-mq.jpg',
      lq: 'ground/pavement-lq.jpg'
    },
    {
      name: 'ground-pavement2',
      hq: 'ground/pavement2-hq.jpg',
      mq: 'ground/pavement2-mq.jpg',
      lq: 'ground/pavement2-lq.jpg'
    },
    {
      name: 'wall-white-ceramic',
      hq: 'wall/white-ceramic-hq.jpg',
      mq: 'wall/white-ceramic-mq.jpg',
      lq: 'wall/white-ceramic-lq.jpg'
    },
    {
      name: 'wall-stone-marble',
      hq: 'wall/stone-marble-hq.jpg',
      mq: 'wall/stone-marble-mq.jpg',
      lq: 'wall/stone-marble-lq.jpg'
    },
    {
      name: 'wall-stone-marble2',
      hq: 'wall/stone-marble2-hq.jpg',
      mq: 'wall/stone-marble2-mq.jpg',
      lq: 'wall/stone-marble2-lq.jpg'
    },
    {
      name: 'wall-cracked-ceramic',
      hq: 'wall/cracked-ceramic-hq.jpg',
      mq: 'wall/cracked-ceramic-mq.jpg',
      lq: 'wall/cracked-ceramic-lq.jpg'
    },
    {
      name: 'wall-ceramic',
      hq: 'wall/ceramic-hq.jpg',
      mq: 'wall/ceramic-mq.jpg',
      lq: 'wall/ceramic-lq.jpg'
    },
    {
      name: 'wall-bricks',
      hq: 'wall/bricks-hq.jpg',
      mq: 'wall/bricks-mq.jpg',
      lq: 'wall/bricks-lq.jpg'
    },
    {
      name: 'wall-bricks2',
      hq: 'wall/bricks2-hq.jpg',
      mq: 'wall/bricks2-mq.jpg',
      lq: 'wall/bricks2-lq.jpg'
    },
    {
      name: 'wall-aged-building-facade',
      hq: 'wall/aged-building-facade-hq.jpg',
      mq: 'wall/aged-building-facade-mq.jpg',
      lq: 'wall/aged-building-facade-lq.jpg'
    },
  ];
  private _textures = {};

  constructor(gameRenderer: GameRenderer) {
    this._gameRenderer = gameRenderer;
    this.initTextureObjects();
  }

  private initTextureObjects() {
    this._texturesUrls.forEach(texture => {
      const newTextureItem = new TextureGalleryItem();
      newTextureItem.hq = texture.hq;
      newTextureItem.mq = texture.mq;
      newTextureItem.lq = texture.lq;
      this._textures[texture.name] = newTextureItem;
    });
  }

  public getTextureUrlByName(textureName: string): string {
    if (this._textures[textureName]) {
      if (this._gameRenderer.texturesQuality === 'hq') {
        return `assets/textures/${this._textures[textureName].hq}`;
      } else if (this._gameRenderer.texturesQuality === 'mq') {
        return `assets/textures/${this._textures[textureName].mq}`;
      } else {
        return `assets/textures/${this._textures[textureName].lq}`;
      }
    } else {
      throw new Error(`Cannot find texture ${textureName}!`);
    }
  }

  public getTextureObjectByName(textureName: string) {
    return new Promise((resolve, reject) => {
      if (this._textures[textureName]) {
        if (!this._textures[textureName].loadedTexture) {
          let textureUrl = null;
          if (this._gameRenderer.texturesQuality === 'hq') {
            textureUrl = `assets/textures/${this._textures[textureName].hq}`;
          } else if (this._gameRenderer.texturesQuality === 'mq') {
            textureUrl = `assets/textures/${this._textures[textureName].mq}`;
          } else {
            textureUrl = `assets/textures/${this._textures[textureName].lq}`;
          }
          console.log(textureUrl);
          this._textures[textureName].loadedTexture = new BABYLON.Texture(textureUrl, this._gameRenderer.getScene());
          const interval = setInterval(() => {
            if (this._textures[textureName].loadedTexture.isReady()) {
              clearInterval(interval);
              resolve(this._textures[textureName].loadedTexture);
            }
          }, 1);
        } else {
          resolve(this._textures[textureName].loadedTexture);
        }
      } else {
        reject(`Cannot find texture ${textureName}!`);
        // throw new Error(`Cannot find texture ${textureName}!`);
      }
    });
  }
}
