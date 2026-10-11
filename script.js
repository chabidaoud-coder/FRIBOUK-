
document.addEventListener("DOMContentLoaded", function () {
  const boutons = document.querySelectorAll(".outil");
  const chat = document.getElementById("zone-chat");
  const fermer = document.getElementById("fermer-chat");
  const envoyer = document.getElementById("envoyer-chat");
  const saisie = document.getElementById("saisie-chat");
  const messages = document.getElementById("messages-chat");

  // Ouvrir les outils
  boutons.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      const nom = bouton.textContent.trim();

      if (nom === "IA Chat") {
        if (chat) {
          chat.style.display = "block";
          chat.scrollIntoView({ behavior: "smooth" });
          saisie.focus();
        }
      } else {
        alert(nom + " sera bientôt disponible.");
      }
    });
  });

  // Fermer le chat
  if (fermer && chat) {
    fermer.addEventListener("click", function () {
      chat.style.display = "none";
    });
  }

  // Envoyer un message
  if (envoyer && saisie && messages) {
    envoyer.addEventListener("click", function () {
      const question = saisie.value.trim();

      if (question === "") {
        alert("Écris d'abord un message.");
        saisie.focus();
        return;
      }

      const message = document.createElement("p");
      message.textContent = "Vous : " + question;
      messages.appendChild(message);

      saisie.value = "";
      saisie.focus();
    });
  }
});
      
