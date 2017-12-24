import { Texture } from 'babylonjs';

export interface ITextureGalleryItem {
  hq: string;
  mq: string;
  lq: string;
  texture: Texture;
  textureLoaded: boolean;
}
