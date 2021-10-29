import express from "express";

import fs from "fs";
const dir = "./build";
const app = express();
const port = process.env.PORT || 3000;

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

import Lamp from "./lamp.mjs";
import testLamp from "./mocks/lamp.mjs";
import endpoints from "./endpoints.mjs";

const lamps = {
  bedroom: new Lamp("/dev/rfcomm1", "bedroom"),
  proto: new Lamp("/dev/rfcomm0", "proto"),
  mock: testLamp,
};

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

app.listen(port, ["127.0.0.1", "192.168.0.239", "192.168.0.233"], () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log(`Example app listening at http://192.168.0.239:${port}`); // ntb
  console.log(`Example app listening at http://192.168.0.233:${port}`); // PI
});
