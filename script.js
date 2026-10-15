
document.addEventListener("DOMContentLoaded", function () {
  const chat = document.getElementById("zone-chat");
  const saisie = document.getElementById("saisie-chat");
  const messages = document.getElementById("messages-chat");
  const envoyer = document.getElementById("envoyer-chat");
  const fermer = document.getElementById("fermer-chat");

  document.querySelectorAll(".outil").forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      if (bouton.textContent.trim() === "IA Chat" && chat) {
        chat.style.display = "block";
        chat.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  if (fermer && chat) {
    fermer.addEventListener("click", function () {
      chat.style.display = "none";
    });
  }

  if (envoyer && saisie && messages) {
    envoyer.addEventListener("click", function () {
      const question = saisie.value.trim();

      if (!question) {
        alert("Écris d'abord un message.");
        return;
      }

      const ligne = document.createElement("p");
      ligne.textContent = "Vous : " + question;
      messages.appendChild(ligne);

      saisie.value = "";
    });
  }
});

/* FRIBOUK - Connexion Supabase */

const FRIBOUK_URL = "const FRIBOUK_KEY = "sb_publishable_0KUOpiRmTZ4SpQQIS-5iZw_K6fOyWOh";
const FRIBOUK_KEY = "https://rocvbxvxcxisyejrwzzx.supabase.co";

const sb = window.supabase.createClient(
  FRIBOUK_URL,
  FRIBOUK_KEY
);

const form = document.getElementById("form-connexion");
const inscription = document.getElementById("inscription");
const message = document.getElementById("message-connexion");

function afficherMessage(texte) {
  message.textContent = texte;
}

// Connexion
form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("mot-de-passe").value;

  afficherMessage("Connexion en cours...");

  const { data, error } = await sb.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    afficherMessage("Erreur : " + error.message);
    return;
  }

  afficherMessage("Connexion réussie à FRIBOUK !");
});

// Inscription
inscription.addEventListener("click", async function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("mot-de-passe").value;

  if (!email || !password) {
    afficherMessage("Entre ton e-mail et ton mot de passe.");
    return;
  }

  if (password.length < 6) {
    afficherMessage("Le mot de passe doit contenir au moins 6 caractères.");
    return;
  }

  afficherMessage("Création du compte...");

  const { data, error } = await sb.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    afficherMessage("Erreur : " + error.message);
    return;
  }

  afficherMessage(
    data.session
      ? "Compte créé et connexion réussie !"
      : "Compte créé. Vérifie tes e-mails pour confirmer."
  );
});
  
