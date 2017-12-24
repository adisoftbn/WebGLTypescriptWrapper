export interface IBaseModel {
  moveForward();
  moveBackward();
  rotateLeft(angle);
  rotateRight(angle);
  buildFromUrl(modelName: string, path: string, modelFileName: string, callback?: Function);
  buildFromGallery(modelName, callback?: Function);
  getModel();
}
