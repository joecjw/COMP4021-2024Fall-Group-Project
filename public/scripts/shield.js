const Shield = function (
	ctx,
	x,
	y,
	shieldMaxAge,
	shieldBirthTime,
	shieldType,
	src
) {
	const shieldHeight = 32;
	const shieldWidth = 32;
	let maxAge = shieldMaxAge;
	let sheet = new Image();
	sheet.src = src;
	let sequence = {
		x: 0,
		y: 0,
		shieldWidth,
		shieldHeight,
		count: 15,
		timing: 100,
		loop: true,
	};
	let type = shieldType;
	let birthTime = shieldBirthTime;
	let index = 0;
	let lastUpdate = 0;

	const isReady = function () {
		return sheet.complete && sheet.naturalHeight != 0;
	};

	const isExpired = function () {
		return performance.now() - birthTime > maxAge ? true : false;
	};

	const getShieldXY = function () {
		return { x, y };
	};

	const setShieldXY = function (xvalue, yvalue) {
		[x, y] = [xvalue, yvalue];
		return this;
	};

	const getType = function () {
		return type;
	};

	const setType = function (newType) {
		type = newType;
	};

	const setSheet = function (src) {
		sheet.src = src;
	};

	const setBirthTime = function (time) {
		birthTime = time;
	};

	const setMaxAge = function (age) {
		maxAge = age;
	};

	const getShieldBoundingBox = function () {
		const top = y - shieldHeight / 2;
		const left = x - shieldWidth / 2;
		const bottom = y + shieldHeight / 2;
		const right = x + shieldWidth / 2;

		return ShieldBoundingBox(ctx, top, left, bottom, right);
	};

	const drawShield = function () {
		if (isReady()) {
			/* Save the settings */
			ctx.save();

			//Clear the canvas
			ctx.clearRect(
				parseInt(x - shieldWidth / 2),
				parseInt(y - shieldHeight / 2),
				shieldWidth,
				shieldHeight
			);

			//Update the content
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(
				sheet,
				sequence.x + index * sequence.shieldWidth,
				sequence.y,
				sequence.shieldWidth,
				sequence.shieldHeight,
				parseInt(x - shieldWidth / 2),
				parseInt(y - shieldHeight / 2),
				shieldWidth,
				shieldHeight
			);
			update(performance.now());

			/* Restore saved settings */
			ctx.restore();
		}

		return this;
	};

	const update = function (time) {
		if (lastUpdate == 0) lastUpdate = time;

		if (time - lastUpdate >= sequence.timing) {
			index++;
			if (index >= sequence.count && sequence.loop == true) {
				index = 0;
			}
			lastUpdate = time;
		}

		return this;
	};

	// The methods are returned as an object here.
	return {
		getShieldXY: getShieldXY,
		setShieldXY: setShieldXY,
		getShieldBoundingBox: getShieldBoundingBox,
		setSheet: setSheet,
		getType: getType,
		setType: setType,
		setMaxAge: setMaxAge,
		setBirthTime: setBirthTime,
		isExpired: isExpired,
		isReady: isReady,
		drawShield: drawShield,
		update: update,
	};
};

const ShieldBoundingBox = function (ctx, top, left, bottom, right) {
	const path = new Path2D();
	path.rect(left, top, right - left, bottom - top);
	const isPointInBox = function (x, y) {
		return ctx.isPointInPath(path, x, y);
	};

	return {
		isPointInBox: isPointInBox,
	};
};
