"use strict";

const path = require("path");
const cp = require("child_process");
const readline = require("readline");

const process = cp.spawn("python", ["-u", "3d.py"], {
	cwd: path.join(__dirname, "..", "..", "bin")
});

const handlers = new Map();

readline.createInterface({
	input: process.stdout
}).on("line", line => {
	console.log(line);

	const [status, id] = line.split(" ");

	if(status === "success" || status === "fail") {
		const handler = handlers.get(+id);

		if(handler) {
			handler(status === "success");
			handlers.delete(+id);
		}
	}
});

function* idGenerator() {
	for(let i = 0; ; i++)
		yield i;
}

const idSeq = idGenerator();

module.exports = {
	commandString(command, ...args) {
		const id = idSeq.next().value;

		return {
			id,
			string: `${JSON.stringify([id, command, args])}\n`
		};
	},

	exec(...args) {
		return new Promise((resolve, reject) => {
			const { id, string } = this.commandString(...args);

			handlers.set(id, success => {
				if(success)
					resolve();
				else
					reject();
			});

			process.stdin.write(string, "utf-8");
		});
	},

	move({ x, y, z }, e, speed) {
		console.log("move", x, y, z, e, speed);

		return this.exec("move", [+x, +y, +z, +e], +speed);
	},

	reference() {
		console.log("ref");

		return this.exec("reference", 0);
	}
};
