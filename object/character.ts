import { Vector3, SceneLoader, MeshBuilder, Mesh } from 'babylonjs';

import { GameRenderer, IRendererGraphicOptions, RendererGraphicOptions, ERendererShadowQuality } from '../';
import { BaseModel } from './baseModel';

import { IUserControlKeyMapping, IUserControlAlternateKeys, INetworkChannel, ICharacterGalleryItem } from '../model';
import { frameRenderClock } from '../frameRenderClock';

export enum ECharacterAnimation {
  idle = 'idle',
  walk = 'walk',
  run = 'run',
  moveLeft = 'moveLeft',
  moveRight = 'moveRight',
  die = 'die',
  hitReceived = 'hitReceived',
  attack = 'attack'
}

export class Character extends BaseModel {
  protected _graphicsOptions: IRendererGraphicOptions;
  protected _userControl = false;
  protected _userControlKeyMapping: IUserControlKeyMapping = null;
  protected _networkingChannel: INetworkChannel = null;

  protected _characterAnimationSpeed = 0.8;

  protected _characterSpeed = 0;
  protected _characterSpeedMultiplier = 2;
  protected _characterSpeedIncreasePercent = 0.2;
  protected _characterInitialForwardSpeed = 0.02;
  protected _characterInitialBackwardSpeed = 0.02;
  protected _characterMaxForwardSpeed = 0.1;
  protected _characterMaxBackwardSpeed = 0.1;
  protected _characterRotateSpeed = 0.03;

  protected _modelLoaded = false;
  protected _model: Mesh = null;
  protected _modelRoot: Mesh = null;
  protected _animations = {};
  protected _skeletons = [];
  protected _initialPosition: Vector3;

  private currentAnimation: ECharacterAnimation = null;
  private currentAnimationSpeedRatio = 1;
  private currentAnimationTable = null;
  private killed = false;

  private keys = { left: 0, right: 0, forward: 0, backward: 0 };

  protected _keyPressEvents: IUserControlAlternateKeys[] = [];


  constructor(gameRenderer: GameRenderer, initialPosition: Vector3,
    userControlKeyMapping: IUserControlKeyMapping = null, networkingChannel: INetworkChannel = null,
    graphicsOptions?: IRendererGraphicOptions) {
    super(gameRenderer);
    this._graphicsOptions = (graphicsOptions ? graphicsOptions : new RendererGraphicOptions);
    this._initialPosition = initialPosition;
    this._modelRoot = MeshBuilder.CreateSphere('sphere', {
      diameterX: 3, diameterY: 10, diameterZ: 3
    }, this._gameRenderer.getScene());
    this._modelRoot.position.x = this._initialPosition.x;
    this._modelRoot.position.y = 0.5;
    this._modelRoot.position.z = this._initialPosition.z;
    this._modelRoot.scaling = new Vector3(0.1, 0.1, 0.1);

    this._modelRoot.material = new BABYLON.StandardMaterial('stairsmat', this._gameRenderer.getScene());
    this._modelRoot.material.alpha = 0;
    if (this._graphicsOptions.shadowEnabled && this._gameRenderer.getShadowGenerator()) {
      this._gameRenderer.getShadowGenerator().getShadowMap().renderList.push(this._modelRoot);
      if (
        this._graphicsOptions.shadowQuality === ERendererShadowQuality.medium ||
        this._graphicsOptions.shadowQuality === ERendererShadowQuality.high
      ) {
        this._gameRenderer.getShadowGenerator().addShadowCaster(this._modelRoot);
      }
    }


    if (userControlKeyMapping) {
      this._userControl = true;
      this._userControlKeyMapping = userControlKeyMapping;
      if (this._gameRenderer.isRealPhysicsCollisions()) {
        this._modelRoot.physicsImpostor = new BABYLON.PhysicsImpostor(
          this._modelRoot, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 50, restitution: 0, friction: 0.1 },
          this._gameRenderer.getScene()
        );
        this._modelRoot.physicsImpostor.executeNativeFunction(function (world, body) {
          body.fixedRotation = true;
          body.updateMassProperties();
        });
        if (this._userControlKeyMapping.alternateEvents) {
          this._userControlKeyMapping.alternateEvents.forEach(keyEvent => {
            this._keyPressEvents[keyEvent.key] = keyEvent;
          });
        }
        // this._modelRoot.onCollide = function (collidedMesh) { console.log('I am colliding with something'); console.log(collidedMesh); }
      } else {
        this._modelRoot.rotationQuaternion = null;
        this._modelRoot.ellipsoid = new BABYLON.Vector3(0.7, 0.7, 0.7);
        this._modelRoot.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0);
        // this._modelRoot.applyGravity = true;
        this._modelRoot.checkCollisions = true;
      }
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

  public getPosition() {
    if (this._modelLoaded) {
      return {
        x: this._modelRoot.position.x,
        y: this._modelRoot.position.y,
        z: this._modelRoot.position.z
      }
    }
    return {
      x: this._initialPosition.x,
      y: 0,
      z: this._initialPosition.y
    }
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
    const character = this._gameRenderer.getCharacterGallery().getModelByName(modelName);
    if (character) {
      this._characterAnimationSpeed = character.animationOptions.animationSpeed;
      this._characterInitialBackwardSpeed = character.animationOptions.initialForwardSpeed;
      this._characterInitialBackwardSpeed = character.animationOptions.initialBackwardSpeed;
      this._characterSpeedIncreasePercent = character.animationOptions.speedIncreasePercent;
      this._characterMaxForwardSpeed = character.animationOptions.maxForwardSpeed;
      this._characterMaxBackwardSpeed = character.animationOptions.maxBackwardSpeed;
      this._characterRotateSpeed = character.animationOptions.rotateSpeed;

      this._animations = character.animations;
      const scene = this._gameRenderer.getScene();
      SceneLoader.ImportMesh('', character.modelPath, character.modelFileName, scene,
        (newMeshes, particleSystems, skeletons) => {
          this.importMeshSuccess(newMeshes, particleSystems, skeletons, character);
          if (callback) {
            callback();
          }
        });
    }
  }

  switchToAnimation(animationName: ECharacterAnimation, speedRatio: number = 0.8, loop = true, callback: Function = null) {
    if (this.currentAnimation !== animationName && this._animations[animationName]) {
      this.currentAnimation = animationName;
      this.currentAnimationSpeedRatio = speedRatio;
      // this._model.beginAnimation()
      this.currentAnimationTable = this._gameRenderer.getScene().beginAnimation(
        this._skeletons[0],
        this._animations[animationName][0],
        this._animations[animationName][1],
        loop,
        this._characterAnimationSpeed,
        callback
      );
    } else { // if (this.currentAnimationSpeedRatio !== speedRatio) {
      this.currentAnimationTable.speedRatio = speedRatio;
      this.currentAnimationSpeedRatio = speedRatio;
    }
  }

  getCurrentSpeed() {
    return 1 + ((this._characterSpeed / this._characterMaxBackwardSpeed) * 0.1);
  }

  private importMeshSuccess(newMeshes, particleSystems, skeletons, character: ICharacterGalleryItem = null) {
    try {
      if (newMeshes.length > 0) {
        const scene = this._gameRenderer.getScene();
        this._skeletons = skeletons;
        this._model = newMeshes[0];
        this._model.parent = this._modelRoot;

        if (character && character.transform.rotate) {
          if (character.transform.rotate[0] !== 0) {
            this._model.rotate(BABYLON.Axis.X, Math.PI * (character.transform.rotate[0] / 180), BABYLON.Space.LOCAL);
          }
          if (character.transform.rotate[1] !== 0) {
            this._model.rotate(BABYLON.Axis.Y, Math.PI * (character.transform.rotate[1] / 180), BABYLON.Space.LOCAL);
          }
          if (character.transform.rotate[2] !== 0) {
            this._model.rotate(BABYLON.Axis.Z, Math.PI * (character.transform.rotate[2] / 180), BABYLON.Space.LOCAL);
          }
        }

        if (character && character.transform.position) {
          this._model.position.set(character.transform.position[0], character.transform.position[1], character.transform.position[2]);
        } else {
          this._model.position.y = -5.2;
        }
        if (character && character.transform.scale) {
          this._model.scaling = new Vector3(character.transform.scale[0], character.transform.scale[1], character.transform.scale[2]);
        } else {
          this._model.scaling = new Vector3(0.1, 0.1, 0.1);
        }
        if (this._graphicsOptions.shadowEnabled) {
          this._gameRenderer.getShadowGenerator().getShadowMap().renderList.push(this._model);
          if (
            this._graphicsOptions.shadowQuality === ERendererShadowQuality.low ||
            this._graphicsOptions.shadowQuality === ERendererShadowQuality.medium ||
            this._graphicsOptions.shadowQuality === ERendererShadowQuality.high
          ) {
            this._gameRenderer.getShadowGenerator().addShadowCaster(this._model);
          }
        }
        this.switchToAnimation(ECharacterAnimation.idle);
        if (!this._modelLoaded) {
          this._modelLoaded = true;
          if (this._userControl && !this.killed) {
            this._modelRoot.registerBeforeRender(() => {
              if (this.killed) {
                return;
              }
              let delta = 0;
              if (this.keys.forward || this.keys.backward || this.keys.right || this.keys.left) {
                delta = frameRenderClock.getCachedDelta() / 20;
              }
              if (this.keys.forward === 1) {
                this.increaseCharacterSpeedForward();
                if (this._gameRenderer.isPhysicsEnabled()) {
                  const velocity = BABYLON.Vector3.TransformNormal(
                    new BABYLON.Vector3(0, 0, this._characterSpeed * this._characterSpeedMultiplier * delta),
                    this._modelRoot.computeWorldMatrix()
                  );
                  this._modelRoot.moveWithCollisions(velocity);
                } else {
                  const posX = Math.sin(this._modelRoot.rotation.y) * this._characterSpeed * this._characterSpeedMultiplier * delta;
                  const posZ = Math.cos(this._modelRoot.rotation.y) * this._characterSpeed * this._characterSpeedMultiplier * delta;
                  this._modelRoot.position.x += posX;
                  this._modelRoot.position.z += posZ;
                }
              } else if (this.keys.backward === 1) {
                this.fixCharacterSpeedBackward();
                if (this._gameRenderer.isPhysicsEnabled()) {
                  const velocity = BABYLON.Vector3.TransformNormal(
                    new BABYLON.Vector3(0, 0, this._characterSpeed * this._characterSpeedMultiplier * delta),
                    this._modelRoot.computeWorldMatrix()
                  );
                  const newVelocity = velocity.negate();
                  this._modelRoot.moveWithCollisions(newVelocity);
                } else {
                  const posX = Math.sin(this._modelRoot.rotation.y) * this._characterSpeed * this._characterSpeedMultiplier * delta;
                  const posZ = Math.cos(this._modelRoot.rotation.y) * this._characterSpeed * this._characterSpeedMultiplier * delta;
                  this._modelRoot.position.x -= posX;
                  this._modelRoot.position.z -= posZ;
                }
              }
              if (this.keys.forward === 0 && this.keys.backward === 0 && this._characterSpeed > 0) {
                this._characterSpeed = 0;
              }
              if (this.keys.right === 1) {
                this._modelRoot.rotate(BABYLON.Axis.Y, this._characterRotateSpeed * delta, BABYLON.Space.LOCAL);
              }
              if (this.keys.left === 1) {
                this._modelRoot.rotate(BABYLON.Axis.Y, -this._characterRotateSpeed * delta, BABYLON.Space.LOCAL);
              }
            });
          }

        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  killCharacter(callback: Function = null) {
    if (!this.killed) {
      this.killed = true;
      this.switchToAnimation(ECharacterAnimation.die, 1, false, callback);
    }
  }

  isCharacterKilled() {
    return this.killed;
  }

  public keyPressListener(event) {
    if (this.killed) {
      return;
    }
    if (this._keyPressEvents[event.keyCode]) {
      event.preventDefault();
      event.stopPropagation();
      this._keyPressEvents[event.keyCode].callback();
    }
  }

  public keyDownListener(event) {
    if (this.killed) {
      return;
    }
    if (event.keyCode === this._userControlKeyMapping.leftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.keys.left = 1;
    }
    if (event.keyCode === this._userControlKeyMapping.rightKey) {
      event.preventDefault();
      event.stopPropagation();
      this.keys.right = 1;
    }
    if (event.keyCode === this._userControlKeyMapping.forwardKey) {
      event.preventDefault();
      event.stopPropagation();
      this.keys.forward = 1;
      this.switchToAnimation(ECharacterAnimation.walk, 1 + ((this._characterSpeed / this._characterMaxBackwardSpeed) * 0.1));
    }
    if (event.keyCode === this._userControlKeyMapping.backwardKey) {
      event.preventDefault();
      event.stopPropagation();
      this.keys.backward = 1;
      this.switchToAnimation(ECharacterAnimation.walk, 1 + ((this._characterSpeed / this._characterMaxBackwardSpeed) * 0.1));
    }
  }

  public keyUpListener(event) {
    if (this.killed) {
      return;
    }
    if (event.keyCode === this._userControlKeyMapping.leftKey) {
      this.keys.left = 0;
      /* if (!this.keys.forward && !this.keys.backward) {
        this.switchToAnimation(ECharacterAnimation.idle);
      }*/
    }
    if (event.keyCode === this._userControlKeyMapping.rightKey) {
      this.keys.right = 0;
      /* if (!this.keys.forward && !this.keys.backward) {
        this.switchToAnimation(ECharacterAnimation.idle);
      }*/
    }
    if (event.keyCode === this._userControlKeyMapping.forwardKey) {
      this.keys.forward = 0;
      if (!this.keys.backward) {
        this.switchToAnimation(ECharacterAnimation.idle);
      }
    }
    if (event.keyCode === this._userControlKeyMapping.backwardKey) {
      this.keys.backward = 0;
      if (!this.keys.forward) {
        this.switchToAnimation(ECharacterAnimation.idle);
      }
    }
  }

  private increaseCharacterSpeedForward() {
    if (this._characterSpeed === 0) {
      this._characterSpeed = this._characterInitialForwardSpeed;
    } else if (this._characterSpeed < this._characterMaxForwardSpeed) {
      this._characterSpeed += this._characterSpeed * this._characterSpeedIncreasePercent;
      if (this._characterSpeed > this._characterMaxForwardSpeed) {
        this._characterSpeed = this._characterMaxForwardSpeed;
      }
    }
  }

  private fixCharacterSpeedBackward() {
    if (this._characterSpeed === 0) {
      this._characterSpeed = this._characterInitialBackwardSpeed;
    } else if (this._characterSpeed < this._characterMaxBackwardSpeed) {
      this._characterSpeed += this._characterSpeed * this._characterSpeedIncreasePercent;
    } else {
      this._characterSpeed = this._characterMaxBackwardSpeed;
    }
  }

  public destroy() {
    if (this._model) {
      this._model.dispose();
      this._model = null;
      this._modelRoot.dispose();
      this._modelRoot = null;
    }
  }


}
