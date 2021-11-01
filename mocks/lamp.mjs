/**
 * Purely proto approach because I didn't want to setup my arduino with BT during night
 */

// test error state
const USE_NEGATIVE_RESPONSES = false;

const error = { message: "mocked negative response" };

const mockLamp = {
  toggleLight: (cb) => {
    console.log("toggle light mock");
    cb(USE_NEGATIVE_RESPONSES ? error : undefined);
  },
  turnOn: (cb, name) => {
    console.log(`enable mock for component: ${name}`);
    cb(USE_NEGATIVE_RESPONSES ? error : undefined);
  },
  turnOff: (cb, name) => {
    console.log(`disable mock for component: ${name}`);
    cb(USE_NEGATIVE_RESPONSES ? error : undefined);
  },
  synchronizeWithHW: (cb) => {
    console.log("syncing");
    cb(
      { motion: true, sound: false, sensor_blocker: false, state: false },
      USE_NEGATIVE_RESPONSES ? error : undefined
    );
  },
};

export default mockLamp;
