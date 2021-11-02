document.querySelector(".new").addEventListener("submit", (e) => {
  e.preventDefault();
  loadingButton(true);
  let email = document.querySelector("#email");
  let username = document.querySelector("#username");
  let password = document.querySelector("#password");
  let confrimpass = document.querySelector("#password2");

  if (username.value.length < 3) {
    setTimeout(() => {
      loadingButton(false);
    }, 1000);
    username.classList.add("is-invalid");
    document.querySelector(".username-label").classList.add("text-danger");
    document.querySelector(".username-error").innerHTML = "Username too short";
    return;
  } else if (username.classList.contains("is-invalid")) {
    username.classList.remove("is-invalid");
    document.querySelector(".username-label").classList.remove("text-danger");
    document.querySelector(".username-error").innerHTML = "";
  }
  if (password.value !== confrimpass.value) {
    setTimeout(() => {
      loadingButton(false);
    }, 1000);
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
    return;
  } else if (password.value == confrimpass.value) {
    [password,
      confrimpass].map(x => {
        x.classList.remove("is-invalid");
      });
    [`.${password.id}-label`,
      `.${confrimpass.id}-label`].map(x => {
        document.querySelector(x).classList.remove("text-danger");
      });
    [`.${password.id}-error`,
      `.${confrimpass.id}-error`].map(x => {
        document.querySelector(x).innerHTML = "";
      });
  }

  $.ajax({
    url: "/new-account",
    method: "POST",
    data: {
      "email": email.value,
      "username": username.value,
      "password": password.value,
      "_csrf": document.getElementById("_csrf").value
    },
    success: function(data) {
      if (data.status !== 200) {
        loadingButton(false);
        alert(data.message);
      } else {
        loadingButton(false);
        alert(data.message);
      }
    }
  });

  function loadingButton(state) {
    let button = document.querySelector(".submit-button");
    if (state) {
      button.setAttribute("disabled", true);
      button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    }
    if (!state) {
      button.removeAttribute("disabled");
      button.innerHTML = "Register";
    }
  }
});