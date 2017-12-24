import { Vector3, SceneLoader, MeshBuilder } from 'babylonjs';

import { IGameRenderer } from '../';
import { BaseModel } from './baseModel';

import { IUserControlKeyMapping, INetworkChannel } from '../model';

export class Character extends BaseModel {
  protected _userControl = false;
  protected _userControlKeyMapping: IUserControlKeyMapping = null;
  protected _networkingChannel: INetworkChannel = null;
  protected _characterSpeed = 0;
  protected _characterInitialForwardSpeed = 0.02;
  protected _characterMaxForwardSpeed = 0.1;
  protected _characterBackwardSpeed = 0.04;
  protected _characterRotateSpeed = 0.03;

  protected _modelLoaded = false;
  protected _model = null;
  protected _modelRoot = null;
  protected _modelhead = null;
  protected _animations = {};
  protected _skeletons = [];
  protected _initialPosition: Vector3;

  public animationSpeed = 0.8;
  private currentAnimation = null;
  public headHeight = 60;
  private keys = { left: 0, right: 0, forward: 0, backward: 0 };


  constructor(gameRenderer: IGameRenderer, initialPosition: Vector3,
    userControlKeyMapping?: IUserControlKeyMapping, networkingChannel?: INetworkChannel) {
    super(gameRenderer);
    this._gameRenderer = gameRenderer;
    this._initialPosition = initialPosition;
    this._modelRoot = MeshBuilder.CreateBox('', { size: 0.001 }, this._gameRenderer.getScene());
    this._modelRoot.scaling = new Vector3(0.1, 0.1, 0.1);
    this._modelhead = MeshBuilder.CreateSphere('', { segments: 4, diameter: 0.01 }, this._gameRenderer.getScene());
    this._modelhead.parent = this._modelRoot;
    this._modelhead.receiveShadows = true;
    this._gameRenderer.getShadowGenerator().getShadowMap().renderList.push(this._modelRoot);

    this._modelhead.position.y = this.headHeight;
    if (userControlKeyMapping) {
      this._userControl = true;
      this._userControlKeyMapping = userControlKeyMapping;
    }
    if (networkingChannel) {
      this._networkingChannel = networkingChannel;
    }


  }

  getModel() {
    return this._model;
  }

  getModelRoot() {
    return this._modelRoot;
  }

  getModelHead() {
    return this._modelhead;
  }

  public buildFromUrl(modelName: string, path: string, modelFileName: string, callback?: Function) {
    const scene = this._gameRenderer.getScene();
    SceneLoader.ImportMesh(modelName, path, modelFileName, scene,
      (newMeshes, particleSystems, skeletons) => {
        this.importMeshSuccess(newMeshes, particleSystems, skeletons);
        if (callback) {
          callback();
        }
      });
  }

  public buildFromGallery(modelName, callback?: Function) {
    const model = this._gameRenderer.getCharacterGallery().getModelByName(modelName);
    console.log(model);
    if (model) {
      this._animations = model.animations;
      const scene = this._gameRenderer.getScene();
      SceneLoader.ImportMesh('', model.modelPath, model.modelFileName, scene,
        (newMeshes, particleSystems, skeletons) => {
          this.importMeshSuccess(newMeshes, particleSystems, skeletons);
          if (callback) {
            callback();
          }
        });
    }
  }

  switchToAnimation(animationName) {
    if (this.currentAnimation !== animationName && this._animations[animationName]) {
      this.currentAnimation = animationName;
      this._gameRenderer.getScene().beginAnimation(
        this._skeletons[0],
        this._animations[animationName][0],
        this._animations[animationName][1],
        true,
        this.animationSpeed
      );
    }
  }

  private importMeshSuccess(newMeshes, particleSystems, skeletons) {
    try {
      if (newMeshes.length > 0) {
        const scene = this._gameRenderer.getScene();
        this._skeletons = skeletons;
        this._model = newMeshes[0];
        this._model.position.x = 1000;
        this._model.parent = this._modelRoot;
        this._model.position = this._initialPosition;
        this._model.scaling = new Vector3(0.1, 0.1, 0.1);
        // this._model.receiveShadows = true;
        this._gameRenderer.getShadowGenerator().getShadowMap().renderList.push(this._model);
        this._gameRenderer.getShadowGenerator().addShadowCaster(this._model);
        this.switchToAnimation('stand');
        // this._model.rotation.y = Math.PI;
        // scene.beginAnimation(skeletons[0], 0, 500, true, 0.8);
        if (!this._modelLoaded) {
          this._modelLoaded = true;
          if (this._userControl) {
            window.addEventListener('keydown', (event) => {
              if (event.keyCode === this._userControlKeyMapping.leftKey) {
                this.keys.left = 1;
                this.switchToAnimation('moveLeft');
              }
              if (event.keyCode === this._userControlKeyMapping.rightKey) {
                this.keys.right = 1;
                this.switchToAnimation('moveRight');
              }
              if (event.keyCode === this._userControlKeyMapping.forwardKey) {
                this.keys.forward = 1;
                this.switchToAnimation('run');
              }
              if (event.keyCode === this._userControlKeyMapping.backwardKey) {
                this.keys.backward = 1;
                this.switchToAnimation('run');
              }
            });
            window.addEventListener('keyup', (event) => {
              if (event.keyCode === this._userControlKeyMapping.leftKey) {
                this.keys.left = 0;
                if (!this.keys.forward && !this.keys.backward) {
                  this.switchToAnimation('stand');
                }
              }
              if (event.keyCode === this._userControlKeyMapping.rightKey) {
                this.keys.right = 0;
                if (!this.keys.forward && !this.keys.backward) {
                  this.switchToAnimation('stand');
                }
              }
              if (event.keyCode === this._userControlKeyMapping.forwardKey) {
                this.keys.forward = 0;
                if (!this.keys.backward) {
                  this.switchToAnimation('stand');
                }
              }
              if (event.keyCode === this._userControlKeyMapping.backwardKey) {
                this.keys.backward = 0;
                if (!this.keys.forward) {
                  this.switchToAnimation('stand');
                }
              }
            });
            this._gameRenderer.getScene().registerBeforeRender(() => {
              if (this.keys.forward === 1) {
                this.increaseCharacterSpeedForward();
                const posX = Math.sin(this._modelRoot.rotation.y) * this._characterSpeed;
                const posZ = Math.cos(this._modelRoot.rotation.y) * this._characterSpeed;
                // console.log(posX, posZ);
                // const cameraX = this._modelRoot.position.x - posX * 10;
                // const cameraY = this._modelRoot.position.y - posZ * 10;
                this._modelRoot.position.x += posX;
                this._modelRoot.position.z += posZ;
                // this._gameRenderer.setCameraTarget(this._modelRoot, true, cameraX, cameraY);
              } else if (this.keys.backward === 1) {
                this.fixCharacterSpeedBackward();
                const posX = Math.sin(this._modelRoot.rotation.y) * this._characterSpeed;
                const posZ = Math.cos(this._modelRoot.rotation.y) * this._characterSpeed;
                // console.log(posX, posZ);
                // const cameraX = this._modelRoot.position.x - posX * 10;
                // const cameraY = this._modelRoot.position.y - posZ * 10;
                this._modelRoot.position.x -= posX;
                this._modelRoot.position.z -= posZ;
                /// this._gameRenderer.setCameraTarget(this._modelRoot, true, cameraX, cameraY);
              }
              if (this.keys.forward === 0 && this.keys.backward === 0 && this._characterSpeed > 0) {
                this._characterSpeed = 0;
              }
              if (this.keys.right === 1) {
                this._modelRoot.rotation.y = this._modelRoot.rotation.y + this._characterRotateSpeed;
              }
              if (this.keys.left === 1) {
                this._modelRoot.rotation.y = this._modelRoot.rotation.y - this._characterRotateSpeed
              }
            });
          }

        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  increaseCharacterSpeedForward() {
    if (this._characterSpeed === 0) {
      this._characterSpeed = this._characterInitialForwardSpeed;
    } else
      if (this._characterSpeed < this._characterMaxForwardSpeed) {
        this._characterSpeed += this._characterSpeed * this._characterInitialForwardSpeed;
        if (this._characterSpeed > this._characterMaxForwardSpeed) {
          this._characterSpeed = this._characterMaxForwardSpeed;
        }
      }
  }

  fixCharacterSpeedBackward() {
    if (this._characterSpeed !== this._characterBackwardSpeed) {
      this._characterSpeed = this._characterBackwardSpeed;
    }
  }

}
