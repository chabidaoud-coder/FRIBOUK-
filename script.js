
/* FRIBOUK — Chat, connexion et boutiques */

const FRIBOUK_URL = "https://rocvbxvxcxisyejrwzzx.supabase.co";
const FRIBOUK_KEY = "sb_publishable_0KUOpiRmTZ4SpQQIS-5iZw_K6fOyWOh";

document.addEventListener("DOMContentLoaded", function () {

  /* 1. CHAT */
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

  /* 2. CONNEXION SUPABASE */
  if (!window.supabase) {
    console.error("La bibliothèque Supabase ne se charge pas.");
    return;
  }

  const sb = window.supabase.createClient(
    FRIBOUK_URL,
    FRIBOUK_KEY
  );

  const form = document.getElementById("form-connexion");
  const boutonInscription = document.getElementById("inscription");
  const messageConnexion = document.getElementById("message-connexion");
  
const boutonGoogle = document.getElementById("connexion-google");

if (boutonGoogle) {
  boutonGoogle.addEventListener("click", async function () {
    afficherConnexion("Ouverture de la connexion Google...");

    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://chabidao.github.io/FRIBOUK/"
      }
    });

    if (error) {
      afficherConnexion("Erreur Google : " + error.message);
    }
  });
}
  

  function afficherConnexion(texte) {
    if (messageConnexion) messageConnexion.textContent = texte;
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("mot-de-passe").value;

      afficherConnexion("Connexion en cours...");

      const { error } = await sb.auth.signInWithPassword({
        email: email,
        password: password
      });

      afficherConnexion(
        error ? "Erreur : " + error.message : "Connexion réussie !"
      );
    });
  }

  if (boutonInscription) {
    boutonInscription.addEventListener("click", async function () {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("mot-de-passe").value;

      if (!email || !password) {
        afficherConnexion("Entre ton e-mail et ton mot de passe.");
        return;
      }

      if (password.length < 6) {
        afficherConnexion("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      afficherConnexion("Création du compte...");

      const { data, error } = await sb.auth.signUp({
        email: email,
        password: password
      });

      if (error) {
        afficherConnexion("Erreur : " + error.message);
      } else if (data.session) {
        afficherConnexion("Compte créé et connecté !");
      } else {
        afficherConnexion("Compte créé. Vérifie tes e-mails pour confirmer.");
      }
    });
  }

  /* 3. MOT DE PASSE OUBLIÉ */
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
          : "Consulte ta boîte e-mail pour le lien de réinitialisation.";
      }
    });
  }

  /* 4. BOUTIQUES */
  const voirProduits = document.getElementById("voir-produits");
  const ouvrirBoutique = document.getElementById("ouvrir-boutique");
  const listeProduits = document.getElementById("liste-boutiques");
  const formulaireBoutique = document.getElementById("formulaire-boutique");
  const enregistrerBoutique = document.getElementById("enregistrer-boutique");
  const messageBoutique = document.getElementById("message-boutique");
   async function afficherBoutiques() {
    if (!listeProduits) return;

    listeProduits.innerHTML = "<p>Chargement des boutiques...</p>";

    const { data, error } = await sb
      .from("boutiques")
      .select("nom, description")
      .order("created_at", { ascending: false });

    if (error) {
      listeProduits.innerHTML =
        "<p>Impossible de charger les boutiques.</p>";
      console.error(error.message);
      return;
    }

    if (!data || data.length === 0) {
      listeProduits.innerHTML = "<p>Aucune boutique disponible.</p>";
      return;
    }

    listeProduits.replaceChildren();

    data.forEach(function (boutique) {
      const carte = document.createElement("div");
      const titre = document.createElement("h4");
      const description = document.createElement("p");

      titre.textContent = boutique.nom;
      description.textContent = boutique.description || "Aucune description.";

      carte.appendChild(titre);
      carte.appendChild(description);
      listeProduits.appendChild(carte);
    });
  }

  afficherBoutiques(); 

  /* Charger les boutiques dans le formulaire produit */
  
async function chargerBoutiquesDansListe() {
  const selectBoutique = document.getElementById("boutique-produit");
  const selectAcheteur = document.getElementById("boutique-acheteur");

  if (!selectBoutique && !selectAcheteur) return;

  const { data: resultatUtilisateur } = await sb.auth.getUser();
  const utilisateur = resultatUtilisateur.user;

  if (selectBoutique) {
    selectBoutique.innerHTML =
      '<option value="">Sélectionne une boutique</option>';
  }

  if (selectAcheteur) {
    selectAcheteur.innerHTML =
      '<option value="">Choisir une boutique</option>';
  }

  const { data: boutiques, error } = await sb
  .from("boutiques")
  .select("id, nom")
  .order("nom");

  if (error) {
    console.error("Erreur de chargement des boutiques :", error.message);
    if (selectAcheteur) {
      selectAcheteur.innerHTML =
        '<option value="">Impossible de charger les boutiques</option>';
    }
    return;
  }

  (boutiques || []).forEach(function (boutique) {
    if (selectAcheteur) {
      const optionAcheteur = document.createElement("option");
      optionAcheteur.value = boutique.id;
      optionAcheteur.textContent = boutique.nom;
      selectAcheteur.appendChild(optionAcheteur);
    }

    if (selectBoutique && utilisateur &&
        boutique.proprietaire === utilisateur.id) {
      const optionProduit = document.createElement("option");
      optionProduit.value = boutique.id;
      optionProduit.textContent = boutique.nom;
      selectBoutique.appendChild(optionProduit);
    }
  });
}
  
  if (ouvrirBoutique && formulaireBoutique) {
    ouvrirBoutique.addEventListener("click", function () {
      formulaireBoutique.hidden = !formulaireBoutique.hidden;
    });
  }
  
const listeProduitsAffiches =
  document.getElementById("liste-produits-affiches");

if (voirProduits && listeProduitsAffiches) {
  voirProduits.addEventListener("click", async function () {
    listeProduitsAffiches.hidden = false;
    listeProduitsAffiches.innerHTML =
      "<h3>Produits disponibles</h3><p>Chargement...</p>";

    try {
      const boutiqueId = document.getElementById("boutique-acheteur").value;

if (!boutiqueId) {
  alert("Choisis d'abord une boutique.");
  return;
}

const { data, error } = await sb
  .from("produits")
  .select("id, nom, description, prix, photo_url")
  .eq("boutique_id", boutiqueId)
  .order("created_at", { ascending: false });

      if (error) throw error;

      listeProduitsAffiches.innerHTML =
        "<h3>Produits disponibles</h3>";

      if (!data || data.length === 0) {
        listeProduitsAffiches.innerHTML +=
          "<p>Aucun produit enregistré pour le moment.</p>";
        return;
      }

      data.forEach(function (produit) {
        const carte = document.createElement("div");
        const nom = document.createElement("h4");
        const prix = document.createElement("p");
        const description = document.createElement("p");
        const boutonModifier = document.createElement("button");
        const boutonSupprimer = document.createElement("button");

        if (produit.photo_url) {
          const image = document.createElement("img");
          image.src = produit.photo_url;
          image.alt = produit.nom;
          image.style.width = "100%";
          image.style.maxWidth = "300px";
          image.style.height = "auto";
          carte.appendChild(image);
        }

        nom.textContent = produit.nom;
        prix.textContent = "Prix : " + produit.prix + " FCFA";
        description.textContent = produit.description || "";
        boutonModifier.textContent = "Modifier";
        boutonSupprimer.textContent = "Supprimer";

        carte.append(nom, prix, description);
        carte.append(boutonModifier, boutonSupprimer);
        listeProduitsAffiches.appendChild(carte);

        boutonModifier.addEventListener("click", async function () {
          const nouveauNom = prompt("Nouveau nom :", produit.nom);
          if (nouveauNom === null) return;

          const nouveauPrixTexte = prompt(
            "Nouveau prix en FCFA :", produit.prix
          );
          if (nouveauPrixTexte === null) return;

          const nouveauPrix = Number(nouveauPrixTexte);
          if (!nouveauNom.trim() ||
              nouveauPrixTexte.trim() === "" ||
              !Number.isFinite(nouveauPrix) ||
              nouveauPrix < 0) {
            alert("Entre un nom et un prix valides.");
            return;
          }

          const nouvelleDescription = prompt(
            "Nouvelle description :", produit.description || ""
          );
          if (nouvelleDescription === null) return;

          const { data: utilisateur } = await sb.auth.getUser();
          if (!utilisateur.user) {
            alert("Connecte-toi avant de modifier un produit.");
            return;
          }

          const { error } = await sb
            .from("produits")
            .update({
              nom: nouveauNom.trim(),
              prix: nouveauPrix,
              description: nouvelleDescription.trim()
            })
            .eq("id", produit.id);

          if (error) {
            alert("Erreur de modification : " + error.message);
            return;
          }

          alert("Produit modifié avec succès !");
          voirProduits.click();
        });

        boutonSupprimer.addEventListener("click", async function () {
          if (!confirm("Veux-tu vraiment supprimer ce produit ?")) return;

          const { data: utilisateur } = await sb.auth.getUser();
          if (!utilisateur.user) {
            alert("Connecte-toi avant de supprimer un produit.");
            return;
          }

          const { error } = await sb
            .from("produits")
            .delete()
            .eq("id", produit.id);

          if (error) {
            alert("Erreur de suppression : " + error.message);
            return;
          }

          carte.remove();
          alert("Produit supprimé avec succès !");
        });
      });
    } catch (erreur) {
      listeProduitsAffiches.innerHTML =
        "<p>Erreur : " + erreur.message + "</p>";
    }
  });
          }
          
  if (enregistrerBoutique) {
    enregistrerBoutique.addEventListener("click", async function () {
      const champNom = document.getElementById("nom-boutique");
      const champDescription = document.getElementById("description-boutique");

      const nom = champNom ? champNom.value.trim() : "";
      const description = champDescription ? champDescription.value.trim() : "";

      if (!messageBoutique) return;

      if (!nom) {
        messageBoutique.textContent = "Entre le nom de ta boutique.";
        return;
      }

      messageBoutique.textContent = "Vérification de la connexion...";

      try {
        const { data, error: erreurConnexion } = await sb.auth.getUser();

        if (erreurConnexion || !data.user) {
          messageBoutique.textContent =
            "Connecte-toi à FRIBOUK avant d'enregistrer ta boutique.";
          return;
        }

        messageBoutique.textContent = "Enregistrement en cours...";

        const { error } = await sb
          .from("boutiques")
          .insert({
            proprietaire: data.user.id,
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

      } catch (erreur) {
        messageBoutique.textContent =
          "Erreur inattendue : " + erreur.message;
      }
    });
  }
  const boutonAfficherProduit = document.getElementById("afficher-formulaire-produit");
  const formulaireProduit = document.getElementById("formulaire-produit");

  if (boutonAfficherProduit && formulaireProduit) {
    boutonAfficherProduit.addEventListener("click", function () {
      formulaireProduit.hidden = !formulaireProduit.hidden;
    });
  }
  /* ENREGISTRER UN PRODUIT DANS SUPABASE */
  const boutonEnregistrerProduit =
  document.getElementById("enregistrer-produit");
  const messageProduit = document.getElementById("message-produit");

  if (boutonEnregistrerProduit) {
    boutonEnregistrerProduit.addEventListener("click", async function () {
      const nom = document.getElementById("nom-produit").value.trim();
      const photo = document.getElementById("photo-produit").files[0];
      const prixTexte = document.getElementById("prix-produit").value;
      const prix = Number(prixTexte);
      const description = document.getElementById("description-produit").value.trim();
      const boutiqueId = document.getElementById("boutique-produit").value.trim();

      if (!messageProduit) return;

      if (!nom || prixTexte === "" || !Number.isFinite(prix) || prix < 0 || !boutiqueId) {
        messageProduit.textContent = "Remplis le nom, le prix et l'identifiant de la boutique.";
        return;
      }

      messageProduit.textContent = "Enregistrement en cours...";

      try {
        const { data: { user }, error: erreurConnexion } = await sb.auth.getUser();

        if (erreurConnexion || !user) {
          messageProduit.textContent = "Connecte-toi avant d'ajouter un produit.";
          return;
        }        
let photoUrl = null;

if (photo) {
  if (!photo.type.startsWith("image/")) {
    messageProduit.textContent = "Choisis un fichier image.";
    return;
  }

  if (photo.size > 2 * 1024 * 1024) {
    messageProduit.textContent = "La photo ne doit pas dépasser 2 Mo.";
    return;
  }

  const extension = photo.name.split(".").pop().toLowerCase();
  const cheminPhoto = user.id + "/" + Date.now() + "." + extension;

  const { error: erreurPhoto } = await sb.storage
    .from("Produits-photo")
    .upload(cheminPhoto, photo);

  if (erreurPhoto) {
    messageProduit.textContent = "Erreur photo : " + erreurPhoto.message;
    return;
  }

  const { data: urlPhoto } = sb.storage
    .from("Produits-photo")
    .getPublicUrl(cheminPhoto);

  photoUrl = urlPhoto.publicUrl;
}
        

        const { error } = await sb.from("produits").insert({
          boutique_id: boutiqueId,
          proprietaire: user.id,
          nom: nom,
          description: description,
          prix: prix,
          photo_url: photoUrl
        });

        if (error) {
          messageProduit.textContent = "Erreur Supabase : " + error.message;
          return;
        }

        messageProduit.textContent = "Produit enregistré avec succès !";
        document.getElementById("nom-produit").value = "";
        document.getElementById("prix-produit").value = "";
        document.getElementById("description-produit").value = "";
      } catch (erreur) {
        messageProduit.textContent = "Erreur : " + erreur.message;
      }
    });
  }
          
});
