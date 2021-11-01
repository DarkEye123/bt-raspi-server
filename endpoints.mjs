const prefix = "/api";
const endpoints = {
  toggleLight: `${prefix}/lamp/:position/toggle-light`,
  enableMotionSensor: `${prefix}/lamp/:position/enable-motion-sensor`,
  disableMotionSensor: `${prefix}/lamp/:position/disable-motion-sensor`,
  enableSoundSensor: `${prefix}/lamp/:position/enable-sound-sensor`,
  disableSoundSensor: `${prefix}/lamp/:position/disable-sound-sensor`,
  enableSensorBlocker: `${prefix}/lamp/:position/enable-all-sensors`,
  disableSensorBlocker: `${prefix}/lamp/:position/disable-all-sensors`,
  synchronize: `${prefix}/lamp/:position/synchronize`,
};

export default endpoints;
