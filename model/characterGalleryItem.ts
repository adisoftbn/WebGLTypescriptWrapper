import { ICharacterGalleryItem } from './characterGalleryItem.interface';

export class CharacterGalleryItem implements ICharacterGalleryItem {
  name = '';
  modelPath = '';
  modelFileName = '';
  modelFileType = 'babylon';
  animations = {};
  animationOptions = {
    animationSpeed: 0.8,
    initialForwardSpeed: 0.02,
    initialBackwardSpeed: 0.01,
    speedIncreasePercent: 0.2,
    maxForwardSpeed: 0.1,
    maxBackwardSpeed: 0.04,
    rotateSpeed: 0.03
  }
}
