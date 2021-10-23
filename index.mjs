import express from 'express';
import Lamp from './lamp.mjs';
const app = express();
const port = 3000;

const lamps = {
  bedroom: new Lamp('/dev/rfcomm1'),
  proto: new Lamp('/dev/rfcomm0'),
};

app.get('/lamp/:position/toggleLight', (req, res) => {
  lamps[req.params.position].toggleLight(err => {
    if (err) {
      res.send(err.message);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
