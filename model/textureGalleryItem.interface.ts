import { Texture } from 'babylonjs';

export interface ITextureGalleryItem {
  hq: string;
  mq: string;
  lq: string;
  loadedTexture: Texture;
}
