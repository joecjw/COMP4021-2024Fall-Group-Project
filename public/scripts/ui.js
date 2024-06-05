const SignInForm = (function () {
	// This function initializes the UI
	const initialize = function () {
		// Show it
		$("#signin-form").show();

		//Submit event for the signin form
		$("#signin-form").on("submit", (e) => {
			// Do not submit the form
			e.preventDefault();

			// Get the input fields
			const username = $("#signin-username").val().trim();
			const password = $("#signin-password").val().trim();

			// Send a signin request
			Authentication.signin(
				username,
				password,
				() => {
					FormControllButton.hide();
					FormControllButton.hideFormArea();
					UserPanel.update(Authentication.getUser());
					UserPanel.show();
					Menu.show();
					GameplayArea.hide();
					GameoverArea.hide();
					Socket.connect();
				},
				(error) => {
					$("#signin-message").text(error);
				}
			);
		});
	};

	return { initialize };
})();

const RegisterForm = (function () {
	// This function initializes the UI
	const initialize = function () {
		// Hide it
		$("#register-form").hide();

		//Submit event for the register form
		$("#register-form").on("submit", (e) => {
			// Do not submit the form
			e.preventDefault();

			// Get the input fields
			const username = $("#register-username").val().trim();
			const password = $("#register-password").val().trim();
			const confirmPassword = $("#register-confirm").val().trim();

			// Password and confirmation does not match
			if (password != confirmPassword) {
				$("#register-message").text("Passwords do not match.");
				return;
			}

			// Send a register request
			Registration.register(
				username,
				password,
				() => {
					$("#register-form").get(0).reset();
					$("#register-message").text("You can sign in now.");
				},
				(error) => {
					$("#register-message").text(error);
				}
			);
		});
	};
	return { initialize };
})();

const FormControllButton = (function () {
	// This function shows the button
	const show = function () {
		$("#front-page-controll").fadeIn(500);
	};

	// This function hides the button
	const hide = function () {
		$("#front-page-controll").hide();
	};

	// This function shows the form area
	const showFormArea = function () {
		$("#signin-register-container").show();
	};

	// This function hides the form area
	const hideFormArea = function () {
		$("#signin-register-container").hide();
	};

	// This function shows the signin form
	const showSignInForm = function () {
		$("#signin-form").show();
	};

	// This function hides the signin form
	const hideSignInForm = function () {
		$("#signin-form")[0].reset();
		$("#signin-message").text("");
		$("#signin-form").hide();
	};

	// This function shows the register form
	const showRegisterForm = function () {
		$("#register-form").show();
	};

	// This function hides the register form
	const hideRegisterForm = function () {
		$("#register-form")[0].reset();
		$("#register-message").text("");
		$("#register-form").hide();
	};

	const initialize = function () {
		$("#front-page-controll").text("Click To Register Account");

		// Show the signin form
		showSignInForm();

		//Click event for the button
		$("#front-page-controll").on("click", () => {
			if (
				$("#register-form").is(":hidden") &&
				!$("#signin-form").is(":hidden")
			) {
				$("#front-page-controll").text("Click To Sign In");
				hideSignInForm();
				showRegisterForm();
			} else if (
				!$("#register-form").is(":hidden") &&
				$("#signin-form").is(":hidden")
			) {
				$("#front-page-controll").text("Click To Register Account");
				hideRegisterForm();
				showSignInForm();
			}
		});
	};

	return {
		initialize,
		show,
		hide,
		showFormArea,
		hideFormArea,
		showSignInForm,
		hideSignInForm,
		showRegisterForm,
		hideRegisterForm,
	};
})();

const UserPanel = (function () {
	// This function initializes the UI
	const initialize = function () {
		// Hide it
		$("#user-panel").hide();

		// Click event for the signout button
		$("#signout-button").on("click", () => {
			// Send a signout request
			Authentication.signout(() => {
				Socket.disconnect();
				hide();
				Menu.hide();
				GameplayArea.hide();
				GameoverArea.hide();
				FormControllButton.show();
				FormControllButton.showFormArea();
			});
		});
	};
	// This function shows the form with the user
	const show = function () {
		$("#user-panel").show();
	};

	// This function hides the form
	const hide = function () {
		$("#user-panel").hide();
	};

	// This function updates the user panel
	const update = function (user) {
		if (user) {
			$("#user-panel #username").text("Welcome " + user.username);
		} else {
			$("#user-panel #username").text("");
		}
	};

	return { initialize, show, hide, update };
})();

const Menu = (function () {
	// This function initializes the UI
	const initialize = function () {
		// Hide it
		$("#menu-container").hide();

		// Game Start Event for the menu
		$("#start-game-button").on("click", () => {
			UserPanel.hide();
			Menu.hide();
			GameplayArea.hide();
			GameoverArea.hide();
			OnlineUsersPanel.show();

			const username = Authentication.getUser().username;
			const socket = Socket.getSocket();
			if (socket && socket.connected) {
				console.log("user:" + username + "-start pairing");
				socket.emit("pairing", username);
			}
		});
	};

	// This function shows the menu
	const show = function () {
		$("#menu-container").show();
	};

	// This function hides the menu
	const hide = function () {
		$("#menu-container").hide();
	};

	return { initialize, show, hide };
})();

const OnlineUsersPanel = (function () {
	// This function initializes the UI
	const initialize = function () {
		// Hide the panel
		$("#online-users-panel").hide();
	};

	// This function shows the panel
	const show = function () {
		$("#online-users-panel").show();
	};

	// This function hides the panel
	const hide = function () {
		$("#online-users-panel").hide();
	};

	// This function updates the online users panel
	const update = function (onlineUsers) {
		console.log("updating online users panel");
		const onlineUsersArea = $("#online-users-area");

		// Clear the online users area
		onlineUsersArea.empty();

		// Add the user one-by-one
		for (const username in onlineUsers) {
			var userIcon =
				`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					class="bi bi-person-fill" viewBox="0 0 16 16">
					<path
						d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
					</svg>`;
			onlineUsersArea.append(
				$(
					"<div id='username-" +
					username +
					"' class='online-user'>" +
					"<div>" +
					userIcon +
					" " +
					username +
					"</div><div class='user-status'>" +
					onlineUsers[username].status +
					"</div></.div>"
				)
			);
		}
	};

	// This function adds a user in the panel
	const addUser = function (user) {
		const onlineUsersArea = $("#online-users-area");

		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);

		// Add the user
		if (userDiv.length == 0) {
			var userIcon =
				`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					class="bi bi-person-fill" viewBox="0 0 16 16">
					<path
						d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
					</svg>`;
			onlineUsersArea.append(
				$(
					"<div id='username-" +
					user.username +
					"' class='online-user'>" +
					"<div>" +
					userIcon +
					" " +
					user.username +
					"</div><div class='user-status'>" +
					user.status +
					"</div></.div>"
				)
			);
		}
	};

	// This function removes a user from the panel
	const removeUser = function (user) {
		const onlineUsersArea = $("#online-users-area");

		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);

		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

	return { initialize, show, hide, update, addUser, removeUser };
})();

const GameplayArea = (function () {
	// This function initializes the UI
	const initialize = function () {
		// Hide it
		$("#gameplay-area").hide();
	};

	// This function shows the gameplayarea
	const show = function () {
		$("#gameplay-area").show();
	};

	// This function hides the gameplayarea
	const hide = function () {
		$("#gameplay-area").hide();
	};

	return { initialize, show, hide };
})();

const GameoverArea = (function () {
	// This function initializes the UI
	const initialize = function () {
		// Hide it
		$("#gameover-area").hide();

		// go to gamepage area for restart the game
		$("#restart-gameoverarea-button").on("click", () => {
			$("#gameover-area").hide();
			const username = Authentication.getUser().username;
			const socket = Socket.getSocket();
			if (socket && socket.connected) {
				console.log("user:" + username + "-start pairing");
				socket.emit("pairing", username);
			}
			OnlineUsersPanel.show();
		});

		// go to front page
		$("#home-gameoverarea-button").on("click", () => {
			$("#gameover-area").hide();
			UserPanel.show();
			Menu.show();
		});
	};

	// This function shows the gameoverarea
	const show = function () {
		$("#gameover-area").show();
	};

	// This function hides the gameoverarea
	const hide = function () {
		$("#gameover-area").hide();
	};

	return { initialize, show, hide };
})();

const UI = (function () {
	// The components of the UI are put here
	const components = [
		SignInForm,
		RegisterForm,
		FormControllButton,
		UserPanel,
		Menu,
		OnlineUsersPanel,
		GameplayArea,
		GameoverArea,
	];

	// This function initializes the UI
	const initialize = function () {
		// Initialize the components
		for (const component of components) {
			component.initialize();
		}
	};

	return { initialize };
})();
