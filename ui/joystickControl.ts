import { JoystickEvent, JoystickEventName, JoystickEventType } from '../model';

export type TJoystickEventFunction = (event: JoystickEvent) => void;

export class JoystickControl {
  public joystick3D = true;

  public joystickStatus = {
    left: 0,
    leftPower: 0,
    right: 0,
    rightPower: 0,
    forward: 0,
    forwardPower: 0,
    backward: 0,
    backwardPower: 0
  };

  private reverseBackward = false;

  private rightMinAngle = 70;
  private rightMaxAngle = 290

  private forwardMinAngle = 0;
  private forwardMaxAngle = 180

  private leftMinAngle = 110;
  private leftMaxAngle = 250

  private backwardMinAngle = 247;
  private backwardMaxAngle = 293

  private _joystickEvent: TJoystickEventFunction = null;

  constructor(joystickEvent) {
    this._joystickEvent = joystickEvent;
  }

  public clearEvents() {
    this.disableJoystickRight();
    this.disableJoystickForward();
    this.disableJoystickLeft();
    this.disableJoystickBackward();
  }

  public handleNippleJSEvent(data) {
    const maxDistance = 35;
    const currentDistance = (data.distance / maxDistance);
    if (this.joystick3D) {
      if (data.angle.degree >= 0 && data.angle.degree <= 180) { // forward
        if (data.angle.degree >= this.leftMinAngle && data.angle.degree < 180) { // left
          this.enableJoystickLeft((
            data.angle.degree <= 180 ? (data.angle.degree - this.leftMinAngle) / (180 - this.leftMinAngle) : 1
          ) * currentDistance);
          this.disableJoystickRight();
        } else if (data.angle.degree >= 0 && data.angle.degree <= this.rightMinAngle) { // right
          this.enableJoystickRight((
            data.angle.degree > 0 ? 1 - (data.angle.degree / this.rightMinAngle) : 1) * currentDistance);
          this.disableJoystickLeft();
        } else {
          this.disableJoystickLeft();
          this.disableJoystickRight();
        }
      } else if (data.angle.degree > 180 && data.angle.degree <= 360) { // backward
        if (data.angle.degree > 180 && data.angle.degree <= this.leftMaxAngle) { // left
          const power = (
            data.angle.degree >= 180 ? 1 - ((data.angle.degree - 180) / (this.leftMaxAngle - 180)) : 1) * currentDistance;
          if (this.reverseBackward) {
            this.enableJoystickRight(power);
            this.disableJoystickLeft();
          } else {
            this.enableJoystickLeft(power);
            this.disableJoystickRight();
          }
        } else if (data.angle.degree >= this.rightMaxAngle && data.angle.degree <= 360) { // right
          const power = (
            data.angle.degree <= 360 ?
              ((data.angle.degree - this.rightMaxAngle) / (360 - this.rightMaxAngle)) : 1
          ) * currentDistance;
          if (this.reverseBackward) {
            this.enableJoystickLeft(power);
            this.disableJoystickRight();
          } else {
            this.enableJoystickRight(power);
            this.disableJoystickLeft();
          }
        } else {
          this.disableJoystickLeft();
          this.disableJoystickRight();
        }
      }
      if (data.direction && currentDistance > 0.5) {
        if (data.direction.y === 'up') {
          this.enableJoystickForward(currentDistance);
          this.disableJoystickBackward();
        } else if (data.direction.y === 'down') {
          this.enableJoystickBackward(currentDistance);
          this.disableJoystickForward();
        } else {
          this.disableJoystickForward();
          this.disableJoystickBackward();
        }
      } else {
        this.disableJoystickForward();
        this.disableJoystickBackward();
      }
    } else {

    }
  }

  enableJoystickForward(power = 1) {
    if (!this.joystickStatus.forward) {
      this.joystickStatus.forward = 1;
      this.joystickStatus.forwardPower = power;
      this.callJoystickStartEvent(JoystickEventName.forward, this.joystickStatus.forwardPower);
    } else if (this.joystickStatus.forwardPower !== power) {
      this.joystickStatus.forwardPower = power;
      this.callJoystickStartEvent(JoystickEventName.forward, this.joystickStatus.forwardPower);
    }
  }

  disableJoystickForward() {
    if (this.joystickStatus.forward) {
      this.joystickStatus.forward = 0;
      this.joystickStatus.forwardPower = 0;
      this.callJoystickEndEvent(JoystickEventName.forward);
    }
  }

  enableJoystickBackward(power = 1) {
    if (!this.joystickStatus.backward) {
      this.joystickStatus.backward = 1;
      this.joystickStatus.backwardPower = power;
      this.callJoystickStartEvent(JoystickEventName.backward, this.joystickStatus.backwardPower);
    } else if (this.joystickStatus.backwardPower !== power) {
      this.joystickStatus.backwardPower = power;
      this.callJoystickStartEvent(JoystickEventName.backward, this.joystickStatus.backwardPower);
    }
  }

  disableJoystickBackward() {
    if (this.joystickStatus.backward) {
      this.joystickStatus.backward = 0;
      this.joystickStatus.backwardPower = 0;
      this.callJoystickEndEvent(JoystickEventName.backward);
    }
  }

  enableJoystickLeft(power = 1) {
    if (!this.joystickStatus.left) {
      this.joystickStatus.left = 1;
      this.joystickStatus.leftPower = power;
      this.callJoystickStartEvent(JoystickEventName.left, this.joystickStatus.leftPower);
    } else if (this.joystickStatus.leftPower !== power) {
      this.joystickStatus.leftPower = power;
      this.callJoystickStartEvent(JoystickEventName.left, this.joystickStatus.leftPower);
    }
  }

  disableJoystickLeft() {
    if (this.joystickStatus.left) {
      this.joystickStatus.left = 0;
      this.joystickStatus.leftPower = 0;
      this.callJoystickEndEvent(JoystickEventName.left);
    }
  }

  enableJoystickRight(power = 1) {
    if (!this.joystickStatus.right) {
      this.joystickStatus.right = 1;
      this.joystickStatus.rightPower = power;
      this.callJoystickStartEvent(JoystickEventName.right, this.joystickStatus.rightPower);
    } else if (this.joystickStatus.rightPower !== power) {
      this.joystickStatus.rightPower = power;
      this.callJoystickStartEvent(JoystickEventName.right, this.joystickStatus.rightPower);
    }
  }

  disableJoystickRight() {
    if (this.joystickStatus.right) {
      this.joystickStatus.right = 0;
      this.joystickStatus.rightPower = 0;
      this.callJoystickEndEvent(JoystickEventName.right);
    }
  }

  callJoystickEndEvent(eventName: JoystickEventName) {
    this._joystickEvent({
      type: JoystickEventType.end,
      name: eventName,
      power: 0
    });
  }

  callJoystickStartEvent(eventName: JoystickEventName, power = 1) {
    this._joystickEvent({
      type: JoystickEventType.start,
      name: eventName,
      power
    });
  }
}
