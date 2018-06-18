"use strict";

const printer = require("./printer");

const Interpreter = require("gcode-interpreter");

module.exports = {
	createExecutionPlan(code) {
		const actions = [];

		const state = {
			speed: null,
			absolute: null
		};

		const updateState = changes => Object.assign(state, changes);
		const assertValidState = ({ speed, absolute }) => {
			if(speed === null || absolute === null)
				throw new Error("Invalid GCODE.");
		};

		const interpreter = new Interpreter({
			handlers: {
				G0: params => {
					console.log("G0", params);
				},
				G1: params => {
					console.log("G1", params, state);

					if("F" in params)
						updateState({ speed: params.F });

					assertValidState(state);

					const pos = {};

					if("X" in params) pos.x = params.X;
					if("Y" in params) pos.y = params.Y;
					if("Z" in params) pos.z = params.Z;

					const currentState = Object.assign({}, state);

					actions.push(() => printer[currentState.absolute ? "moveTo" : "moveBy"](
						pos,
						params.E || 0,
						currentState.speed
					));
				},
				G2: params => {
					console.log("G2", params);
				},
				G28: params => {
					console.log("G28", params);
					actions.push(() => printer.reference());
				},
				G90: () => {
					console.log("G90");
					updateState({ absolute: true });
				},
				G91: () => {
					console.log("G91");
					updateState({ absolute: false });
				}
			}
		});

		interpreter.loadFromStringSync(code);

		return actions;
	},

	async executePlan(plan) {
		console.log(plan);

		for(const step of plan) {
			await step();
		}
	},

	executeCode(code) {
		return this.executePlan(this.createExecutionPlan(code));
	}
};
