import { GameRenderer } from '../';
import { ITextureGalleryItem, TextureGalleryItem } from '../model/';

export class TextureGalleryManager {
  private _gameRenderer: GameRenderer;
  private _textures = {};

  constructor(gameRenderer: GameRenderer) {
    this._gameRenderer = gameRenderer;
  }

  public initTextureObjects(texturesUrls) {
    texturesUrls.forEach(texture => {
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
        if (!this._textures[textureName].textureLoaded && !this._textures[textureName].texture) {
          let textureUrl = null;
          if (this._gameRenderer.texturesQuality === 'hq') {
            textureUrl = `assets/textures/${this._textures[textureName].hq}`;
          } else if (this._gameRenderer.texturesQuality === 'mq') {
            textureUrl = `assets/textures/${this._textures[textureName].mq}`;
          } else {
            textureUrl = `assets/textures/${this._textures[textureName].lq}`;
          }
          this._textures[textureName].texture = new BABYLON.Texture(textureUrl, this._gameRenderer.getScene());
          const interval = setInterval(() => {
            if (this._textures[textureName].texture.isReady()) {
              this._textures[textureName].textureLoaded = true;
              clearInterval(interval);
              resolve(this._textures[textureName].texture.clone());
            }
          }, 1);
        } else {
          if (this._textures[textureName].texture) {
            const interval = setInterval(() => {
              if (this._textures[textureName].texture.isReady()) {
                clearInterval(interval);
                resolve(this._textures[textureName].texture.clone());
              }
            }, 1);
          } else {
            resolve(this._textures[textureName].texture.clone());
          }
        }
      } else {
        reject(`Cannot find texture ${textureName}!`);
        // throw new Error(`Cannot find texture ${textureName}!`);
      }
    });
  }
}
