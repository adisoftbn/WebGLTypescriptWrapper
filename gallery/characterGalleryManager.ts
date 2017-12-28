import { GameRenderer } from '../';
import { ICharacterGalleryItem, CharacterGalleryItem } from '../model/';

export class CharacterGalleryManager {
  private _gameRenderer: GameRenderer;
  private _models = {};
  constructor(gameRenderer: GameRenderer) {
    this._gameRenderer = gameRenderer;
  }

  public initCharacterObjects(charactersData) {
    charactersData.forEach(model => {
      const newCharacterItem = new CharacterGalleryItem();
      newCharacterItem.name = model.name;
      newCharacterItem.modelPath = model.modelPath;
      newCharacterItem.modelFileName = model.modelFileName;
      newCharacterItem.modelFileType = model.modelFileType;
      newCharacterItem.animations = model.animations;
      newCharacterItem.transform = model.transform;
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
