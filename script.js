
document.addEventListener("DOMContentLoaded", function () {
  const boutons = document.querySelectorAll(".outil");
  const chat = document.getElementById("zone-chat");
  const fermer = document.getElementById("fermer-chat");

  boutons.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      if (bouton.textContent.trim() === "IA Chat") {
        if (chat) {
          chat.style.display = "block";
          chat.scrollIntoView({ behavior: "smooth" });
        } else {
          alert("La zone du chat est introuvable.");
        }
      } else {
        alert(bouton.textContent.trim() + " sera bientôt disponible.");
      }
    });
  });

  if (fermer && chat) {
    fermer.addEventListener("click", function () {
      chat.style.display = "none";
    });
  }
});
