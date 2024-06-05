const Planet = function (ctx, x, y, typeX, typeY) {
	const planetHeight = 64;
	const planetWidth = 64;
	const sheet = new Image();
	sheet.src = "assets/objects/static-bg-objects.png";
	let sequence = {
		x: 0 + 64 * typeX,
		y: 0 + 64 * typeY,
		planetWidth,
		planetHeight,
		count: 15,
		timing: 0,
		loop: true,
	};
	let index = typeX;
	let index2 = typeY;
	let planetDir = 5;
	let degree = 0;
	const rotationOffset = parseFloat(
		(Math.random() * (0.2 - 0.1) + 0.1).toFixed(2)
	);

	const isReady = function () {
		return sheet.complete && sheet.naturalHeight != 0;
	};

	const getPlanetXY = function () {
		return { x, y };
	};

	const setPlanetXY = function (xvalue, yvalue) {
		[x, y] = [xvalue, yvalue];
		return this;
	};

	const updatePlanet = function (dir) {
		let { x, y } = getPlanetXY();

		switch (dir) {
			case 1:
				x -= (1 + typeX) * (1 + typeY);
				break;
			case 2:
				y -= (1 + typeX) * (1 + typeY);
				break;
			case 3:
				x += (1 + typeX) * (1 + typeY);
				break;
			case 4:
				y += (1 + typeX) * (1 + typeY);
				break;
		}

		setPlanetXY(x, y);
	};

	const drawPlanet = function () {
		if (isReady()) {
			/* Save the settings */
			ctx.save();

			//Clear the canvas
			ctx.clearRect(
				parseInt(x - planetWidth / 2),
				parseInt(y - planetHeight / 2),
				planetWidth,
				planetHeight
			);

			//Update the content
			ctx.imageSmoothingEnabled = false;
			ctx.translate(x, y);
			ctx.rotate(degree * (Math.PI / 180));
			ctx.translate(-x, -y);
			ctx.drawImage(
				sheet,
				index * sequence.planetWidth,
				index2 * sequence.planetHeight,
				sequence.planetWidth,
				sequence.planetHeight,
				parseInt(x - planetWidth / 2),
				parseInt(y - planetHeight / 2),
				planetWidth,
				planetHeight
			);
			update(performance.now());

			/* Restore saved settings */
			ctx.restore();
		}

		return this;
	};

	const update = function (time) {
		let { x, y } = getPlanetXY();
		if (
			y < 0 - planetHeight / 2 ||
			x < 0 - planetHeight / 2 ||
			y > 600 + planetHeight / 2 ||
			x > 600 + planetHeight / 2
		) {
			// new planet
			index = Math.floor(Math.random() * 3);
			index2 = Math.floor(Math.random() * 3);
			setPlanetXY(Math.floor(Math.random() * 450), 600);
		} else {
			degree = (degree + rotationOffset) % 360;
			setTimeout(() => {
				planetDir = Math.floor(Math.random() * 8);
			}, 3000);

			switch (planetDir) {
				case 1:
					setPlanetXY(x, y + (2 * ((1 + typeX) * (1 + typeY))) / 200);
					break;
				case 2:
					setPlanetXY(x, y - (2 * ((1 + typeX) * (1 + typeY))) / 200);
					break;
				case 3:
					setPlanetXY(x + (2 * ((1 + typeX) * (1 + typeY))) / 200, y);
					break;
				case 4:
					setPlanetXY(x - (2 * ((1 + typeX) * (1 + typeY))) / 200, y);
					break;
				case 5:
					setPlanetXY(
						x - (2 * ((1 + typeX) * (1 + typeY))) / 200,
						y - (2 * ((1 + typeX) * (1 + typeY))) / 200
					);
					break;
				case 6:
					setPlanetXY(
						x + (2 * ((1 + typeX) * (1 + typeY))) / 200,
						y + (2 * ((1 + typeX) * (1 + typeY))) / 200
					);
					break;
				case 7:
					setPlanetXY(
						x + (2 * ((1 + typeX) * (1 + typeY))) / 200,
						y - (2 * ((1 + typeX) * (1 + typeY))) / 200
					);
					break;
				case 8:
					setPlanetXY(
						x - (2 * ((1 + typeX) * (1 + typeY))) / 200,
						y + (2 * ((1 + typeX) * (1 + typeY))) / 200
					);
					break;
			}
		}

		return this;
	};

	// The methods are returned as an object here.
	return {
		getPlanetXY: getPlanetXY,
		setPlanetXY: setPlanetXY,
		updatePlanet: updatePlanet,
		isReady: isReady,
		drawPlanet: drawPlanet,
		update: update,
	};
};
