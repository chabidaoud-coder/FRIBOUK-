

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://fribouk-api.chabidaoud.workers.dev/chat";

  // Bouton Commencer
  const boutonCommencer = document.getElementById("commencer");

  if (boutonCommencer) {
    boutonCommencer.addEventListener("click", () => {
      let message = document.getElementById("message-fribouk");

      if (!message) {
        message = document.createElement("p");
        message.id = "message-fribouk";
        message.textContent =
          "Bienvenue sur FRIBOUK ! Votre espace est prêt.";

        boutonCommencer.insertAdjacentElement("afterend", message);
      }
    });
  }

  // Ouvrir les outils FRIBOUK
  document.addEventListener("click", (event) => {
    const outil = event.target.closest(".outil");

    if (!outil) return;

    const nom = outil.textContent.trim();

    if (nom === "IA Chat") {
      let zone = document.getElementById("zone-chat");

      if (!zone) {
        zone = document.createElement("section");
        zone.id = "zone-chat";

        zone.innerHTML = `
          <h3>FRIBOUK IA Chat</h3>
          <p>Bienvenue dans votre espace de discussion.</p>

          <div
            id="historique-chat"
            aria-live="polite"
          ></div>

          <label for="question-chat">
            Écris ta question :
          </label>

          <textarea
            id="question-chat"
            placeholder="Écris ta question ici..."
            rows="4"
          ></textarea>

          <button id="envoyer-chat" type="button">
            Envoyer
          </button>

          <p id="reponse-chat" role="status"></p>
        `;

        outil.insertAdjacentElement("afterend", zone);
      }

      zone.scrollIntoView({ behavior: "smooth" });
      document.getElementById("question-chat").focus();

    } else {
      alert(nom + " : cet outil sera bientôt disponible !");
    }
  });

  // Envoyer une question à l'intelligence artificielle
  document.addEventListener("click", async (event) => {
    if (event.target.id !== "envoyer-chat") return;

    const champ = document.getElementById("question-chat");
    const bouton = document.getElementById("envoyer-chat");
    const reponse = document.getElementById("reponse-chat");
    const historique = document.getElementById("historique-chat");

    if (!champ || !bouton || !reponse || !historique) return;

    const question = champ.value.trim();

    if (!question) {
      reponse.textContent = "Écris d'abord une question.";
      champ.focus();
      return;
    }

    bouton.disabled = true;
    reponse.textContent = "FRIBOUK réfléchit...";

    const messageUtilisateur = document.createElement("p");
    messageUtilisateur.textContent = "Vous : " + question;
    historique.appendChild(messageUtilisateur);

    try {
      const resultat = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: question
        })
      });

      const donnees = await resultat.json();

      if (!resultat.ok) {
        throw new Error(
          donnees.error || donnees.message ||
          "Erreur du serveur (" + resultat.status + ")"
        );
      }

      const texte =
        donnees.reply ||
        donnees.response ||
        donnees.answer ||
        donnees.output_text;

      if (!texte) {
        throw new Error(
          "Le serveur n'a pas renvoyé de réponse exploitable."
        );
      }

      const messageIA = document.createElement("p");
      messageIA.textContent = "FRIBOUK : " + texte;
      historique.appendChild(messageIA);

      champ.value = "";
      reponse.textContent = "Réponse reçue.";

    } catch (erreur) {
      reponse.textContent =
        "Impossible d'obtenir une réponse : " + erreur.message;

    } finally {
      bouton.disabled = false;
    }
  });
});
