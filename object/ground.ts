import { Vector3, StandardMaterial, MeshBuilder, Mesh, Vector4, Texture } from 'babylonjs';


import { BaseModel } from './baseModel';
import { GameRenderer } from '../';

export class Ground extends BaseModel {
  private _model = null;
  private _groundWidth = 50;
  private _groundHeight = 50;
  private _groundMaterial = null;

  constructor(gameRenderer: GameRenderer, width: number, height: number, textureName: string = null) {
    super(gameRenderer);
    this._groundWidth = width;
    this._groundHeight = height;
    this._model = MeshBuilder.CreateGround('ground1', { width, height, subdivisions: 2 }, this._gameRenderer.getScene());
    this._model.receiveShadows = true;

    if (this._gameRenderer.isPhysicsEnabled()) {
      this._model.checkCollisions = true;
    }


    this._groundMaterial = new StandardMaterial('ground', this._gameRenderer.getScene());
    this._groundMaterial.diffuseColor = this._gameRenderer.diffuseColor;
    this._groundMaterial.specularColor = this._gameRenderer.specularColor;

    this._model.material = this._groundMaterial;
    if (textureName) {
      this.setGroundTextureFromGallery(textureName);
    }
  }

  getModel() {
    return this._model;
  }

  public setGroundTexture(textureUrl: string) {
    this._model.material.diffuseTexture = new Texture(textureUrl, this._gameRenderer.getScene());
  }

  public setGroundTextureFromGallery(textureName) {
    this._gameRenderer.getTextureGallery().getTextureObjectByName(textureName).then(texture => {
      this._model.material.diffuseTexture = texture;
      const sizes = this._model.material.diffuseTexture.getSize();
      const ratio = sizes['width'] / sizes['height'];
      this._model.material.diffuseTexture.uScale = this._groundWidth * ratio;
      this._model.material.diffuseTexture.vScale = this._groundHeight / ratio;
    });
  }

}
