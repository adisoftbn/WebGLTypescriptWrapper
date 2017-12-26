import { Vector3, StandardMaterial, MeshBuilder, Mesh, Vector4, Texture } from 'babylonjs';

import { GameRenderer, IRendererGraphicOptions, RendererGraphicOptions, ERendererShadowsQuality } from '../';
import { BaseModel } from './baseModel';

export class Cube extends BaseModel {
  protected _graphicsOptions: IRendererGraphicOptions;
  protected _model: Mesh = null;
  protected _modelMaterial;

  protected _initialWidth = 1;
  protected _initialHeight = 1;
  protected _initialDepth = 1;
  protected _initialPosition: Vector3;
  protected _modelBuilt = false;
  protected _textureLoaded = false;
  protected _textureWidth = 1;
  protected _textureHeight = 1;

  constructor(gameRenderer: GameRenderer, initialPosition: Vector3, width, height, depth, autoBuild = true,
    graphicsOptions?: IRendererGraphicOptions
  ) {
    super(gameRenderer);
    this._graphicsOptions = (graphicsOptions ? graphicsOptions : new RendererGraphicOptions);
    this._initialWidth = width;
    this._initialHeight = height;
    this._initialDepth = depth;
    this._initialPosition = initialPosition;
    this._modelMaterial = new StandardMaterial('model', this._gameRenderer.getScene());
    this._modelMaterial.diffuseColor = this._gameRenderer.diffuseColor;
    this._modelMaterial.specularColor = this._gameRenderer.specularColor;
    this._modelMaterial.ambientColor = this._gameRenderer.ambientColor;


    if (autoBuild) {
      this.buildModel();
    }
  }
  private buildModel() {
    if (this._modelBuilt) {
      return;
    }
    this._modelBuilt = true;
    const faces = [];
    if (this._textureLoaded) {
      const ratio = this._textureWidth / this._textureHeight;
      faces.push(new Vector4(0, 0, this._initialWidth / ratio, this._initialHeight * ratio));
      faces.push(new Vector4(0, 0, this._initialWidth / ratio, this._initialHeight * ratio));
      faces.push(new Vector4(0, 0, this._initialHeight * ratio, this._initialDepth * ratio)); // 1
      faces.push(new Vector4(0, 0, this._initialHeight * ratio, this._initialDepth * ratio));
      faces.push(new Vector4(0, 0, this._initialDepth / ratio, this._initialWidth * ratio));
      faces.push(new Vector4(0, 0, this._initialDepth / ratio, this._initialWidth * ratio));
    } else {
      faces.push(new Vector4(0, 0, 1, 1));
      faces.push(new Vector4(0, 0, 1, 1));
      faces.push(new Vector4(0, 0, 1, 1));
      faces.push(new Vector4(0, 0, 1, 1));
      faces.push(new Vector4(0, 0, 1, 1));
      faces.push(new Vector4(0, 0, 1, 1));
    }
    this._model = MeshBuilder.CreateBox('', {
      width: this._initialWidth,
      height: this._initialHeight,
      depth: this._initialDepth,
      faceUV: faces
    }, this._gameRenderer.getScene());

    // this._model.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
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
    if (this._gameRenderer.isPhysicsEnabled()) {
      if (this._gameRenderer.isRealPhysicsCollisions()) {
        this._gameRenderer.getShadowGenerator().addShadowCaster(this._model);
        this._model.physicsImpostor = new BABYLON.PhysicsImpostor(
          this._model, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 },
          this._gameRenderer.getScene()
        );
      } else {
        this._model.checkCollisions = true;
        this._model.useOctreeForCollisions = true;
        const octree = this._gameRenderer.getScene().createOrUpdateSelectionOctree();
        octree.dynamicContent.push(this._model);
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
      this.buildModel();
    });
  }



}
