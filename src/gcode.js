"use strict";

const Interpreter = require("gcode-interpreter");

const interpreter = new Interpreter({
	handlers: {
		G0: params => {
			console.log("G0", params);
		},
		G1: params => {
			console.log("G1", params);
		},
		G2: params => {
			console.log("G2", params);
		}
	}
});

module.exports = {
	createExecutionPlan(code) {
		const actions = [];
		const interpreter = new Interpreter({
			handlers: {
				G0: params => {
					console.log("G0", params);
				},
				G1: params => {
					console.log("G1", params);
				},
				G2: params => {
					console.log("G2", params);
				}
			}
		});

		interpreter.loadFromString(code);

		return actions;
	},

	async executePlan(plan) {
		for(const step of plan) {
			await step();
		}
	},

	executeCode(code) {
		return this.executePlan(this.createExecutionPlan(code));
	}
};
