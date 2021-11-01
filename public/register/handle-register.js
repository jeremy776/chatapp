document.querySelector(".new").addEventListener("submit", (e) => {
  e.preventDefault();
  let email = document.querySelector("#email");
  let username = document.querySelector("#username");
  let password = document.querySelector("#password");
  let confrimpass = document.querySelector("#password2");

  if (username.value.length < 3) {
    username.classList.add("is-invalid");
    document.querySelector(".username-label").classList.add("text-danger");
    document.querySelector(".username-error").innerHTML = "Username too short";
  }
  if (password.value !== confrimpass.value) {
    [password,
      confrimpass].map(x => {
        x.classList.add("is-invalid");
      });
    [`.${password.id}-label`,
      `.${confrimpass.id}-label`].map(x => {
        document.querySelector(x).classList.add("text-danger");
      });
    [`.${password.id}-error`,
      `.${confrimpass.id}-error`].map(x => {
        document.querySelector(x).innerHTML = "Password do not match";
      });
  }

  $.ajax({
    url: "/new-account",
    method: "POST",
    data: {
      "email": email.value,
      "username": username.value,
      "password": password.value
    },
    success: function() {
      console.log("done");
    }
  });
});