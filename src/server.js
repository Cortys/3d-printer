"use strict";

const path = require("path");
const express = require("express");

const printer = require("./printer");

const app = express();

app.use(express.static(path.join(__dirname, "..", "client")));

function requestHandler(f) {
	return async (req, res) => {
		try {
			res.json(await f(req, res));
		}
		catch(e) {
			console.log(e);

			res.status(400).json({ message: e.message });
		}
	};
}

app.post("/move-by", requestHandler(({ query }) => printer.moveBy(query, query.e, query.speed)));

app.post("/move-to", requestHandler(({ query }) => printer.moveTo(query, query.e, query.speed)));

app.post("/reference", requestHandler(() => printer.reference()));

app.post("/position-as-origin", requestHandler(() => printer.usePositionAsOrigin()));

app.post("/origin", requestHandler(({ query }) => {
	printer.orign = query;

	return printer.orign;
}));

app.get("/origin", requestHandler(() => printer.orign));

app.get("/position", requestHandler(() => printer.position));

app.get("/absolute-position", requestHandler(() => printer.absolutePosition));

module.exports = {
	start() {
		app.listen(80);
		console.log("Started listening on port 80.");
	}
};
