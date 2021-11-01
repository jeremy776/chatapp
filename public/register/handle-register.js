document.querySelector(".new").addEventListener("submit", (e) => {
  e.preventDefault();
  let email = document.querySelector("#email").value;
  let username = document.querySelector("#username").value;
  let password = document.querySelector("#password").value;
  let confrimpass = document.querySelector("#password2").value;
  
  if(password !== confrimpass) {
    
  }
});