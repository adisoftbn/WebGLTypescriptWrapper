import { Vector3, StandardMaterial, MeshBuilder, Mesh, Vector4, Texture } from 'babylonjs';


import { BaseModel } from './baseModel';
import { GameRenderer, IRendererGraphicOptions, RendererGraphicOptions, ERendererShadowsQuality } from '../';

export class Ground extends BaseModel {
  protected _graphicsOptions: IRendererGraphicOptions;
  private _model = null;
  private _groundWidth = 50;
  private _groundHeight = 50;
  private _groundMaterial = null;

  constructor(gameRenderer: GameRenderer, initialPosition: Vector3, width: number, height: number, textureName: string = null,
    graphicsOptions?: IRendererGraphicOptions) {
    super(gameRenderer);
    this._graphicsOptions = (graphicsOptions ? graphicsOptions : new RendererGraphicOptions);
    this._groundWidth = width;
    this._groundHeight = height;
    this._model = BABYLON.MeshBuilder.CreateGround('ground1', { height: height, width: width }, this._gameRenderer.getScene());
    this._model.position = initialPosition;
    if (this._graphicsOptions.shadowsEnabled) {
      this._model.receiveShadows = true;
    }

    if (this._gameRenderer.isPhysicsEnabled()) {
      if (this._gameRenderer.isRealPhysicsCollisions()) {
        this._model.physicsImpostor = new BABYLON.PhysicsImpostor(
          this._model, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0.5 },
          this._gameRenderer.getScene()
        );
      } else {
        this._model.rotationQuaternion = null;
        this._model.applyGravity = true;
        this._model.checkCollisions = true;
        this._model.isPickable = false;
        this._model.useOctreeForCollisions = true;
        const octree = this._gameRenderer.getScene().createOrUpdateSelectionOctree();
        octree.dynamicContent.push(this._model);
      }
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
