export interface IUserControlAlternateKeys {
  key: number;
  onlyOnPress: boolean;
  callback: Function;
}
export interface IUserControlKeyMapping {
  forwardKey: number,
  backwardKey: number,
  leftKey: number,
  rightKey: number,
  alternateEvents?: IUserControlAlternateKeys[]
}
