import { IGameRenderer } from '../';
import { ICharacterGalleryItem, CharacterGalleryItem } from '../model/';

export class CharacterGalleryManager {
  private _gameRenderer: IGameRenderer;
  private _modelsData = [
    {
      name: 'rabbit',
      modelPath: 'assets/models/Rabbit/',
      modelFileName: 'Rabbit.babylon',
      modelFileType: 'babylon',
      animations: {
        stand: [0, 30],
        run: [31, 54]
      }
    },
    {
      name: 'dude',
      modelPath: 'assets/models/Dude/',
      modelFileName: 'Dude.babylon',
      modelFileType: 'babylon',
      animations: {
        stand: [0, 30],
        run: [31, 54]
      }
    }
  ];
  private _models = {};
  constructor(gameRenderer: IGameRenderer) {
    this._gameRenderer = gameRenderer;
    this.initCharacterObjects();
  }

  private initCharacterObjects() {
    this._modelsData.forEach(model => {
      const newCharacterItem = new CharacterGalleryItem();
      newCharacterItem.name = model.name;
      newCharacterItem.modelPath = model.modelPath;
      newCharacterItem.modelFileName = model.modelFileName;
      newCharacterItem.modelFileType = model.modelFileType;
      newCharacterItem.animations = model.animations;
      this._models[model.name] = newCharacterItem;
    });
  }


  getModelByName(name: string): ICharacterGalleryItem {
    if (this._models[name]) {
      return this._models[name];
    } else {
      throw new Error(`Cannot find model ${name}!`);
    }
  }
}
