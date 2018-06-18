"use strict";

class Point {
	constructor(x, y, z) {
		if(x instanceof Point)
			return x;

		if(typeof x === "object")
			Object.assign(this, {
				x: +x.x,
				y: +x.y,
				z: +x.z
			});
		else {
			this.x = +x;
			this.y = +y;
			this.z = +z;
		}
	}

	scale(s) {
		return new Point(
			s * this.x,
			s * this.y,
			s * this.z
		);
	}

	add(p) {
		return new Point(
			this.x + p.x,
			this.y + p.y,
			this.z + p.z
		);
	}

	diff(p) {
		return new Point(
			this.x - p.x,
			this.y - p.y,
			this.z - p.z
		);
	}

	replaceNaNs(point) {
		return new Point(
			(isNaN(this.x) ? point : this).x,
			(isNaN(this.y) ? point : this).y,
			(isNaN(this.z) ? point : this).z,
		);
	}

	toString() {
		return `(${this.x}, ${this.y}, ${this.z})`;
	}

	isNumerical() {
		return Number.isFinite(this.x)
			&& Number.isFinite(this.y)
			&& Number.isFinite(this.z);
	}
}

module.exports = Point;
