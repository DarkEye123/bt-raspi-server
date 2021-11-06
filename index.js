import express from "express";
import cors from "cors";

import fs from "fs";
const dir = "./build";
const app = express();
const port = process.env.PORT || 3000;
app.use(
  cors({ origin: ["http://localhost:4000", "http://192.168.0.233:3000"] })
);

import Lamp from "./lamp.mjs";
import testLamp from "./mocks/lamp.mjs";
import endpoints from "./endpoints.mjs";

function initLamps() {
  return {
    bedroom: new Lamp("/dev/rfcomm1", "bedroom"),
    proto: new Lamp("/dev/rfcomm0", "proto"),
    mock: testLamp,
  };
}

let lamps = initLamps();

function _executeCMD(res, lamp, cmd, ...parameters) {
  if (lamp && !lamp.errorState) {
    lamp[cmd]((err) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.sendStatus(200);
    }, ...parameters);
  } else {
    res.sendStatus(422);
  }
}

app.get(endpoints.toggleLight, (req, res) => {
  const lamp = lamps[req.params.position];
  _executeCMD(res, lamp, "toggleLight");
});

app.get(endpoints.enableMotionSensor, (req, res) => {
  const lamp = lamps[req.params.position];
  _executeCMD(res, lamp, "turnOn", "motion");
});

app.get(endpoints.disableMotionSensor, (req, res) => {
  const lamp = lamps[req.params.position];
  _executeCMD(res, lamp, "turnOff", "motion");
});

app.get(endpoints.enableSoundSensor, (req, res) => {
  const lamp = lamps[req.params.position];
  _executeCMD(res, lamp, "turnOn", "sound");
});

app.get(endpoints.disableSoundSensor, (req, res) => {
  const lamp = lamps[req.params.position];
  _executeCMD(res, lamp, "turnOff", "sound");
});

app.get(endpoints.enableSensorBlocker, (req, res) => {
  const lamp = lamps[req.params.position];
  _executeCMD(res, lamp, "turnOn", "sensor_blocker");
});

app.get(endpoints.disableSensorBlocker, (req, res) => {
  const lamp = lamps[req.params.position];
  _executeCMD(res, lamp, "turnOff", "sensor_blocker");
});

app.get(endpoints.synchronize, (req, res) => {
  const lamp = lamps[req.params.position];
  if (lamp && !lamp.errorState) {
    lamp.synchronizeWithHW((data, err) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.status(200).send(data);
    });
  } else {
    res.sendStatus(422);
  }
});

app.get(endpoints.reconnectAll, (req, res) => {
  Object.values(lamps).forEach(
    (lamp) => lamp.closeConnection()
  );
  lamps = initLamps();
  res.sendStatus(200);
});

if (fs.existsSync(dir)) {
  console.info("Frontend 'build' directory exists!");
  const FEApp = await import("./build/middlewares.js");
  app.use(
    FEApp.assetsMiddleware,
    FEApp.prerenderedMiddleware,
    FEApp.kitMiddleware
  );
} else {
  console.warn("Frontend 'build' directory not found!");
}
app.listen(
  port,
  ["localhost", "127.0.0.1", "192.168.0.239", "192.168.0.233"],
  () => {
    console.log(`Example app listening at http://localhost:${port}`);
    console.log(`Example app listening at http://192.168.0.239:${port}`); // ntb
    console.log(`Example app listening at http://192.168.0.233:${port}`); // PI
  }
);
