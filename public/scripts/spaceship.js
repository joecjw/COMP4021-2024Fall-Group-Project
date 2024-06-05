const Spaceship = function (ctx, x_pos, y_pos, gameArea, type) {
	let x = x_pos;
	let y = y_pos;
	const spaceshipHeight = 48;
	const spaceshipWidth = 48;

	let speed = 0;
	let direction = 0; // 1:left; 2:up; 3:right; 4:down
	let energy = 100;
	let cheat = 0; // 0: OFF, 1: ON
	let speedUpped = 0;
	let speedDowned = 0;
	let energyMeteoriteHitted = 0;

	const sheet = new Image();
	const types = {
		1: "assets/objects/spaceships/spaceship-1.png",
		2: "assets/objects/spaceships/spaceship-2.png",
	};
	sheet.src = types[type];

	const isReady = function () {
		return sheet.complete && sheet.naturalHeight != 0;
	};

	const getType = function () {
		return type;
	};

	const getSpaceshipXY = function () {
		return { x, y };
	};

	const setSpaceshipXY = function (xvalue, yvalue) {
		[x, y] = [xvalue, yvalue];
		return this;
	};

	const getDirection = function () {
		return direction;
	};

	const setDirection = function (dir) {
		direction = dir;
	};

	const getSpeed = function () {
		return speed;
	};

	const speedUp = function () {
		speedUpped = 1;
	};

	const speedUpFinish = function () {
		speedUpped = 0;
	};

	const speedDown = function () {
		speedDowned = 1;
	};

	const speedDownFinish = function () {
		speedDowned = 0;
	};

	const getEnergy = function () {
		return energy;
	};

	const increaseEnergy = function (num) {
		energy += num;
	};

	const decreaseEnergy = function (num) {
		energy -= num;
	};

	const getEnergyMeteoriteHitted = function () {
		return energyMeteoriteHitted;
	};

	const energyMeteoriteHit = function (num) {
		decreaseEnergy(num);
		energyMeteoriteHitted = 1;
	};

	const energyMeteoriteHitFinish = function () {
		energyMeteoriteHitted = 0;
	};

	const getCheat = function () {
		return cheat;
	};

	const toggleCheat = function () {
		cheat == 0 ? (cheat = 1) : (cheat = 0);
	};

	const getSpaceshipBound = function () {
		const top = y - spaceshipHeight / 2;
		const left = x - spaceshipWidth / 2;
		const bottom = y + spaceshipHeight / 2;
		const right = x + spaceshipWidth / 2;

		return SpaceshipBound(ctx, top, left, bottom, right);
	};

	const drawSpaceship = function () {
		if (isReady()) {
			const degree = {
				1: 270,
				2: 0,
				3: 90,
				4: 180,
			};
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(degree[direction] * (Math.PI / 180));
			ctx.translate(-x, -y);
			ctx.drawImage(
				sheet,
				0,
				0,
				spaceshipWidth,
				spaceshipHeight,
				parseInt(x - spaceshipWidth / 2),
				parseInt(y - spaceshipHeight / 2),
				spaceshipWidth,
				spaceshipHeight
			);
			ctx.restore();
		}
		return this;
	};

	const moveSpaceship = function (dir, cheat) {
		if (cheat || speedUpped) {
			speed = 7.5;
		} else {
			speedDowned == 1 ? (speed = 2.5) : (speed = 4.5);
		}
		direction = dir;
	};

	const stopSpaceship = function () {
		speed = 0;
	};

	const updateSpaceship = function () {
		let { x, y } = getSpaceshipXY();

		switch (direction) {
			case 1:
				x -= speed;
				break;
			case 2:
				y -= speed;
				break;
			case 3:
				x += speed;
				break;
			case 4:
				y += speed;
				break;
		}
		if (gameArea.isPointInBox(x, y)) {
			setSpaceshipXY(x, y);
		}
	};

	return {
		getType: getType,
		getDirection: getDirection,
		setDirection: setDirection,
		getSpeed: getSpeed,
		getEnergy: getEnergy,
		getCheat: getCheat,
		toggleCheat: toggleCheat,
		speedUp: speedUp,
		speedUpFinish: speedUpFinish,
		speedDownFinish: speedDownFinish,
		speedDown: speedDown,
		increaseEnergy: increaseEnergy,
		decreaseEnergy: decreaseEnergy,
		getEnergyMeteoriteHitted: getEnergyMeteoriteHitted,
		energyMeteoriteHit: energyMeteoriteHit,
		energyMeteoriteHitFinish: energyMeteoriteHitFinish,
		moveSpaceship: moveSpaceship,
		stopSpaceship: stopSpaceship,
		updateSpaceship: updateSpaceship,
		getSpaceshipBound: getSpaceshipBound,
		drawSpaceship: drawSpaceship,
		getSpaceshipXY: getSpaceshipXY,
		setSpaceshipXY: setSpaceshipXY,
		getSpaceshipBound: getSpaceshipBound,
		isReady: isReady,
		drawSpaceship: drawSpaceship,
	};
};

const SpaceshipBound = function (ctx, top, left, bottom, right) {
	const path = new Path2D();
	path.rect(left, top, right - left, bottom - top);

	const getBound = function () {
		return { top, left, bottom, right };
	};

	const isPointInBox = function (x, y) {
		return ctx.isPointInPath(path, x, y);
	};
	// This function generates a random point inside the bounding box.
	const randomPoint = function () {
		const x = left + Math.random() * (right - left);
		const y = top + Math.random() * (bottom - top);
		return { x, y };
	};

	const randomBottomPoint = function () {
		const dir = 0;
		const rx = left + Math.random() * (right - left);
		const ry = bottom;
		return { rx, ry, dir };
	};

	const randomRightPoint = function () {
		const dir = 1;
		const rx = right;
		const ry = top + Math.random() * (bottom - top);
		return { rx, ry, dir };
	};

	const randomLeftPoint = function () {
		const dir = 3;
		const rx = left;
		const ry = top + Math.random() * (bottom - top);
		return { rx, ry, dir };
	};

	const randomTopPoint = function () {
		const dir = 2;
		const rx = left + Math.random() * (right - left);
		const ry = top;
		return { rx, ry, dir };
	};

	return {
		getBound: getBound,
		isPointInBox: isPointInBox,
		randomPoint: randomPoint,
		randomTopPoint: randomTopPoint,
		randomBottomPoint: randomBottomPoint,
		randomLeftPoint: randomLeftPoint,
		randomRightPoint: randomRightPoint,
	};
};
