import { Vector3, StandardMaterial, MeshBuilder, Mesh, Vector4, Texture } from 'babylonjs';

import { GameRenderer } from '../';
import { BaseModel } from './baseModel';

export class Cube extends BaseModel {
  protected _model: Mesh = null;
  protected _modelMaterial;

  protected _initialWidth = 1;
  protected _initialHeight = 1;
  protected _initialDepth = 1;

  constructor(gameRenderer: GameRenderer, initialPosition: Vector3, width, height, depth) {
    super(gameRenderer);
    this._gameRenderer = gameRenderer;
    this._initialWidth = width;
    this._initialHeight = height;
    this._initialDepth = depth;
    this._model = MeshBuilder.CreateBox('', {
      width, height, depth,
      // frontUVs: new Vector4(0, 0, width, height),
      // backUVs: new Vector4(0, 0, width, height)
    }, this._gameRenderer.getScene());
    this._model.position = initialPosition;

    this._modelMaterial = new StandardMaterial('model', this._gameRenderer.getScene());
    this._modelMaterial.diffuseColor = this._gameRenderer.diffuseColor;
    this._modelMaterial.specularColor = this._gameRenderer.specularColor;
    this._modelMaterial.ambientColor = this._gameRenderer.ambientColor;
    // this._modelMaterial.backFaceCulling = false;
    this._model.material = this._modelMaterial;
    // this._gameRenderer.getShadowGenerator().getShadowMap().renderList.push(this._model);
    this._gameRenderer.getShadowGenerator().addShadowCaster(this._model);
    if (this._gameRenderer.isPhysicsEnabled()) {
      this._model.checkCollisions = true;
    }

  }

  getModel() {
    return this._model;
  }

  public setTexture(textureUrl: string) {
    this._modelMaterial.diffuseTexture = new Texture(textureUrl, this._gameRenderer.getScene());
  }

  public setTextureFromGallery(textureName) {
    this._gameRenderer.getTextureGallery().getTextureObjectByName(textureName).then(texture => {
      this._modelMaterial.diffuseTexture = texture;
      const sizes = this._modelMaterial.diffuseTexture.getSize();
      const ratio = sizes['width'] / sizes['height'];
      this._modelMaterial.diffuseTexture.uScale = this._initialHeight * ratio;
      this._modelMaterial.diffuseTexture.vScale = this._initialWidth / ratio;
    });
  }



}
