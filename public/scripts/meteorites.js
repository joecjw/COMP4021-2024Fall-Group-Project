const Meteorite = function (ctx, x_pos, y_pos, gameArea, meteorite_type, dir) {
	let x = x_pos;
	let y = y_pos;
	let direction = dir; // 0:up; 1:right; 2:down; 3:left
	let degree = 0;
	const speed = 2;
	const meteoriteWidth = 40;
	const meteoriteHeight = 40;

	const sheet = new Image();
	let type = meteorite_type;
	const types = {
		speed: "assets/objects/meteorites/meteorite-speed.png",
		energy: "assets/objects/meteorites/meteorite-energy.png",
	};
	sheet.src = types[type];

	const isReady = function () {
		return sheet.complete && sheet.naturalHeight != 0;
	};

	const getMeteoriteXY = function () {
		return { x, y };
	};

	const setMeteoriteXY = function (xvalue, yvalue) {
		[x, y] = [xvalue, yvalue];
		return this;
	};

	const getMeteoriteType = function () {
		return type;
	};

	const setMeteoriteType = function (newType) {
		type = newType;
	};

	const setMeteoriteDirection = function (newDir) {
		direction = newDir;
	};

	const getMeteoriteBoundingBox = function () {
		const top = y - meteoriteHeight / 2;
		const left = x - meteoriteWidth / 2;
		const bottom = y + meteoriteHeight / 2;
		const right = x + meteoriteWidth / 2;

		return MeteoriteBoundingBox(ctx, top, left, bottom, right);
	};

	const update = function () {
		// Update rotation degree
		degree = (degree + 2.5) % 360;

		// Update current position
		switch (direction) {
			case 0:
				y -= speed;
				break;
			case 1:
				x -= speed;
				break;
			case 2:
				y += speed;
				break;
			case 3:
				x += speed;
				break;
		}
	};

	const isInsideBoundary = function () {
		if (!gameArea.isPointInBox(x, y)) {
			return false;
		} else {
			return true;
		}
	};

	const drawMeteorite = function () {
		if (isReady()) {
			/* Save the settings */
			ctx.save();

			//Update the content
			ctx.imageSmoothingEnabled = false;
			ctx.translate(x, y);
			ctx.rotate(degree * (Math.PI / 180));
			ctx.translate(-x, -y);
			ctx.drawImage(
				sheet,
				0,
				0,
				meteoriteWidth,
				meteoriteHeight,
				parseInt(x - meteoriteWidth / 2),
				parseInt(y - meteoriteHeight / 2),
				meteoriteWidth,
				meteoriteHeight
			);

			/* Restore saved settings */
			ctx.restore();
		}
		return this;
	};

	// The methods are returned as an object here.
	return {
		getMeteoriteXY: getMeteoriteXY,
		getMeteoriteBoundingBox: getMeteoriteBoundingBox,
		setMeteoriteXY: setMeteoriteXY,
		getMeteoriteType: getMeteoriteType,
		setMeteoriteType: setMeteoriteType,
		setMeteoriteDirection: setMeteoriteDirection,
		isReady: isReady,
		drawMeteorite: drawMeteorite,
		update: update,
		isInsideBoundary: isInsideBoundary,
	};
};

const MeteoriteBoundingBox = function (ctx, top, left, bottom, right) {
	const path = new Path2D();
	path.rect(left, top, right - left, bottom - top);
	const isPointInBox = function (x, y) {
		return ctx.isPointInPath(path, x, y);
	};
	return {
		isPointInBox: isPointInBox,
	};
};
