const Bullet = function (ctx, x_pos, y_pos, bullet_type, dir) {
	let x = x_pos;
	let y = y_pos;
	let direction = dir; // 1:left; 2:up; 3:right; 4:down
	const speed = 6;
	const bulletWidth = 32;
	const bulletHeight = 32;

	const sheet = new Image();
	const type = bullet_type;
	const types = {
		rocket: "assets/objects/bullets/bullet-2.png",
		energy: "assets/objects/bullets/bullet-1.png",
	};
	sheet.src = types[type];

	const sequences = {
		rocket: {
			x: 0,
			y: 0,
			bulletWidth,
			bulletHeight,
			count: 3,
			timing: 150,
			loop: true,
		},
		energy: {
			x: 0,
			y: 0,
			bulletWidth,
			bulletHeight,
			count: 10,
			timing: 200,
			loop: true,
		},
	};

	const sequence = sequences[type];
	let index = 0;
	let lastUpdate = 0;

	const isReady = function () {
		return sheet.complete && sheet.naturalHeight != 0;
	};

	const getBulletXY = function () {
		return { x, y };
	};

	const setBulletXY = function (xvalue, yvalue) {
		[x, y] = [xvalue, yvalue];
		return this;
	};

	const getBulletBoundingBox = function () {
		const top = y - bulletHeight / 2;
		const left = x - bulletWidth / 2;
		const bottom = y + bulletHeight / 2;
		const right = x + bulletWidth / 2;

		return BulletBoundingBox(ctx, top, left, bottom, right);
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

		switch (direction) {
			case 1:
				setBulletXY(x - speed, y);
				break;
			case 2:
				setBulletXY(x, y - speed);
				break;
			case 3:
				setBulletXY(x + speed, y);
				break;
			case 4:
				setBulletXY(x, y + speed);
				break;
		}
	};

	const drawBullet = function () {
		if (isReady()) {
			const degrees = {
				1: 270,
				2: 0,
				3: 90,
				4: 180,
			};
			/* Save the settings */
			ctx.save();
			//Update the content
			ctx.imageSmoothingEnabled = false;
			ctx.translate(x, y);
			ctx.rotate(degrees[direction] * (Math.PI / 180));
			ctx.translate(-x, -y);
			ctx.drawImage(
				sheet,
				sequence.x + index * sequence.bulletWidth,
				sequence.y,
				sequence.bulletWidth,
				sequence.bulletHeight,
				parseInt(x - bulletWidth / 2),
				parseInt(y - bulletHeight / 2),
				bulletWidth,
				bulletHeight
			);

			/* Restore saved settings */
			ctx.restore();
		}
		return this;
	};

	// The methods are returned as an object here.
	return {
		getBulletXY: getBulletXY,
		getBulletBoundingBox: getBulletBoundingBox,
		setBulletXY: setBulletXY,
		isReady: isReady,
		drawBullet: drawBullet,
		update: update,
	};
};

const BulletBoundingBox = function (ctx, top, left, bottom, right) {
	const path = new Path2D();
	path.rect(left, top, right - left, bottom - top);
	const isPointInBox = function (x, y) {
		return ctx.isPointInPath(path, x, y);
	};
	return {
		isPointInBox: isPointInBox,
	};
};
