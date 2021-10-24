/**
 * Purely proto approach because I didn't want to setup my arduino with BT during night
 */

// test error state
const USE_NEGATIVE_RESPONSES = false;

const error = { message: 'mocked negative response' };

const mockLamp = {
  toggleLight: cb => {
    console.log('toggle light mock');
    cb(USE_NEGATIVE_RESPONSES ? error : undefined);
  },
};

export default mockLamp;
