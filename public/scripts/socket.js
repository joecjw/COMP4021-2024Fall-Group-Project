const Socket = (function () {
	// This stores the current Socket.IO socket
	let socket = null;

	// This function gets the socket from the module
	const getSocket = function () {
		return socket;
	};

	// This function connects the server and initializes the socket
	const connect = function () {
		socket = io();

		// Wait for the socket to connect successfully
		socket.on("connect", () => {
			console.log("socket connected");
			// Get the online user list
			socket.emit("get users");
		});

		// Set up the users event
		socket.on("users", (onlineUsers) => {
			onlineUsers = JSON.parse(onlineUsers);

			// Show the online users
			OnlineUsersPanel.update(onlineUsers);
		});

		// Set up the add user event
		socket.on("add user", (user) => {
			user = JSON.parse(user);

			// Add the online user
			OnlineUsersPanel.addUser(user);
		});

		// Set up the remove user event
		socket.on("remove user", (user) => {
			user = JSON.parse(user);

			// Remove the online user
			OnlineUsersPanel.removeUser(user);
		});

		// Set up the start game event
		socket.on("start game", (gamingUsers, gameObjects) => {
			gamingUsers = JSON.parse(gamingUsers);
			gameObjects = JSON.parse(gameObjects);
			playGame(gamingUsers, gameObjects);
		});

		// Set up the display game end event
		socket.on("display game end", (gameResult) => {
			gameResult = JSON.parse(gameResult);
			const { winner, lose } = gameResult;

			// both user same energy score
			if (winner.energy == lose.energy) {
				$("#playerwintext").text("The game scored with a draw.");
				$(".rankdraw").show();
				$(".ranklose").hide();
			} else {
				$("#playerwintext").text(winner.name.concat(" Wins!"));
				$(".rankdraw").hide();
				$(".ranklose").show();
			}

			$(".playerwin").text(winner.name);
			$(".playerwinscore").text(winner.energy + " pts");
			$("#damage1").text(winner.damage);
			$("#resource1").text(winner.collect);

			$(".playerlose").text(lose.name);
			$(".playerlosescore").text(lose.energy + " pts");
			$("#damage2").text(lose.damage);
			$("#resource2").text(lose.collect);

			// update statistics bar
			winnerPercentage = 0;
			losePercentage = 0;
			if (lose.energy == 0 && winner.energy == 0) {
				winnerPercentage = 0.5;
				losePercentage = 0.5;
			} else if (lose.energy > 0 && winner.energy > 0) {
				winnerPercentage = winner.energy / (winner.energy + lose.energy);
				losePercentage = lose.energy / (winner.energy + lose.energy);
			} else if (lose.energy < 0 && winner.energy < 0) {
				winnerPercentage =
					Math.abs(lose.energy) /
					(Math.abs(winner.energy) + Math.abs(lose.energy));
				losePercentage =
					Math.abs(winner.energy) /
					(Math.abs(winner.energy) + Math.abs(lose.energy));
			} else {
				winnerPercentageTemp =
					(winner.energy + Math.abs(winner.energy - lose.energy)) /
					Math.abs(winner.energy - lose.energy);
				losePercentageTemp =
					(lose.energy + Math.abs(winner.energy - lose.energy)) /
					Math.abs(winner.energy - lose.energy);

				winnerPercentage =
					winnerPercentageTemp / (winnerPercentageTemp + losePercentageTemp);
				losePercentage =
					losePercentageTemp / (winnerPercentageTemp + losePercentageTemp);
			}

			document.getElementById("shield-bar-win").style.width =
				winnerPercentage * 100 + "%";
			document.getElementById("shield-bar-win").innerText = winner.energy;
			document.getElementById("shield-bar-lose").style.width =
				losePercentage * 100 + "%";
			document.getElementById("shield-bar-lose").innerText = lose.energy;

			document.getElementById("damage-bar-win").style.width =
				(winner.damage + lose.damage != 0
					? (winner.damage * 100) / (winner.damage + lose.damage)
					: 50) + "%";
			document.getElementById("damage-bar-win").innerText = winner.damage;
			document.getElementById("damage-bar-lose").style.width =
				(winner.damage + lose.damage != 0
					? (lose.damage * 100) / (winner.damage + lose.damage)
					: 50) + "%";
			document.getElementById("damage-bar-lose").innerText = lose.damage;

			document.getElementById("resource-bar-win").style.width =
				(winner.collect + lose.collect != 0
					? (winner.collect * 100) / (winner.collect + lose.collect)
					: 50) + "%";
			document.getElementById("resource-bar-win").innerText = winner.collect;
			document.getElementById("resource-bar-lose").style.width =
				(winner.collect + lose.collect != 0
					? (lose.collect * 100) / (winner.collect + lose.collect)
					: 50) + "%";
			document.getElementById("resource-bar-lose").innerText = lose.collect;

			if (
				Authentication.getUser().username == winner.name ||
				Authentication.getUser().username == lose.name
			) {
				UserPanel.hide();
				Menu.hide();
				OnlineUsersPanel.hide();
				FormControllButton.hide();
				FormControllButton.hideFormArea();
				GameplayArea.hide();
				GameoverArea.show();
			}
		});
	};

	// This function disconnects the socket from the server
	const disconnect = function () {
		socket.disconnect();
		socket = null;
		console.log("socket disconnected");
	};

	return {
		getSocket,
		connect,
		disconnect,
	};
})();

function playGame(gamingUsers, gameObjects) {
	FormControllButton.hide();
	FormControllButton.hideFormArea();
	UserPanel.hide();
	Menu.hide();
	OnlineUsersPanel.hide();
	GameoverArea.hide();
	GameplayArea.show();

	const sockect = Socket.getSocket();

	const username = Authentication.getUser().username;
	const player1 = gamingUsers[0];
	const player2 = gamingUsers[1];
	$("#username1").text(player1);
	$("#username2").text(player2);

	// Get canvas and 2D context
	const canvas = $("canvas").get(0);
	const context = canvas.getContext("2d");

	const hitAudio = new Audio("../assets/audios/hit-audio.mp3");
	const crashAudio = new Audio("../assets/audios/crash-audio.mp3");

	const { gameAreaBound, spaceships, shields, meteorites, planets } =
		gameObjects;
	const { top, left, bottom, right } = gameAreaBound;

	// Initialize game variables and constants
	const duration = 120;
	const startTime = performance.now();
	let player1Damage = 0;
	let player2Damage = 0;
	let player1Collect = 0;
	let player2Collect = 0;

	// Create the game area
	const gameArea = SpaceshipBound(context, top, left, bottom, right);

	// Create the game objects
	const spaceship1 = Spaceship(
		context,
		spaceships[player1].x_pos,
		spaceships[player1].y_pos,
		gameArea,
		spaceships[player1].type
	);
	const spaceship2 = Spaceship(
		context,
		spaceships[player2].x_pos,
		spaceships[player2].y_pos,
		gameArea,
		spaceships[player2].type
	);

	let shieldArray = [];
	shields.forEach((shield) => {
		shieldArray.push(
			Shield(
				context,
				shield.x,
				shield.y,
				shield.maxAge,
				shield.birthTime,
				shield.type,
				shield.src
			)
		);
	});

	let meteoriteArray = [];
	meteorites.forEach((meteorite) => {
		meteoriteArray.push(
			Meteorite(
				context,
				meteorite.x,
				meteorite.y,
				gameArea,
				meteorite.type,
				meteorite.direction
			)
		);
	});

	let planetArray = [];
	planets.forEach((planet) => {
		planetArray.push(
			Planet(context, planet.x, planet.y, planet.typeX, planet.typeY)
		);
	});

	function keydownFn(event) {
		if (event.keyCode == 37) {
			event.preventDefault();
			username == player1
				? sockect.emit("moveSpaceship", 1, spaceship1.getCheat(), player1)
				: sockect.emit("moveSpaceship", 1, spaceship2.getCheat(), player2);
		}
		if (event.keyCode == 38) {
			event.preventDefault();
			username == player1
				? sockect.emit("moveSpaceship", 2, spaceship1.getCheat(), player1)
				: sockect.emit("moveSpaceship", 2, spaceship2.getCheat(), player2);
		}
		if (event.keyCode == 39) {
			event.preventDefault();
			username == player1
				? sockect.emit("moveSpaceship", 3, spaceship1.getCheat(), player1)
				: sockect.emit("moveSpaceship", 3, spaceship2.getCheat(), player2);
		}
		if (event.keyCode == 40) {
			event.preventDefault();
			username == player1
				? sockect.emit("moveSpaceship", 4, spaceship1.getCheat(), player1)
				: sockect.emit("moveSpaceship", 4, spaceship2.getCheat(), player2);
		}
		if (event.keyCode == 67) {
			event.preventDefault();
			// C key for Cheatmode
			username == player1
				? sockect.emit("toggleCheat", player1)
				: sockect.emit("toggleCheat", player2);
		}
		if (event.keyCode == 32) {
			// SpaceBar for shooting bullets
			event.preventDefault();
			sockect.delay = true;
			username == player1
				? sockect.emit(
						"shoot",
						{
							dir: spaceship1.getDirection(),
							xy: spaceship1.getSpaceshipXY(),
							type: spaceship1.getType(),
						},
						player2
				  )
				: sockect.emit(
						"shoot",
						{
							dir: spaceship2.getDirection(),
							xy: spaceship2.getSpaceshipXY(),
							type: spaceship2.getType(),
						},
						player1
				  );
		}
	}

	function keyupFn(event) {
		if (event.keyCode == 37) {
			username == player1
				? sockect.emit("stopSpaceship", 1, player1)
				: sockect.emit("stopSpaceship", 1, player2);
		}
		if (event.keyCode == 38) {
			username == player1
				? sockect.emit("stopSpaceship", 2, player1)
				: sockect.emit("stopSpaceship", 2, player2);
		}
		if (event.keyCode == 39) {
			username == player1
				? sockect.emit("stopSpaceship", 3, player1)
				: sockect.emit("stopSpaceship", 3, player2);
		}
		if (event.keyCode == 40) {
			username == player1
				? sockect.emit("stopSpaceship", 4, player1)
				: sockect.emit("stopSpaceship", 4, player2);
		}
	}

	// Handle window event
	window.addEventListener("keydown", keydownFn);
	window.addEventListener("keyup", keyupFn);

	// Main process
	function doFrame(now) {
		// Update the time remaining
		$("#time1").text(
			duration - Math.ceil((performance.now() - startTime) / 1000)
		);
		$("#time2").text(
			duration - Math.ceil((performance.now() - startTime) / 1000)
		);

		// Display speed and energy
		$("#speed1").text(spaceship1.getSpeed());
		$(".energy1").text(spaceship1.getEnergy());
		$("#speed2").text(spaceship2.getSpeed());
		$(".energy2").text(spaceship2.getEnergy());

		// Display cheat mode situation
		$("#cheat1").text(spaceship1.getCheat() == 0 ? "OFF" : "ON");
		$("#cheat2").text(spaceship2.getCheat() == 0 ? "OFF" : "ON");

		shieldArray.forEach((shield, index) => {
			// Randomize the shield when expired
			if (shield.isExpired()) {
				sockect.emit("randomizeShield", index);
			}
			// collect shield
			if (
				spaceship1
					.getSpaceshipBound()
					.isPointInBox(shield.getShieldXY().x, shield.getShieldXY().y)
			) {
				if (username == player1) {
					if (shield.getType() == "speed") {
						sockect.emit("speedUp", player1);
					} else if (shield.getType() == "energy") {
						if (spaceship1.getCheat() == 0) {
							sockect.emit("increaseEnergy", player1, 15);
							player1Collect += 15;
						} else {
							sockect.emit("increaseEnergy", player1, 30);
							player1Collect += 30;
						}
					}
					sockect.emit("randomizeShield", index);
					// player-card item effect
					sockect.emit("cardEffect", player1, "positive");
				}
			}

			if (
				spaceship2
					.getSpaceshipBound()
					.isPointInBox(shield.getShieldXY().x, shield.getShieldXY().y)
			) {
				if (username == player2) {
					if (shield.getType() == "speed") {
						sockect.emit("speedUp", player2);
					} else if (shield.getType() == "energy") {
						if (shield.getType() == "speed") {
							sockect.emit("speedUp", player2);
						} else if (shield.getType() == "energy") {
							if (spaceship2.getCheat() == 0) {
								sockect.emit("increaseEnergy", player2, 15);
								player2Collect += 15;
							} else {
								sockect.emit("increaseEnergy", player2, 30);
								player2Collect += 30;
							}
						}
					}
					sockect.emit("randomizeShield", index);
					// player-card item effect
					sockect.emit("cardEffect", player2, "positive");
				}
			}
		});

		// Hit Speed Meteorite
		const speedMeteorite =
			meteoriteArray[0].getMeteoriteType() == "speed"
				? meteoriteArray[0]
				: meteoriteArray[1];
		if (
			spaceship1
				.getSpaceshipBound()
				.isPointInBox(
					speedMeteorite.getMeteoriteXY().x,
					speedMeteorite.getMeteoriteXY().y
				)
		) {
			if (username == player1) {
				sockect.emit("speedDown", player1);
				sockect.emit("playCrashAudio");
				// player-card damage effect
				sockect.emit("cardEffect", player1, "negative");
			}
		}

		if (
			spaceship2
				.getSpaceshipBound()
				.isPointInBox(
					speedMeteorite.getMeteoriteXY().x,
					speedMeteorite.getMeteoriteXY().y
				)
		) {
			if (username == player2) {
				sockect.emit("speedDown", player2);
				sockect.emit("playCrashAudio");
				// player-card damage effect
				sockect.emit("cardEffect", player2, "negative");
			}
		}

		// Hit Energy Meteorite
		const energyMeteorite =
			meteoriteArray[0].getMeteoriteType() == "energy"
				? meteoriteArray[0]
				: meteoriteArray[1];
		if (
			spaceship1
				.getSpaceshipBound()
				.isPointInBox(
					energyMeteorite.getMeteoriteXY().x,
					energyMeteorite.getMeteoriteXY().y
				)
		) {
			if (!spaceship1.getEnergyMeteoriteHitted() && username == player1) {
				sockect.emit("energyMeteoriteHit", player1, 20);
				sockect.emit("playCrashAudio");
				// player-card damage effect
				sockect.emit("cardEffect", player1, "negative");
			}
		}

		if (
			spaceship2
				.getSpaceshipBound()
				.isPointInBox(
					energyMeteorite.getMeteoriteXY().x,
					energyMeteorite.getMeteoriteXY().y
				)
		) {
			if (!spaceship2.getEnergyMeteoriteHitted() && username == player2) {
				sockect.emit("energyMeteoriteHit", player2, 20);
				sockect.emit("playCrashAudio");
				// player-card damage effect
				sockect.emit("cardEffect", player2, "negative");
			}
		}

		// Clear the screen
		context.clearRect(0, 0, canvas.width, canvas.height);

		// Update the objects
		spaceship1.updateSpaceship();
		spaceship2.updateSpaceship();
		meteoriteArray.forEach((meteorite, index) => {
			meteorite.update();
			if (!meteorite.isInsideBoundary()) {
				sockect.emit("meteoriteRandomStart", index);
			}
		});

		shieldArray.forEach((shield) => shield.update(now));

		// Draw the objects (orders:  Planet > Meteorite > Spaceship > Resources)
		planetArray.forEach((planet) => planet.drawPlanet());
		meteoriteArray.forEach((meteorite) => meteorite.drawMeteorite());
		spaceship1.drawSpaceship();
		spaceship2.drawSpaceship();
		shieldArray.forEach((shield) => shield.drawShield());

		// Handle gameover situation
		if (Math.ceil(performance.now() - startTime) >= duration * 1000) {
			if (username == player1) {
				sockect.emit("end game", {
					name: player1,
					energy: spaceship1.getEnergy(),
					damage: player1Damage,
					collect: player1Collect,
				});
			} else {
				sockect.emit("end game", {
					name: player2,
					energy: spaceship2.getEnergy(),
					damage: player2Damage,
					collect: player2Collect,
				});
			}
			// remove keyboard event listener
			window.removeEventListener("keydown", keydownFn);
			window.removeEventListener("keyup", keyupFn);
		} else {
			// Process next frame
			window.requestAnimationFrame(doFrame);
		}
	}

	sockect.on("executeMoveSpaceship", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.moveSpaceship(operation.direction, operation.isCheatEabled)
			: spaceship2.moveSpaceship(operation.direction, operation.isCheatEabled);
	});

	sockect.on("executeStopSpaceship", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.stopSpaceship(operation.direction)
			: spaceship2.stopSpaceship(operation.direction);
	});

	sockect.on("executeSpeedUp", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1 ? spaceship1.speedUp() : spaceship2.speedUp();
	});

	sockect.on("executeSpeedUpFinish", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.speedUpFinish()
			: spaceship2.speedUpFinish();
	});

	sockect.on("executeSpeedDown", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.speedDown()
			: spaceship2.speedDown();
	});

	sockect.on("executeSpeedDownFinish", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.speedDownFinish()
			: spaceship2.speedDownFinish();
	});

	sockect.on("executeIncreaseEnergy", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.increaseEnergy(operation.amount)
			: spaceship2.increaseEnergy(operation.amount);
	});

	sockect.on("executeDecreaseEnergyByBullet", (operation) => {
		operation = JSON.parse(operation);

		operation.player == player1
			? spaceship1.decreaseEnergy(operation.amount)
			: spaceship2.decreaseEnergy(operation.amount);
	});

	sockect.on("executeToggleCheat", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.toggleCheat()
			: spaceship2.toggleCheat();
	});

	sockect.on("executeRandomizeShield", (randomizeResult) => {
		randomizeResult = JSON.parse(randomizeResult);
		const { index, shieldInfo } = randomizeResult;
		const { x, y, maxAge, birthTime, type, src } = shieldInfo;

		let target = shieldArray[index];
		target.setShieldXY(x, y);
		target.setMaxAge(maxAge);
		target.setBirthTime(birthTime);
		target.setType(type);
		target.setSheet(src);
	});

	sockect.on("executeEnergyMeteoriteHit", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.energyMeteoriteHit(operation.amount)
			: spaceship2.energyMeteoriteHit(operation.amount);
	});

	sockect.on("executeEnergyMeteoriteHitFinish", (operation) => {
		operation = JSON.parse(operation);
		operation.player == player1
			? spaceship1.energyMeteoriteHitFinish()
			: spaceship2.energyMeteoriteHitFinish();
	});

	sockect.on("executeCardEffect", (operation) => {
		operation = JSON.parse(operation);
		if (operation.player == player1) {
			if (operation.buff == "positive") {
				document
					.getElementById("player-card1")
					.classList.add("player-card-item");
				setTimeout(function () {
					document
						.getElementById("player-card1")
						.classList.remove("player-card-item");
				}, 750);
			} else {
				document
					.getElementById("player-card1")
					.classList.add("player-card-damage");
				setTimeout(function () {
					document
						.getElementById("player-card1")
						.classList.remove("player-card-damage");
				}, 750);
			}
		} else {
			if (operation.buff == "positive") {
				document
					.getElementById("player-card2")
					.classList.add("player-card-item");
				setTimeout(function () {
					document
						.getElementById("player-card2")
						.classList.remove("player-card-item");
				}, 750);
			} else {
				document
					.getElementById("player-card2")
					.classList.add("player-card-damage");
				setTimeout(function () {
					document
						.getElementById("player-card2")
						.classList.remove("player-card-damage");
				}, 750);
			}
		}
	});

	sockect.on("executeMeteoriteRandomStart", (randomStartResult) => {
		randomStartResult = JSON.parse(randomStartResult);
		const { index, meteoriteInfo } = randomStartResult;
		const { rx, ry, dir } = meteoriteInfo;

		let target = meteoriteArray[index];
		target.setMeteoriteXY(rx, ry);
		target.setMeteoriteDirection(dir);
	});

	sockect.on("executeShoot", (shootInfo) => {
		shootInfo = JSON.parse(shootInfo);
		const { bulletInfo, targetPlayer } = shootInfo;
		const { x, y, b_type, direction } = bulletInfo;

		const bullet = Bullet(context, x, y, b_type, direction);

		function doBulletFrame(now) {
			let hitByMeteorite = false;
			meteoriteArray.forEach((meteorite) => {
				if (
					meteorite
						.getMeteoriteBoundingBox()
						.isPointInBox(bullet.getBulletXY().x, bullet.getBulletXY().y)
				) {
					sockect.emit("playHitAudio");
					hitByMeteorite = true;
				}
			});

			let outArea = false;
			if (
				!gameArea.isPointInBox(bullet.getBulletXY().x, bullet.getBulletXY().y)
			) {
				outArea = true;
			}

			let hitTarget = false;
			let target = null;
			targetPlayer == player1 ? (target = spaceship1) : (target = spaceship2);
			if (
				target
					.getSpaceshipBound()
					.isPointInBox(bullet.getBulletXY().x, bullet.getBulletXY().y)
			) {
				sockect.emit("playHitAudio");
				hitTarget = true;

				if (targetPlayer != username && sockect.delay) {
					sockect.emit("decreaseEnergyByBullet", targetPlayer, 20);
					sockect.emit("cardEffect", targetPlayer, "negative");
					socketDelay(sockect);
				}
				target == spaceship1 ? (player2Damage += 20) : (player1Damage += 20);
			}

			bullet.update(performance.now());
			bullet.drawBullet();

			if (!hitByMeteorite && !outArea && !hitTarget) {
				requestAnimationFrame(doBulletFrame);
			}
		}

		requestAnimationFrame(doBulletFrame);
	});

	sockect.on("executePlayHitAudio", (gamingUsers) => {
		gamingUsers = JSON.parse(gamingUsers);
		gamingUsers.forEach((user) => {
			if (user == username) {
				hitAudio.play();
			}
		});
	});

	sockect.on("executePlayCrashAudio", (gamingUsers) => {
		gamingUsers = JSON.parse(gamingUsers);
		gamingUsers.forEach((user) => {
			if (user == username) {
				crashAudio.play();
			}
		});
	});

	const socketDelay = (socket) => {
		sockect.delay = false;
		setTimeout(() => {
			sockect.delay = true;
		}, 300);
	};

	window.requestAnimationFrame(doFrame);
}
