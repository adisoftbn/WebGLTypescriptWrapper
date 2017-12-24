import { ICharacterGalleryItem } from './characterGalleryItem.interface';

export class CharacterGalleryItem implements ICharacterGalleryItem {
  modelPath = '';
  modelFileName = '';
  modelType = 'babylon';
  animations = {};

  constructor(modelPath: string, modelFileName: string, modelType: string = 'babylon', animations = {}) {
    this.modelPath = modelPath;
    this.modelFileName = modelFileName;
    this.modelType = modelType;
    this.animations = animations;
  }
}
