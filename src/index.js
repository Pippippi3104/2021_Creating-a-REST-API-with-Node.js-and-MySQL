const express = require("express");
const mysql = require("mysql");

// app
const app = express();

// DB
const pool = mysql.createPool({
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTOIN_NAME}`,
});

// connect
app.use(express.json());
const port = process.env.PORT || 8080;

app.listen(port, () => {
	console.log(`BarkBark Rest API listening on port ${port}`);
});

// API
app.get("/", async (req, res) => {
	res.json({ status: "Bark bark! Ready to roll!" });
});

app.get("v/:breed", async (req, res) => {
	const query = "SELECT * FROM breeds WHERE name = ?";
	pool.query(query, [req.params.breed], (error, results) => {
		if (!results[0]) {
			res.json({ status: `Not found! ${error}` });
		} else {
			res.json(result[0]);
		}
	});
});
