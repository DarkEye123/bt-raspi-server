import express from 'express';

import Lamp from './lamp.mjs';
import testLamp from './mocks/lamp.mjs';
import endpoints from './endpoints.mjs';

const app = express();
const port = 3000;

const lamps = {
  bedroom: new Lamp('/dev/rfcomm1'),
  realProto: new Lamp('/dev/rfcomm0'),
  mockProto: testLamp,
};

app.get(endpoints.toggleLight, (req, res) => {
  const lamp = lamps[req.params.position];
  if (lamp && !lamp.errorState) {
    lamp.toggleLight(err => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(422);
  }
});

app.listen(port, ['127.0.0.1', '192.168.0.239', '192.168.0.233'], () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log(`Example app listening at http://192.168.0.239:${port}`); // ntb
  console.log(`Example app listening at http://192.168.0.233:${port}`); // PI
});
