import SerialPort from "serialport";
import constants from "./constants.mjs";
import express from 'express'
const app = express()
const port = 3000

const sPort = new SerialPort("/dev/rfcomm0", {
	baudRate: 9600,
});

app.get('/', (req, res) => {
	sPort.write(constants.BT_TOGGLE_LIGHT, function (err) {
		if (err) {
			res.send(err.message)
			res.sendStatus(500)
			return console.log("Error -> Toggle Light:", err.message);
		}
		console.log("Toggle Light: success");
		res.sendStatus(200);
	});
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})