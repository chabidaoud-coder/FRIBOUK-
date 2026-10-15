
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

/* CONNEXION FRIBOUK */
const FRIBOUK_URL = "https://rocvbxvxcxisyejrwzzx.supabase.co";
const FRIBOUK_KEY = "sb_publishable_0KUOpiRmTZ4SpQQIS-5iZw_K6fOyWOh";

document.addEventListener("DOMContentLoaded", function () {
  if (!window.supabase) {
    alert("La bibliothèque Supabase ne se charge pas.");
    return;
  }

  const sb = window.supabase.createClient(
    FRIBOUK_URL,
    FRIBOUK_KEY
  );

  const form = document.getElementById("form-connexion");
  const bouton = document.getElementById("inscription");
  const message = document.getElementById("message-connexion");

  function afficher(texte) {
    if (message) message.textContent = texte;
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("mot-de-passe").value;

      afficher("Connexion en cours...");

      const { error } = await sb.auth.signInWithPassword({
        email,
        password
      });

      afficher(error ? "Erreur : " + error.message : "Connexion réussie !");
    });
  }

  if (bouton) {
    bouton.addEventListener("click", async function () {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("mot-de-passe").value;

      if (!email || !password) {
        afficher("Entre ton e-mail et ton mot de passe.");
        return;
      }

      if (password.length < 6) {
        afficher("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      afficher("Création du compte...");

      const { data, error } = await sb.auth.signUp({
        email,
        password
      });

      if (error) {
        afficher("Erreur : " + error.message);
      } else if (data.session) {
        afficher("Compte créé et connecté !");
      } else {
        afficher("Compte créé. Vérifie tes e-mails pour confirmer.");
      }
    });
  }
});
  
