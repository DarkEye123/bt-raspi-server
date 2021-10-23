import SerialPort from "serialport";
import constants from "./constants.mjs";
import express from 'express'
const app = express()
const port = 3000

const sPort = new SerialPort("/dev/rfcomm0", {
	baudRate: 9600,
});

app.get('/', (req, res) => {
	res.send('Hello World!')
	sPort.write(constants.BT_TOGGLE_LIGHT, function (err) {
		if (err) {
			return console.log("Error", err.message);
		}
		console.log("success");
	});
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})