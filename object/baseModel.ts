import { IBaseModel } from './baseModel.interface';
import { GameRenderer } from '../';

export class BaseModel implements IBaseModel {
  protected _gameRenderer = null;
  constructor(gameRenderer: GameRenderer) {
    this._gameRenderer = gameRenderer;
  }

  moveForward() {

  }
  moveBackward() {

  }
  rotateLeft(angle) {

  }
  rotateRight(angle) {

  }
  buildFromUrl(modelName: string, path: string, modelFileName: string, callback?: Function) {

  }
  buildFromGallery(modelName, callback?: Function) {

  }

  getModel() {

  }
}
