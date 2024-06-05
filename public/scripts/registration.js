const Registration = (function () {
  // This function sends a register request to the server
  // * `username`  - The username for the sign-in
  // * `password`  - The password of the user
  // * `onSuccess` - This is a callback function to be called when the
  //                 request is successful in this form `onSuccess()`
  // * `onError`   - This is a callback function to be called when the
  //                 request fails in this form `onError(error)`
  const register = function (
    username,
    password,
    onSuccess,
    onError
  ) {
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
    fetch("/register", {
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

  return { register };
})();
