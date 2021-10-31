const prefix = '/api';
const endpoints = {
  toggleLight: `${prefix}/lamp/:position/toggle-light`,
  enableMotionSensor: `${prefix}/lamp/:position/enable-motion-sensor`,
  disableMotionSensor: `${prefix}/lamp/:position/disable-motion-sensor`,
  enableSoundSensor: `${prefix}/lamp/:position/enable-sound-sensor`,
  disableSoundSensor: `${prefix}/lamp/:position/disable-sound-sensor`,
  synchronize: `${prefix}/lamp/:position/synchronize`,
};

export default endpoints;
