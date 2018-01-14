"use strict";

const controller = require("./controller");
const model = require("./model");

module.exports = {
	controller, model,

	async moveTo(pos, e, speed) {
		await controller.move(model.moveTo(pos), e, speed);

		return this.state;
	},

	async moveBy(pos, e, speed) {
		await controller.move(model.moveBy(pos), e, speed);

		return this.state;
	},

	async reference() {
		await controller.reference();
		model.moveToReference();

		return this.state;
	},

	usePositionAsOrigin() {
		this.origin = this.absolutePosition;

		return this.state;
	},

	get position() {
		return model.position;
	},

	get absolutePosition() {
		return model.absolutePosition;
	},

	get origin() {
		return model.origin;
	},

	set origin(origin) {
		model.origin = origin;
	},

	get state() {
		return {
			position: this.position,
			absolutePosition: this.absolutePosition,
			origin: this.origin,
			unit: model.unit
		};
	}
};
