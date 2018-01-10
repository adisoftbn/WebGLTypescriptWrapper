export enum JoystickEventType {
  start = 'start',
  end = 'end'
}

export enum JoystickEventName {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right'
}

export interface JoystickEvent {
  type: JoystickEventType;
  name: JoystickEventName;
  power?: number;
}
