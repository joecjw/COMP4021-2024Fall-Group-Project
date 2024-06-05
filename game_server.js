const Bound = function (top, left, bottom, right) {
	const getBound = function () {
		return { top, left, bottom, right };
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
		randomPoint: randomPoint,
		randomTopPoint: randomTopPoint,
		randomBottomPoint: randomBottomPoint,
		randomLeftPoint: randomLeftPoint,
		randomRightPoint: randomRightPoint,
	};
};

const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");
const { createServer } = require("http");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const gameSession = session({
	secret: "game",
	resave: false,
	saveUninitialized: false,
	rolling: true,
	cookie: { maxAge: 300000 },
});
app.use(gameSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
	return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
	// Get the JSON data from the body
	const { username, password } = req.body;

	// Reading the users.json file
	const users = JSON.parse(fs.readFileSync("data/users.json"));

	// Checking for the user data correctness
	if (!username) {
		res.json({
			status: "error",
			error: "Empty username",
		});
	} else if (!password) {
		res.json({
			status: "error",
			error: "Empty password",
		});
	} else if (!containWordCharsOnly(username)) {
		res.json({
			status: "error",
			error: "username contains not only underscores, letters or numbers",
		});
	} else if (username in users) {
		res.json({
			status: "error",
			error: "username already exist",
		});
	} else {
		// Adding the new user account
		const encrypted_password = bcrypt.hashSync(password, 10);
		users[username] = {
			password: encrypted_password,
		};

		// Saving the users.json file
		fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));

		// Sending a success response to the browser
		res.json({
			status: "success",
		});
	}
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
	// Get the JSON data from the body
	const { username, password } = req.body;

	// Reading the users.json file
	const users = JSON.parse(fs.readFileSync("./data/users.json"));

	// Checking for username/password
	if (!username) {
		res.json({
			status: "error",
			error: "empty username",
		});
	} else if (!password) {
		res.json({
			status: "error",
			error: "empty password",
		});
	} else if (!(username in users)) {
		res.json({
			status: "error",
			error: "username not exist",
		});
	} else if (!bcrypt.compareSync(password, users[username].password)) {
		res.json({
			status: "error",
			error: "wrong password",
		});
	} else {
		// Sending a success response with the user account
		const authenticated_user = {
			username: username,
			totalNumberOfGames: users[username].totalNumberOfGames,
			totalNumberOfWins: users[username].totalNumberOfWins,
		};
		req.session.user = authenticated_user;
		res.json({
			status: "success",
			user: authenticated_user,
		});
	}
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
	// Getting req.session.user
	if (!req.session.user) {
		res.json({
			status: "error",
			error: "Please login first!",
		});
	} else {
		const authenticated_user = req.session.user;
		// Sending a success response with the user account
		res.json({
			status: "success",
			user: authenticated_user,
		});
	}
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {
	// Deleting req.session.user
	req.session.user = null;

	// Sending a success response
	res.json({
		status: "success",
	});
});

// Websocket setup
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);
let onlineUsers = {};
let pairingUsers = [];
let gamingUsers = [];

const gameArea = Bound(24, 24, 600 - 24, 600 - 24);
let spaceships = {};
let shields = [];
let meteorites = [];
let planets = [];
let playerResults = [];

io.use((socket, next) => {
	gameSession(socket.request, {}, next);
});

io.on("connection", (socket) => {
	console.log("sockect connected");
	// Add a new user to the online user list
	let currentUser = socket.request.session.user;
	if (currentUser) {
		let username = currentUser.username;
		let status = "online";
		onlineUsers[username] = { status };
		io.emit("add user", JSON.stringify({ username, status }));
	}

	socket.on("get users", () => {
		// Send the online users to the browser
		socket.emit("users", JSON.stringify(onlineUsers));
	});

	socket.on("pairing", (username) => {
		// Change users' status and Send the online users to the browser
		onlineUsers[username].status = "pairing";
		pairingUsers.push(username);

		if (pairingUsers.length == 2) {
			gamingUsers.push(pairingUsers[0]);
			gamingUsers.push(pairingUsers[1]);
			pairingUsers.pop();
			pairingUsers.pop();
			onlineUsers[gamingUsers[0]].status = "gaming";
			onlineUsers[gamingUsers[1]].status = "gaming";
			io.emit("users", JSON.stringify(onlineUsers));

			const gameAreaBound = gameArea.getBound();
			spaceships[gamingUsers[0]] = {
				name: gamingUsers[0],
				x_pos: 200,
				y_pos: 450,
				type: 1,
			};
			spaceships[gamingUsers[1]] = {
				name: gamingUsers[1],
				x_pos: 400,
				y_pos: 450,
				type: 2,
			};

			shields.push(randomShield());
			shields.push(randomShield());
			shields.push(randomShield());

			let start = randomStart();
			meteorites.push({
				type: "speed",
				x: start.rx,
				y: start.ry,
				direction: start.dir,
			});

			start = randomStart();
			meteorites.push({
				type: "energy",
				x: start.rx,
				y: start.ry,
				direction: start.dir,
			});

			var randomPlanet1 = randomPlanet();
			var randomPlanet2 = randomPlanet();
			var randomPlanet3 = randomPlanet();
			// avoid planet overlapping
			do {
				if (
					Math.abs(randomPlanet1.x - randomPlanet2.x) <= 48 ||
					Math.abs(randomPlanet1.y - randomPlanet2.y) <= 48
				) {
					randomPlanet1 = randomPlanet();
					randomPlanet2 = randomPlanet();
				} else if (
					Math.abs(randomPlanet2.x - randomPlanet3.x) <= 48 ||
					Math.abs(randomPlanet2.y - randomPlanet3.y) <= 48
				) {
					randomPlanet2 = randomPlanet();
					randomPlanet3 = randomPlanet();
				} else if (
					Math.abs(randomPlanet3.x - randomPlanet1.x) <= 48 ||
					Math.abs(randomPlanet3.y - randomPlanet1.y) <= 48
				) {
					randomPlanet3 = randomPlanet();
					randomPlanet1 = randomPlanet();
				} else {
					break;
				}
			} while (true);

			planets.push(randomPlanet1);
			planets.push(randomPlanet2);
			planets.push(randomPlanet3);

			io.emit(
				"start game",
				JSON.stringify(gamingUsers),
				JSON.stringify({
					gameAreaBound,
					spaceships,
					shields,
					meteorites,
					planets,
				})
			);
		} else {
			io.emit("users", JSON.stringify(onlineUsers));
		}
	});

	socket.on("moveSpaceship", (direction, isCheatEabled, player) => {
		io.emit(
			"executeMoveSpaceship",
			JSON.stringify({ direction, isCheatEabled, player })
		);
	});

	socket.on("stopSpaceship", (direction, player) => {
		io.emit("executeStopSpaceship", JSON.stringify({ direction, player }));
	});

	socket.on("toggleCheat", (player) => {
		io.emit("executeToggleCheat", JSON.stringify({ player }));
	});

	socket.on("speedUp", (player) => {
		io.emit("executeSpeedUp", JSON.stringify({ player }));
		setTimeout(() => {
			io.emit("executeSpeedUpFinish", JSON.stringify({ player }));
		}, 3500);
	});

	socket.on("speedDown", (player) => {
		io.emit("executeSpeedDown", JSON.stringify({ player }));
		setTimeout(() => {
			io.emit("executeSpeedDownFinish", JSON.stringify({ player }));
		}, 3500);
	});

	socket.on("increaseEnergy", (player, amount) => {
		io.emit("executeIncreaseEnergy", JSON.stringify({ player, amount }));
	});

	socket.on("decreaseEnergyByBullet", (player, amount) => {
		io.emit(
			"executeDecreaseEnergyByBullet",
			JSON.stringify({ player, amount })
		);
	});

	socket.on("energyMeteoriteHit", (player, amount) => {
		io.emit("executeEnergyMeteoriteHit", JSON.stringify({ player, amount }));
		setTimeout(() => {
			io.emit("executeEnergyMeteoriteHitFinish", JSON.stringify({ player }));
		}, 1500);
	});

	socket.on("cardEffect", (player, buff) => {
		io.emit("executeCardEffect", JSON.stringify({ player, buff }));
	});

	socket.on("randomizeShield", (index) => {
		const shieldInfo = randomShield();
		io.emit("executeRandomizeShield", JSON.stringify({ index, shieldInfo }));
	});

	socket.on("meteoriteRandomStart", (index) => {
		const meteoriteInfo = randomStart();
		io.emit(
			"executeMeteoriteRandomStart",
			JSON.stringify({ index, meteoriteInfo })
		);
	});

	socket.on("shoot", (spaceshipInfo, targetPlayer) => {
		const { dir, xy, type } = spaceshipInfo;
		let x_shift = 0;
		let y_shift = 0;

		switch (dir) {
			case 1:
				x_shift = -10;
				break;
			case 2:
				y_shift = -15;
				break;
			case 3:
				x_shift = 10;
				break;
			case 4:
				y_shift = 10;
				break;
		}

		const bulletInfo = {
			x: xy.x + x_shift,
			y: xy.y + y_shift,
			b_type: type == 1 ? "rocket" : "energy",
			direction: dir,
		};

		io.emit("executeShoot", JSON.stringify({ bulletInfo, targetPlayer }));
	});

	socket.on("end game", (playerResult) => {
		playerResults.push(playerResult);
		onlineUsers[playerResult.name].status = "online";
		if (playerResults.length == 2) {
			io.emit("users", JSON.stringify(onlineUsers));
			gamingUsers.pop();
			gamingUsers.pop();

			spaceships = {};
			shields = [];
			meteorites = [];
			planets = [];

			let gameResult = {};
			if (playerResults[0].energy > playerResults[1].energy) {
				gameResult = {
					winner: playerResults[0],
					lose: playerResults[1],
				};
			} else {
				gameResult = {
					winner: playerResults[1],
					lose: playerResults[0],
				};
			}
			io.emit("display game end", JSON.stringify(gameResult));
			playerResults = [];
		}
	});

	socket.on("playHitAudio", () => {
		io.emit("executePlayHitAudio", JSON.stringify(gamingUsers));
		playerResults = [];
	});

	socket.on("playCrashAudio", () => {
		io.emit("executePlayCrashAudio", JSON.stringify(gamingUsers));
		playerResults = [];
	});

	socket.on("disconnect", () => {
		// Remove the user from the online user list
		console.log("sockect disconnected");
		let currentUser = socket.request.session.user;
		if (currentUser) {
			let username = currentUser.username;
			delete onlineUsers[username];
			io.emit("remove user", JSON.stringify({ username }));
		}
	});
});

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
	console.log("The game server has started...");
});

const randomShield = function () {
	const birthTime = performance.now();
	const types = ["speed", "energy"];
	const sheetPaths = {
		speed: "assets/objects/shields/shield-speed.png",
		energy: "assets/objects/shields/shield-energy.png",
	};
	const shieldMaxAge = [3500, 4500, 5500];
	const type = types[Math.floor(Math.random() * 2)];
	const src = sheetPaths[type];
	const maxAge = shieldMaxAge[Math.floor(Math.random() * 3)];
	const { x, y } = gameArea.randomPoint();
	return { birthTime, type, src, x, y, maxAge };
};

const randomStart = function () {
	// Set random start point
	const startPoint = {
		0: gameArea.randomTopPoint(),
		1: gameArea.randomBottomPoint(),
		2: gameArea.randomLeftPoint(),
		3: gameArea.randomRightPoint(),
	};
	const index = Math.floor(Math.random() * 4);
	const { rx, ry, dir } = startPoint[index];
	return { rx, ry, dir };
};

const randomPlanet = function () {
	const { x, y } = gameArea.randomPoint();
	const typeX = Math.floor(Math.random() * 3);
	const typeY = Math.floor(Math.random() * 3);
	return { x, y, typeX, typeY };
};
