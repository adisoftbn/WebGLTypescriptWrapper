import {
  Engine, Scene, FollowCamera, Light,
  Vector3, HemisphericLight, MeshBuilder
} from 'babylonjs';

export interface IGameRenderer {
  createScene();
  getScene(): Scene;
  getCamera();

  getShadowGenerator();
  getCharacterGallery();

  animate();

}
