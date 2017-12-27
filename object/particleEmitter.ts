import { Vector3, StandardMaterial, MeshBuilder, Mesh, ParticleSystem, Vector4, Color4, Texture } from 'babylonjs';

import { GameRenderer, IRendererGraphicOptions, RendererGraphicOptions, ERendererShadowQuality } from '../';
import { BaseModel } from './baseModel';

export interface IParticlePosition {
  start: Vector3;
  end: Vector3;
}
export interface IParticleDirection {
  direction1: Vector3;
  direction2: Vector3;
}

export interface IParticleColor {
  color1: Color4;
  color2: Color4;
  deadColor: Color4;
}

export interface IParticleOptions {
  minSize: number;
  maxSize: number;
  minLifeTime: number;
  maxLifeTime: number;
  emitRate: number;
  maxParticles: number;
  noGravity?: boolean;
  minEmitPower?: number;
  maxEmitPower?: number;
  updateSpeed?: number;
}

export class ParticleEmitter extends BaseModel {
  protected _particleSystem: ParticleSystem = null;
  protected _initialPosition: Vector3;
  protected _textureLoaded = false;
  protected _textureWidth = 1;
  protected _textureHeight = 1;

  constructor(gameRenderer: GameRenderer, mesh: Mesh, position: IParticlePosition,
    direction: IParticleDirection, color: IParticleColor, options: IParticleOptions
  ) {
    super(gameRenderer);
    this._particleSystem = new ParticleSystem('', options.maxParticles, this._gameRenderer.getScene());

    // Where the particles come from
    this._particleSystem.emitter = mesh; // the starting object, the emitter
    this._particleSystem.minEmitBox = position.start; // Starting all from
    this._particleSystem.maxEmitBox = position.end; // To...

    // Colors of all particles
    this._particleSystem.color1 = color.color1;
    this._particleSystem.color2 = color.color2;
    this._particleSystem.colorDead = color.deadColor;

    // Size of each particle (random between...
    this._particleSystem.minSize = options.minSize;
    this._particleSystem.maxSize = options.maxSize;

    // Life time of each particle (random between...
    this._particleSystem.minLifeTime = options.minLifeTime;
    this._particleSystem.maxLifeTime = options.maxLifeTime;

    // Emission rate
    this._particleSystem.emitRate = options.emitRate;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    this._particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    if (!options.noGravity) {
      this._particleSystem.gravity = new Vector3(0, this._gameRenderer.getGravity(), 0);
    }

    // Direction of each particle after it has been emitted
    this._particleSystem.direction1 = direction.direction1;
    this._particleSystem.direction2 = direction.direction2;

    // Angular speed, in radians
    this._particleSystem.minAngularSpeed = 0;
    this._particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    this._particleSystem.minEmitPower = (options.minEmitPower ? options.minEmitPower : 1);
    this._particleSystem.maxEmitPower = (options.maxEmitPower ? options.maxEmitPower : 5);
    this._particleSystem.updateSpeed = (options.updateSpeed ? options.updateSpeed : 0.005);

    // Start the particle system
    this._particleSystem.start();
  }

  public setTexture(textureUrl: string) {
    this._particleSystem.particleTexture = new Texture(textureUrl, this._gameRenderer.getScene());
  }

  public stop() {
    this._particleSystem.stop();
  }

  public start() {
    this._particleSystem.start();
  }

  public setTextureFromGallery(textureName) {
    this._gameRenderer.getTextureGallery().getTextureObjectByName(textureName).then(texture => {
      this._particleSystem.particleTexture = texture;
      const sizes = this._particleSystem.particleTexture.getSize();
      this._textureLoaded = true;
      this._textureWidth = sizes['width'];
      this._textureHeight = sizes['height'];
    });
  }

  public destroy() {
    this._particleSystem.dispose();
  }

}
