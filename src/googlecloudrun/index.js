const express = require("express");

// app
const app = express();

// middlewares
app.use(express.static(__dirname + "/public"));

// connection
const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Listening on port ${port}.`);
});

// API
app.get("/hello", async (req, res) => {
	const word = req.query.w;
	res.send(`Hello, you entered ${word}!`);
});
