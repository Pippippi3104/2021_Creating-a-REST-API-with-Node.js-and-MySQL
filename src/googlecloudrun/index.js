const express = require("express");
const { Translate } = require("@google-cloud/translate").v2;
const knex = require("./database");

// app
const app = express();
const translateClient = new Translate();

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

app.get("/translate/:lang", async (req, res) => {
	const result = await translateClient.translate("こんにちは", req.params.lang);
	res.send(`${result[0]}\n\n`);
});

// 単語一覧 API
app.get("/words", async (req, res) => {
	try {
		const words = await knex.select("*").from("words").orderBy("id");
		res.json({ status: "ok", data: [...words] });
	} catch (err) {
		throw new Error(err);
	}
});
