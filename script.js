
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
  
const boutonOublie = document.getElementById("mot-de-passe-oublie");
const messageReset = document.getElementById("message-reinitialisation");

if (boutonOublie) {
  boutonOublie.addEventListener("click", async function () {
    const email = document.getElementById("email").value.trim();

    if (!email) {
      if (messageReset) {
        messageReset.textContent = "Entre d'abord ton adresse e-mail.";
      }
      return;
    }

    if (messageReset) {
      messageReset.textContent = "Envoi du lien en cours...";
    }

    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: "https://chabidaoud-coder.github.io/FRIBOUK-/"
    });

    if (messageReset) {
      messageReset.textContent = error
        ? "Erreur : " + error.message
        : "Consulte ta boîte e-mail pour réinitialiser ton mot de passe.";
    }
  });
}
  
});
  
function initialiserBoutique() {
  const voirProduits = document.getElementById("voir-produits");
  const ouvrirBoutique = document.getElementById("ouvrir-boutique");
  const listeProduits = document.getElementById("liste-produits");
  const formulaireBoutique = document.getElementById("formulaire-boutique");
  const enregistrerBoutique = document.getElementById("enregistrer-boutique");
  const messageBoutique = document.getElementById("message-boutique");

  if (voirProduits && listeProduits) {
    voirProduits.addEventListener("click", function () {
      listeProduits.hidden = !listeProduits.hidden;
    });
  }

  if (ouvrirBoutique && formulaireBoutique) {
    ouvrirBoutique.addEventListener("click", function () {
      formulaireBoutique.hidden = !formulaireBoutique.hidden;
    });
  }

  
if (enregistrerBoutique) {
  enregistrerBoutique.addEventListener("click", async function () {
    const nom = document.getElementById("nom-boutique").value.trim();
  const description = document.getElementById("description-boutique").value.trim();

    if (!nom) {
      messageBoutique.textContent = "Entre le nom de ta boutique.";
      return;
    }

    if (!window.supabase) {
      messageBoutique.textContent = "Supabase ne se charge pas.";
      return;
    }

    const { data: { user }, error: erreurConnexion } =
      await sb.auth.getUser();

    if (erreurConnexion || !user) {
      messageBoutique.textContent =
        "Connecte-toi à FRIBOUK avant d'enregistrer ta boutique.";
      return;
    }

    messageBoutique.textContent = "Enregistrement en cours...";

    const { error } = await sb
      .from("boutiques")
      .insert({
        proprietaire: user.id,
        nom: nom,
        description: description
      });

    if (error) {
      messageBoutique.textContent =
        "Erreur d'enregistrement : " + error.message;
      return;
    }

    messageBoutique.textContent =
      "Boutique « " + nom + " » enregistrée avec succès !";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiserBoutique);
} else {
  initialiserBoutique();
}
