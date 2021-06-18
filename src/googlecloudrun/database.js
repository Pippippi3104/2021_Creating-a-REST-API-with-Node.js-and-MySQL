const Knex = require("knex");

// connection
const connect = () => {
	try {
		const config = {
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			host: process.env.DB_HOST,
			socketPath: process.env.DB_SOCKET,
		};

		return Knex({
			client: "mysql",
			version: "5.7",
			connection: config,
		});
	} catch (err) {
		throw new Error(err);
	}
};

//
const knex = connect();
module.exports = knex;
