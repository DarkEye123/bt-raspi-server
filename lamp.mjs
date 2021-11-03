import SerialPort from "serialport";
import constants from "./constants.mjs";

class Component {
  constructor({ name, state, onStateCMD, offStateCMD }) {
    this.name = name;
    this.state = state;
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
  new Sensor({
    name: "sound",
    state: false,
    onStateCMD: constants.BT_ENABLE_SOUND,
    offStateCMD: constants.BT_DISABLE_SOUND,
  }),
  new Sensor({
    name: "motion",
    state: false,
    onStateCMD: constants.BT_ENABLE_PIR,
    offStateCMD: constants.BT_DISABLE_PIR,
  }),
];

class SensorBlocker extends Component {}

class Lamp {
  constructor(serialPort, id, state = false, sensors = DEFAULT_SENSORS) {
    this.id = id;
    this.state = state;
    this.currentOperation = null;
    this.sensor = {};
    for (const sensor of sensors) {
      this.sensor[sensor.name] = { ...sensor };
    }
    this.component = { ...this.sensor };
    this.component["sensor_blocker"] = new SensorBlocker({
      name: "sensor_blocker",
      state: false,
      onStateCMD: constants.BT_DISABLE_SENSORS,
      offStateCMD: constants.BT_ENABLE_SENSORS,
    });
    this.serialPort = new SerialPort(
      serialPort,
      {
        baudRate: 9600,
      },
      (e) => {
        if (e) {
          console.error(`BT init problem for ${serialPort}`, e);
          this.errorState = true;
        }
      }
    );
    this.parser = this.serialPort.pipe(new SerialPort.parsers.Readline());

    this._parseData = this._parseData.bind(this);
    this.synchronizeWithHW(null);
    this.parser.on("data", this._parseData);
  }

  _parseData(data) {
    console.debug("received data", data);
    if (this.errorState) {
      console.info("ommiting received data, error state is active");
      return;
    }
    if (this.currentOperation?.flag === constants.BT_SEND_CURRENT_APP_STATE) {
      console.assert(
        typeof this.currentOperation.cb !== "undefined",
        "callback needs to be defined"
      );
      const parsedData = data.split(";");
      parsedData.pop(); // remove empty string at the end
      let componentStates = {};
      for (const pair of parsedData) {
        let [name, value] = pair.split(":");
        // ensure compatibility with older arduino code
        if (name === "ignoreSensors") {
          name = "sensor_blocker";
        }
        const state = !!Number(value);
        if (this.component[name]) {
          this.component[name].state = state;
          componentStates[name] = state;
        } else {
          this[name] = state;
        }
      }
      if (this.currentOperation.cb) {
        this.currentOperation.cb(
          {
            state: this.state,
            ...componentStates,
          },
          null
        );
      }
    }
    this.currentOperation = null;
  }

  synchronizeWithHW(cb) {
    this.serialPort.write(constants.BT_SEND_CURRENT_APP_STATE, (err) => {
      if (err) {
        console.error("Couldn't update lamp state", err);
        return;
      }
      this.currentOperation = { flag: constants.BT_SEND_CURRENT_APP_STATE, cb };
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

  _turn(operation = "on", componentName, cb) {
    const stateKey = operation === "on" ? "onStateCMD" : "offStateCMD";
    if (this.component[componentName]) {
      this._writeBT(this.component[componentName][stateKey], (err) => {
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
        cb("not registered");
      }
      console.error(`Component ${componentName} is not registered!`);
    }
  }

  toggleLight(cb) {
    this._writeBT(constants.BT_TOGGLE_LIGHT, (err) => {
      if (cb) {
        cb(err);
      }
      if (err) {
        return console.error(`Error -> Toggle Light`, err.message);
      }
      console.info(`Toggle Light: success`);
    });
  }

  turnOff(cb, componentName) {
    return this._turn("off", componentName, cb);
  }

  turnOn(cb, componentName) {
    return this._turn("on", componentName, cb);
  }
}

export default Lamp;
