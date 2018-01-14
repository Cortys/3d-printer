"use strict";

const config = require("./config");
const Point = require("./Point");

// factors to get μm from other units:
const unitFactors = {
	μm: 1,
	mm: 1000,
	in: 25400
};
const limits = new Point(config.limits).scale(unitFactors.mm);
const referencePosition = new Point(config.referencePosition).scale(unitFactors.mm);

const state = {
	// current position in μm to prevent floating points:
	pos: new Point(NaN, NaN, NaN),
	// currently used unit for inputs:
	unit: "mm",
	unitFactor: unitFactors.mm,
	origin: new Point(0, 0, 0)
};

function pos2refPos(pos) {
	return pos.scale(state.unitFactor);
}

function refPos2absPos(pos) {
	return pos.scale(1 / state.unitFactor);
}

function refPos2pos(pos) {
	return refPos2absPos(pos).diff(state.origin);
}

function refPos2mmPos(pos) {
	return pos.scale(1 / unitFactors.mm);
}

function absPos2refPos(pos) {
	return pos2refPos(pos.add(state.origin));
}

function relPos2refPos(pos) {
	return pos2refPos(pos).add(state.pos);
}

function isValidRefPos({ x, y, z }) {
	return x >= 0 && y >= 0 && z >= 0
		&& x <= limits.x && y <= limits.y && z <= limits.z;
}

const [checkedAbsPos2refPos, checkedRelPos2refPos] = [absPos2refPos, relPos2refPos].map(f => pos => {
	const refPos = f(pos);

	if(!isValidRefPos(refPos))
		throw new RangeError(`Position ${refPos} is outside of the printable volume.`);

	return refPos;
});

module.exports = {
	moveTo(pos) {
		pos = new Point(pos);

		const oldPos = state.pos;

		state.pos = checkedAbsPos2refPos(pos);

		return refPos2mmPos(state.pos.diff(oldPos));
	},

	moveBy(pos) {
		pos = new Point(pos);

		const oldPos = state.pos;

		state.pos = checkedRelPos2refPos(pos);

		console.log(oldPos, state.pos, pos);

		return refPos2mmPos(state.pos.diff(oldPos));
	},

	moveToReference() {
		state.pos = referencePosition;
	},

	setUnit(unit) {
		const unitFactor = unitFactors[unit];

		if(!unitFactor)
			throw new TypeError(`Unknown unit '${unit}'.`);

		Object.assign(state, { unit, unitFactor });
	},

	get unit() {
		return state.unit;
	},

	get position() {
		return refPos2pos(state.pos);
	},

	get absolutePosition() {
		return refPos2absPos(state.pos);
	},

	get origin() {
		return state.origin;
	},

	set origin(origin) {
		origin = new Point(origin);

		if(!origin.isNumerical())
			throw new TypeError("Only known positions can be used as the origin.");

		state.origin = origin;
	}
};
