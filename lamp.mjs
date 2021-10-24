import SerialPort from 'serialport';
import constants from './constants.mjs';

class Component {
  constructor(name, onStateCMD, offStateCMD) {
    this.name = name;
    this.state = false;
    this.onStateCMD = onStateCMD;
    this.offStateCMD = offStateCMD;
  }
}

class Sensor extends Component {
  constructor(...args) {
    super(...args);
    this.measurement = 0;
    this.currentLimit = 0;
  }
}

const DEFAULT_SENSORS = [
  new Sensor('sound', constants.BT_ENABLE_SOUND, constants.BT_DISABLE_SOUND),
  new Sensor(
    'infra_movement',
    constants.BT_ENABLE_PIR,
    constants.BT_DISABLE_PIR
  ),
];
class Lamp {
  constructor(serialPort, id, state = false, sensors = DEFAULT_SENSORS) {
    this.id = id;
    this.state = state;
    this.sensor = {};
    for (const sensor of sensors) {
      this.sensor[sensor.name] = { ...sensor };
    }
    this.component = { ...this.sensor };
    this.serialPort = new SerialPort(
      serialPort,
      {
        baudRate: 9600,
      },
      e => {
        if (e) {
          console.error(`BT init problem for ${serialPort}`, e);
          this.errorState = true;
        }
      }
    );

    this.serialPort.write(constants.BT_SEND_CURRENT_APP_STATE, err => {
      if (err) {
        console.error("Couldn't update lamp state", err);
      }
    });
  }

  _writeBT(cmd, cb) {
    this.serialPort.write(cmd, function (err) {
      if (cb) {
        cb(err);
      }
      if (err) {
        return console.error(`BT-write failed: ${cmd}`);
      }
      console.info(`BT-write success: ${cmd}`);
    });
  }

  _turn(operation = 'on', componentName, cb) {
    const stateKey = operation === 'on' ? 'onStateCMD' : 'offStateCMD';
    if (this.component[componentName]) {
      this._writeBT(this.component[componentName][stateKey], err => {
        if (cb) {
          cb(err);
        }
        if (err) {
          return console.error(
            `Error -> Turn ${operation} ${componentName}:`,
            err.message
          );
        }
        console.info(`Turn ${operation} ${componentName}: success`);
      });
    } else {
      if (cb) {
        cb('not registered');
      }
      console.error(`Component ${componentName} is not registered!`);
    }
  }

  toggleLight(cb) {
    this._writeBT(constants.BT_TOGGLE_LIGHT, err => {
      if (cb) {
        cb(err);
      }
      if (err) {
        return console.error(`Error -> Toggle Light`, err.message);
      }
      console.info(`Toggle Light: success`);
    });
  }

  turnOff(componentName, cb) {
    return this._turn('off', componentName, cb);
  }

  turnOn(componentName, cb) {
    return this._turn('on', componentName, cb);
  }
}

export default Lamp;
