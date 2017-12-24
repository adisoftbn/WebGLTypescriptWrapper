export interface ICharacterAnimationOptions {
  animationSpeed: number;
  speedIncreasePercent: number;
  initialForwardSpeed: number;
  initialBackwardSpeed: number;
  maxForwardSpeed: number;
  maxBackwardSpeed: number;
  rotateSpeed: number;
}

export interface ICharacterGalleryItem {
  name: string;
  modelPath: string;
  modelFileName: string;
  modelFileType: string;
  animations: any;
  animationOptions: ICharacterAnimationOptions;
}
