import { IGameRenderer } from '../';
import { ICharacterGalleryItem, CharacterGalleryItem } from '../model/';

export class CharacterGalleryManager {
  private _gameRenderer: IGameRenderer;
  private _models = {
    rabbit: new CharacterGalleryItem(
      'assets/models/Rabbit/',
      'Rabbit.babylon',
      'babylon',
      {
        stand: [0, 30],
        run: [31, 54]
      }
    ),
    dude: new CharacterGalleryItem(
      'assets/models/Dude/',
      'Dude.babylon',
      'babylon',
      {
        stand: [0, 30],
        run: [31, 54]
      }
    )
  }
  constructor(gameRenderer: IGameRenderer) {
    this._gameRenderer = gameRenderer;
  }

  getModelByName(name: string): ICharacterGalleryItem {
    if (this._models[name]) {
      return this._models[name];
    } else {
      throw new Error(`Cannot find model ${name}!`);
    }
  }
}
