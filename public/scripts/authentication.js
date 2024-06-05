const Authentication = (function () {
	// This stores the current signed-in user
	let user = null;

	// This function gets the signed-in user
	const getUser = function () {
		return user;
	};

	// This function sends a sign-in request to the server
	// * `username`  - The username for the sign-in
	// * `password`  - The password of the user
	// * `onSuccess` - This is a callback function to be called when the
	//                 request is successful in this form `onSuccess()`
	// * `onError`   - This is a callback function to be called when the
	//                 request fails in this form `onError(error)`
	const signin = function (username, password, onSuccess, onError) {
		//
		// Preparing the user data
		//
		const payload = JSON.stringify({
			username: username,
			password: password,
		});
		//
		// Sending the AJAX request to the server
		//
		fetch("/signin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: payload,
		})
			.then((res) => res.json())
			.then((json) => {
				if (json.status == "success") {
					//
					// Handling the success response from the server
					//
					user = json.user;
					onSuccess();
				} else if (onError) {
					//
					// Processing any error returned by the server
					//
					onError(json.error);
				}
			})
			.catch((err) => {
				console.log("Error:" + err);
			});
	};

	// This function sends a validate request to the server
	// * `onSuccess` - This is a callback function to be called when the
	//                 request is successful in this form `onSuccess()`
	// * `onError`   - This is a callback function to be called when the
	//                 request fails in this form `onError(error)`
	const validate = function (onSuccess, onError) {
		//
		// Sending the AJAX request to the server
		//
		fetch("/validate", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
			.then((res) => res.json())
			.then((json) => {
				if (json.status == "success") {
					//
					// Handling the success response from the server
					//
					user = json.user;
					onSuccess();
				} else if (onError) {
					//
					// Processing any error returned by the server
					//
					onError(json.error);
				}
			})
			.catch((err) => {
				console.log("Error!");
			});
	};

	// This function sends a sign-out request to the server
	// * `onSuccess` - This is a callback function to be called when the
	//                 request is successful in this form `onSuccess()`
	// * `onError`   - This is a callback function to be called when the
	//                 request fails in this form `onError(error)`
	const signout = function (onSuccess, onError) {
		fetch("/signout", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
			.then((res) => res.json())
			.then((json) => {
				if (json.status == "success") {
					user = null;
					onSuccess();
				} else if (onError) {
					onError(json.error);
				}
			})
			.catch((err) => {
				console.log("Error!");
			});
	};

	return { getUser, signin, validate, signout };
})();
