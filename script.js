
document.addEventListener("DOMContentLoaded", () => {
  // Bouton Commencer
  const commencer = document.getElementById("commencer");

  if (commencer) {
    commencer.addEventListener("click", () => {
      let message = document.getElementById("message-fribouk");

      if (!message) {
        message = document.createElement("p");
        message.id = "message-fribouk";
        message.textContent =
          "Bienvenue sur FRIBOUK ! Votre espace est prêt.";
        commencer.insertAdjacentElement("afterend", message);
      }
    });
  }

  // Ouvrir la zone IA Chat déjà présente dans index.html
  document.addEventListener("click", (event) => {
    const outil = event.target.closest(".outil");
    if (!outil) return;

    const nom = outil.textContent.trim();

    if (nom === "IA Chat") {
      const zone = document.getElementById("zone-chat");

      if (!zone) {
        alert("Zone de chat introuvable. Vérifions index.html.");
        return;
      }

      zone.style.display = "block";
      zone.hidden = false;
      zone.scrollIntoView({ behavior: "smooth", block: "start" });

    } else {
      alert(nom + " sera bientôt disponible !");
    }
  });

  // Envoyer un message : connexion IA à vérifier ensuite
  document.addEventListener("click", async (event) => {
    if (event.target.id !== "envoyer-chat") return;

    const saisie =
      document.getElementById("saisie-chat") ||
      document.getElementById("question-chat");

    const messages =
      document.getElementById("messages-chat") ||
      document.getElementById("historique-chat");

    const statut = document.getElementById("reponse-chat");

    if (!saisie || !messages) {
      alert("Le champ de message est introuvable dans index.html.");
      return;
    }

    const question = saisie.value.trim();
    if (!question) {
      saisie.focus();
      if (statut) statut.textContent = "Écris d'abord une question.";
      return;
    }

    const ligne = document.createElement("p");
    ligne.textContent = "Vous : " + question;
    messages.appendChild(ligne);

    if (statut) {
      statut.textContent =
        "Le message est affiché. La connexion à l'IA reste à vérifier.";
    }

    saisie.value = "";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Bouton Commencer
  const commencer = document.getElementById("commencer");

  if (commencer) {
    commencer.addEventListener("click", () => {
      let message = document.getElementById("message-fribouk");

      if (!message) {
        message = document.createElement("p");
        message.id = "message-fribouk";
        message.textContent =
          "Bienvenue sur FRIBOUK ! Votre espace est prêt.";
        commencer.insertAdjacentElement("afterend", message);
      }
    });
  }

  // Ouvrir la zone IA Chat déjà présente dans index.html
  document.addEventListener("click", (event) => {
    const outil = event.target.closest(".outil");
    if (!outil) return;

    const nom = outil.textContent.trim();

    if (nom === "IA Chat") {
      const zone = document.getElementById("zone-chat");

      if (!zone) {
        alert("Zone de chat introuvable. Vérifions index.html.");
        return;
      }

      zone.style.display = "block";
      zone.hidden = false;
      zone.scrollIntoView({ behavior: "smooth", block: "start" });

    } else {
      alert(nom + " sera bientôt disponible !");
    }
  });

  // Envoyer un message : connexion IA à vérifier ensuite
  document.addEventListener("click", async (event) => {
    if (event.target.id !== "envoyer-chat") return;

    const saisie =
      document.getElementById("saisie-chat") ||
      document.getElementById("question-chat");

    const messages =
      document.getElementById("messages-chat") ||
      document.getElementById("historique-chat");

    const statut = document.getElementById("reponse-chat");

    if (!saisie || !messages) {
      alert("Le champ de message est introuvable dans index.html.");
      return;
    }

    const question = saisie.value.trim();
    if (!question) {
      saisie.focus();
      if (statut) statut.textContent = "Écris d'abord une question.";
      return;
    }

    const ligne = document.createElement("p");
    ligne.textContent = "Vous : " + question;
    messages.appendChild(ligne);

    if (statut) {
      statut.textContent =
        "Le message est affiché. La connexion à l'IA reste à vérifier.";
    }

    saisie.value = "";
  });
});
                               
