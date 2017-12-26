import { Vector3, StandardMaterial, MeshBuilder, Mesh, Vector4, Texture } from 'babylonjs';

import { GameRenderer, IRendererGraphicOptions, RendererGraphicOptions, ERendererShadowsQuality } from '../';
import { BaseModel } from './baseModel';

export class Sphere extends BaseModel {
  protected _graphicsOptions: IRendererGraphicOptions;
  protected _model: Mesh = null;
  protected _modelMaterial;

  protected _initialRadius = 1;
  protected _initialPosition: Vector3;
  protected _textureLoaded = false;
  protected _textureWidth = 1;
  protected _textureHeight = 1;

  constructor(gameRenderer: GameRenderer, initialPosition: Vector3, radius,
    graphicsOptions?: IRendererGraphicOptions) {
    super(gameRenderer);
    this._graphicsOptions = (graphicsOptions ? graphicsOptions : new RendererGraphicOptions);
    this._initialRadius = radius;
    this._initialPosition = initialPosition;
    this._modelMaterial = new StandardMaterial('model', this._gameRenderer.getScene());
    this._modelMaterial.diffuseColor = this._gameRenderer.diffuseColor;
    this._modelMaterial.specularColor = this._gameRenderer.specularColor;
    this._modelMaterial.ambientColor = this._gameRenderer.ambientColor;


    this._model = MeshBuilder.CreateSphere('', {
      diameter: this._initialRadius,
    }, this._gameRenderer.getScene());

    this._model.position = this._initialPosition;
    this._model.material = this._modelMaterial;
    if (this._graphicsOptions.shadowsEnabled) {
      this._gameRenderer.getShadowGenerator().getShadowMap().renderList.push(this._model);
      if (
        this._graphicsOptions.shadowsQuality === ERendererShadowsQuality.medium ||
        this._graphicsOptions.shadowsQuality === ERendererShadowsQuality.high
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
