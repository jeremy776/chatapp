/*document.querySelector(".login").addEventListener("submit", (e) => {
  e.preventDefault();
  loadingButton(true);
  $.ajax({
    url: "/login-account",
    method: "POST",
    data: {
      "email": document.querySelector(".email").value,
      "password": document.querySelector(".password").value,
      "_csrf": document.querySelector("._csrf").value
    },
    error: function(e) {
      return console.log(e);
    },
    success: function(data) {
      setTimeout(() => {
        loadingButton(false);
      }, 1000);
      console.log(data.status);
      if (data.status !== 200) {
        if (data.detail.type == "form-error") {
          if (document.querySelector(".email").classList.contains("is-invalid") && data.detail.formId !== "email") {
            document.querySelector(".email").classList.remove("is-invalid");
            document.querySelector(".email-label").classList.remove("text-danger");
            document.querySelector(".email-error").innerHTML = "";
          } else if (document.querySelector(".password").classList.contains("is-invalid") && data.detail.formId !== "email") {
            document.querySelector(".password").classList.remove("is-invalid");
            document.querySelector(".password-label").classList.remove("text-danger");
            document.querySelector(".password-error").innerHTML = "";
          }
          document.querySelector(`.${data.detail.formId}`).classList.add("is-invalid");
          document.querySelector(`.${data.detail.formId}-label`).classList.add("text-danger");
          document.querySelector(`.${data.detail.formId}-error`).innerHTML = data.message;
          return;
        } else if (data.detail.type !== "form-error") {
          document.querySelector(".message").innerHTML = `<div class="message-info-error"><p>${data.message}</p></div>`;
          return;
        }
      } else {
        window.location.href = "/me";
        return;
      }
    }
  });
});

function loadingButton(state) {
  if (state) {
    return;
  }
  if (!state) {
    document.querySelector(".custom-button").removeAttribute("disabled");
    document.querySelector(".custom-button").innerHTML = "Login";
    return;
  }
}
document.querySelector(".custom-button").addEventListener("click", (e) => {
  localStorage.setItem("loginEmail", document.getElementById("email").value);
});
window.onload = () => {
  let emailItem = localStorage.getItem("loginEmail");
  if (emailItem) {
    document.getElementById("email").value = emailItem;
    return;
  }
};*/