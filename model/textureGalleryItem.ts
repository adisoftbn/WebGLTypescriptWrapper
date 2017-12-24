import { ITextureGalleryItem } from './textureGalleryItem.interface';
export class TextureGalleryItem implements ITextureGalleryItem {
  hq = 'texture-hq.jpg';
  mq = 'texture-mq.jpg';
  lq = 'texture-lq.jpg';
  texture = null;
  textureLoaded = false;
}
