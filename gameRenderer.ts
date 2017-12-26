import {
  Engine, Scene, FreeCamera, Light, DirectionalLight, IShadowLight, PointLight, Texture,
  Vector3, HemisphericLight, MeshBuilder, ShadowGenerator, ArcRotateCamera, StandardMaterial, Color3, FollowCamera
} from 'babylonjs';

import { IGameRenderer } from './gameRenderer.interface';
import { CharacterGalleryManager, TextureGalleryManager } from './gallery';
import 'assets/js/babylonjs.scene-fps';

import { frameRenderClock } from './frameRenderClock';

export enum ERendererShadowsQuality {
  low = 'LOW',
  medium = 'MEDIUM',
  high = 'HIGH',
}


export interface IRendererGraphicOptions {
  shadowsEnabled: boolean;
  shadowsQuality: ERendererShadowsQuality;
}

export class RendererGraphicOptions implements IRendererGraphicOptions {
  shadowsEnabled: true;
  shadowsQuality: ERendererShadowsQuality.medium;
}

export class GameRenderer implements IGameRenderer {
  protected _graphicsOptions: IRendererGraphicOptions;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  private _scene: Scene;
  private _camera: FreeCamera;
  private _light: PointLight;
  private _shadowGenerator: ShadowGenerator;
  private _characterGallery: CharacterGalleryManager;
  private _textureGallery: TextureGalleryManager;

  public texturesQuality = 'hq'; // hq/mq/lq
  public diffuseColor: Color3 = new Color3(0.8, 0.8, 0.8);
  public specularColor: Color3 = new Color3(0.3, 0.3, 0.3);
  public ambientColor: Color3 = new Color3(0.5, 0.5, 0.5);

  protected _physicsEnabled = true;
  protected _gravity = -9.81;
  protected _realPhysicsCollisions = true;
  // protected _gravity = -1.81;

  constructor(canvasElement: string,
    graphicsOptions?: IRendererGraphicOptions) {
    this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
    this._graphicsOptions = (graphicsOptions ? graphicsOptions : new RendererGraphicOptions);
    this._engine = new Engine(this._canvas, true);
    this._engine.enableOfflineSupport = false;
    this._characterGallery = new CharacterGalleryManager(this);
    this._textureGallery = new TextureGalleryManager(this);
  }

  public isPhysicsEnabled() {
    return this._physicsEnabled;
  }

  public isRealPhysicsCollisions() {
    return this._realPhysicsCollisions;
  }

  public getGravity() {
    return this._gravity;
  }

  public createScene() {
    this._scene = new Scene(this._engine);
    (this._scene as any).showFps();
    this._scene.ambientColor = this.ambientColor;

    this._light = new PointLight('light1', new Vector3(0, 30, -30), this._scene);
    this._light.intensity = 2;
    this._camera = new FreeCamera('camera1', new Vector3(0, 0, -10), this._scene);
    this._camera.minZ = 10.0;

    if (this._physicsEnabled) {
      if (this.isRealPhysicsCollisions()) {
        const physicsPlugin = new BABYLON.CannonJSPlugin();
        this._scene.enablePhysics(new BABYLON.Vector3(0, this._gravity, 0), physicsPlugin);
      } else {
        this._scene.enablePhysics(new BABYLON.Vector3(0, this._gravity, 0));
        this._scene.collisionsEnabled = true;
      }
    }

    this._scene.shadowsEnabled = this._graphicsOptions.shadowsEnabled;
    if (this._graphicsOptions.shadowsEnabled) {
      this._shadowGenerator = new ShadowGenerator(1024, this._light);
      this._shadowGenerator.setDarkness(0.5);
      if (
        this._graphicsOptions.shadowsQuality === ERendererShadowsQuality.medium ||
        this._graphicsOptions.shadowsQuality === ERendererShadowsQuality.high
      ) {
        this._shadowGenerator.usePoissonSampling = true;
        this._shadowGenerator.bias = 0;
        this._shadowGenerator.useBlurExponentialShadowMap = true;
      }
    }
  }

  public getScene(): Scene {
    return this._scene;
  }

  public getCamera() {
    return this._camera;
  }

  public getShadowGenerator() {
    return this._shadowGenerator;
  }

  public getCharacterGallery() {
    return this._characterGallery;
  }

  public getTextureGallery() {
    return this._textureGallery;
  }

  public setCameraTarget(model, updateCameraPosition: boolean = false, cameraX: number = 0, cameraZ: number = 0) {
    this._camera.lockedTarget = model;
  }

  public animate() {
    // run the render loop
    this._engine.runRenderLoop(() => {
      frameRenderClock.getDelta();
      this._scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      this._engine.resize();
    });
  }
}
