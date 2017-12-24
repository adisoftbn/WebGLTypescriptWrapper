import {
  Engine, Scene, FreeCamera, Light, DirectionalLight, IShadowLight, PointLight, Texture,
  Vector3, HemisphericLight, MeshBuilder, ShadowGenerator, ArcRotateCamera, StandardMaterial, Color3, FollowCamera
} from 'babylonjs';


import { IGameRenderer } from './gameRenderer.interface';
import { CharacterGalleryManager, TextureGalleryManager } from './gallery';
import { setInterval, clearInterval } from 'timers';


export class GameRenderer implements IGameRenderer {
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  private _scene: Scene;
  private _camera: FreeCamera;
  private _light: PointLight;
  private _shadowGenerator: ShadowGenerator;
  private _characterGallery: CharacterGalleryManager;
  private _textureGallery: TextureGalleryManager;

  private _ground = null;
  private _groundSizeWidth = 50;
  private _groundSizeHeight = 50;
  private _groundMaterial = null;

  public texturesQuality = 'hq'; // hq/mq/lq
  public diffuseColor: Color3 = new Color3(0.8, 0.8, 0.8);
  public specularColor: Color3 = new Color3(0.3, 0.3, 0.3);
  public ambientColor: Color3 = new Color3(0.5, 0.5, 0.5);

  protected _physicsEnabled = true;

  constructor(canvasElement: string) {
    this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
    this._engine = new Engine(this._canvas, true);
    this._engine.enableOfflineSupport = false;
    this._characterGallery = new CharacterGalleryManager(this);
    this._textureGallery = new TextureGalleryManager(this);
  }

  public isPhysicsEnabled() {
    return this._physicsEnabled;
  }

  public createScene() {
    this._scene = new Scene(this._engine);
    this._light = new PointLight('light1', new Vector3(0, 30, -30), this._scene);
    this._light.intensity = 2;
    this._camera = new FreeCamera('camera1', new Vector3(0, 0, -10), this._scene);
    this._scene.shadowsEnabled = true;
    if (this._physicsEnabled) {
      this._scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
      this._camera.checkCollisions = true;
      this._camera.applyGravity = true;
    }


    this._scene.ambientColor = this.ambientColor;

    // this._light.position = new Vector3(20, 150, 70);

    // this._camera.attachControl(this._canvas, true);
    // this._camera.setPosition(new BABYLON.Vector3(0, 40, 12));
    this._camera.minZ = 10.0;


    this._ground = MeshBuilder.CreateGround('ground1', {
      width: this._groundSizeWidth, height: this._groundSizeHeight, subdivisions: 2
    }, this._scene);
    this._groundMaterial = new StandardMaterial('ground', this._scene);
    this._groundMaterial.diffuseColor = this.diffuseColor;
    this._groundMaterial.specularColor = this.specularColor;
    // this._groundMaterial.backFaceCulling = false;
    this._ground.material = this._groundMaterial;
    this._ground.receiveShadows = true;
    if (this._physicsEnabled) {
      this._ground.checkCollisions = true;
    }
    this._shadowGenerator = new ShadowGenerator(2048, this._light);
    this._shadowGenerator.setDarkness(0.5);
    this._shadowGenerator.usePoissonSampling = true;

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

  public setGroundSize(width, height) {
    this._groundSizeWidth = width;
    this._groundSizeHeight = height;
  }

  public setGroundTexture(textureUrl: string) {
    this._ground.material.diffuseTexture = new Texture(textureUrl, this._scene);
  }

  public setGroundTextureFromGallery(textureName) {
    this._textureGallery.getTextureObjectByName(textureName).then(texture => {
      this._ground.material.diffuseTexture = texture;
      const sizes = this._ground.material.diffuseTexture.getSize();
      const ratio = sizes['width'] / sizes['height'];
      this._ground.material.diffuseTexture.uScale = this._groundSizeWidth * ratio;
      this._ground.material.diffuseTexture.vScale = this._groundSizeHeight / ratio;
    });
  }

  public setCameraTarget(model, updateCameraPosition: boolean = false, cameraX: number = 0, cameraZ: number = 0) {
    this._camera.lockedTarget = model;
    if (updateCameraPosition) {
      // this._camera.position.y = cameraX;
      // this._camera.position.x = cameraZ;
    }
    // this._camera.setTarget(model.position);
  }

  public animate() {
    // run the render loop
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      this._engine.resize();
    });
  }
}
