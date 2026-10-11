
document.addEventListener("DOMContentLoaded", () => {
  const bouton = document.getElementById("commencer");

  if (bouton) {
    bouton.addEventListener("click", () => {
      let message = document.getElementById("message-fribouk");

      if (!message) {
        message = document.createElement("p");
        message.id = "message-fribouk";
        message.textContent =
          "Bienvenue sur FRIBOUK ! Votre espace est prêt.";
        bouton.insertAdjacentElement("afterend", message);
      }
    });
  }

  document.addEventListener("click", (event) => {
    const outil = event.target.closest(".outil");
    if (!outil) return;

    const nom = outil.textContent.trim();

    if (nom === "IA Chat") {
      let zone = document.getElementById("zone-chat");

      if (!zone) {
        zone = document.createElement("div");
        zone.id = "zone-chat";
        zone.innerHTML = `
          <h3>FRIBOUK IA Chat</h3>
          <p>Bienvenue dans votre espace de discussion.</p>
          <textarea id="question-chat"
            placeholder="Écris ta question ici"></textarea>
          <p id="reponse-chat">
            Le chat est affiché. La connexion à une IA
            sera nécessaire pour obtenir de vraies réponses.
          </p>
        `;
        outil.insertAdjacentElement("afterend", zone);
      }

      zone.scrollIntoView({ behavior: "smooth" });
    } else {
      alert(nom + " : cet outil sera bientôt disponible !");
    }
  });
});
