window.onload = () => {
  document.getElementById("guilds").style.display = "none";
};
function changeChats(el) {
  if (el.classList != "active") {
    if (el.previousElementSibling) {
      document.getElementById('dm').style.display = "none";
      document.getElementById('guilds').style.display = "block";
      el.previousElementSibling.classList.toggle("active", false);
      el.classList.toggle("active");
    } else {
      document.getElementById('guilds').style.display = "none";
      document.getElementById('dm').style.display = "block";
      el.nextElementSibling.classList.toggle("active", false);
      el.classList.toggle("active");
    }
  }
}