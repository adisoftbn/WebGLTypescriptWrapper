import { Vector3, StandardMaterial, MeshBuilder, Mesh, Vector4, Texture } from 'babylonjs';

import { GameRenderer, IRendererGraphicOptions, RendererGraphicOptions, ERendererShadowQuality } from '../';
import { BaseModel } from './baseModel';

export class Torus extends BaseModel {
  protected _graphicsOptions: IRendererGraphicOptions;
  protected _model: Mesh = null;
  protected _modelMaterial;

  protected _initialDiameter = 1;
  protected _initialThickness = 1;
  protected _initialPosition: Vector3;
  protected _textureLoaded = false;
  protected _textureWidth = 1;
  protected _textureHeight = 1;

  constructor(gameRenderer: GameRenderer, initialPosition: Vector3, diameter, thickness,
    graphicsOptions?: IRendererGraphicOptions) {
    super(gameRenderer);
    this._graphicsOptions = (graphicsOptions ? graphicsOptions : new RendererGraphicOptions);
    this._initialDiameter = diameter;
    this._initialThickness = thickness;
    this._initialPosition = initialPosition;
    this._modelMaterial = new StandardMaterial('model', this._gameRenderer.getScene());
    this._modelMaterial.diffuseColor = this._gameRenderer.diffuseColor;
    this._modelMaterial.specularColor = this._gameRenderer.specularColor;
    this._modelMaterial.ambientColor = this._gameRenderer.ambientColor;


    this._model = MeshBuilder.CreateTorus('', {
      diameter: this._initialDiameter,
      thickness: this._initialThickness
    }, this._gameRenderer.getScene());

    this._model.position = this._initialPosition;
    this._model.material = this._modelMaterial;
    if (this._graphicsOptions.shadowEnabled && this._gameRenderer.getShadowGenerator()) {
      this._gameRenderer.getShadowGenerator().getShadowMap().renderList.push(this._model);
      if (
        this._graphicsOptions.shadowQuality === ERendererShadowQuality.medium ||
        this._graphicsOptions.shadowQuality === ERendererShadowQuality.high
      ) {
        this._gameRenderer.getShadowGenerator().addShadowCaster(this._model);
      }
    }
  }
  public getModel() {
    return this._model;
  }

  public setTexture(textureUrl: string) {
    this._modelMaterial.diffuseTexture = new Texture(textureUrl, this._gameRenderer.getScene());
  }

  public setTextureFromGallery(textureName) {
    this._gameRenderer.getTextureGallery().getTextureObjectByName(textureName).then(texture => {
      this._modelMaterial.diffuseTexture = texture;
      const sizes = this._modelMaterial.diffuseTexture.getSize();
      this._textureLoaded = true;
      this._textureWidth = sizes['width'];
      this._textureHeight = sizes['height'];
    });
  }

  public destroy() {
    this._model.dispose();
  }

}
