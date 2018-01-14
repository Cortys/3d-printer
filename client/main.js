"use strict";

const axes = ["x", "y", "z", "e"];
const dirs = {
	N: -1,
	P: 1
};

function updateState({ position, absolutePosition }) {
	document.getElementById("x").value = position.x;
	document.getElementById("y").value = position.y;
	document.getElementById("z").value = position.z;

	document.getElementById("absX").value = absolutePosition.x;
	document.getElementById("absY").value = absolutePosition.y;
	document.getElementById("absZ").value = absolutePosition.z;
}

axes.forEach(a => {
	Object.entries(dirs).forEach(([d, dir]) => {
		document.getElementById(`${a}-${d}`).addEventListener("click", async () => {
			let x = 0,
				y = 0,
				z = 0,
				e = 0;

			const speed = document.getElementById("speed").value;
			const dist = document.getElementById("distance").value;

			switch (a) {
			case "x":
				x = dir * dist;
				break;
			case "y":
				y = dir * dist;
				break;
			case "z":
				z = dir * dist;
				break;
			case "e":
				e = dir * dist;
				break;
			default:
				throw new Error("Invalid axis.");
			}

			updateState(await (await fetch(`/move-by?x=${x}&y=${y}&z=${z}&e=${e}&speed=${speed}`, {
				method: "POST"
			})).json());
		});
	});
});

document.getElementById("ref").addEventListener("click", async () => {
	updateState(await (await fetch("/reference", {
		method: "POST"
	})).json());
});

document.getElementById("origin").addEventListener("click", async () => {
	updateState(await (await fetch("/position-as-origin", {
		method: "POST"
	})).json());
});

document.getElementById("abs").addEventListener("click", async () => {
	const x = document.getElementById("x").value;
	const y = document.getElementById("y").value;
	const z = document.getElementById("z").value;
	const speed = document.getElementById("speed").value;

	updateState(await (await fetch(`/move-to?x=${x}&y=${y}&z=${z}&e=0&speed=${speed}`, {
		method: "POST"
	})).json());
});
