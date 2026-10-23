/* FRIBOUK — script.js (v1) */

const FRIBOUK_URL = "https://rocvbxvxcxisyejrwzzx.supabase.co";
const FRIBOUK_KEY = "sb_publishable_0KUOpiRmTZ4SpQQIS-5iZw_K6fOyWOh";
const SITE_URL = location.origin + location.pathname; // adresse réelle de votre site
const BUCKET_PHOTOS = "Produits-photo";

const sb = window.supabase.createClient(FRIBOUK_URL, FRIBOUK_KEY);

/* ---------- Outils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function h(tag, props, ...enfants) {
  const e = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v);
  });
  enfants.flat().forEach((c) => e.append(c instanceof Node ? c : String(c ?? "")));
  return e;
}

function vider(el) { el.replaceChildren(); }
function fcfa(n) { return Number(n || 0).toLocaleString("fr-FR") + " FCFA"; }
function dateFr(d) { return new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }); }

let toastTimer;
function toast(texte, erreur) {
  const t = $("#toast");
  t.textContent = texte;
  t.className = "toast" + (erreur ? " erreur" : "");
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
}

function dire(sel, texte, erreur) {
  const el = $(sel);
  if (!el) return;
  el.textContent = texte || "";
  el.classList.toggle("erreur", !!erreur);
}

async function copier(texte) {
  try { await navigator.clipboard.writeText(texte); toast("Copié !"); }
  catch (e) { toast("Copie impossible sur cet appareil.", true); }
}

function occupe(bouton, etat, libelle) {
  if (!bouton) return;
  if (etat) { bouton.dataset.libelle = bouton.textContent; bouton.disabled = true; if (libelle) bouton.textContent = libelle; }
  else { bouton.disabled = false; if (bouton.dataset.libelle) bouton.textContent = bouton.dataset.libelle; }
}

/* ---------- État ---------- */
let utilisateur = null;
let profil = null;
let conversationId = null;
let modeInscription = false;
let panier = {};
try { panier = JSON.parse(localStorage.getItem("fribouk_panier") || "{}"); } catch (e) { panier = {}; }

const VUES_PRIVEES = ["tableau", "chat", "texte", "creations", "boutiques", "commandes"];

/* ---------- Navigation ---------- */
function ouvrirVue(nom) {
  if (VUES_PRIVEES.includes(nom) && !utilisateur) {
    toast("Connectez-vous pour accéder à cet espace.", true);
    nom = "auth";
  }
  $$(".vue").forEach((v) => { v.hidden = v.id !== "vue-" + nom; });
  $$(".navigation button").forEach((b) => b.classList.toggle("actif", b.dataset.vue === nom));
  window.scrollTo({ top: 0 });

  const chargeurs = {
    tableau: majTableau, chat: chargerConversations, creations: chargerCreations,
    boutiques: chargerBoutiquesVendeur, barka: chargerCatalogue, herboriste: chargerHerboriste,
    panier: afficherPanier, commandes: chargerCommandes
  };
  if (chargeurs[nom]) chargeurs[nom]();
}

document.addEventListener("click", (e) => {
  const cible = e.target.closest("[data-vue]");
  if (cible) ouvrirVue(cible.dataset.vue);
});

/* ---------- Profil et crédits ---------- */
async function chargerProfil() {
  if (!utilisateur) { profil = null; majEntete(); return; }
  const { data: solde } = await sb.rpc("mon_solde");
  const { data } = await sb.from("profiles").select("nom, role, plan, credits").eq("id", utilisateur.id).maybeSingle();
  profil = data ? { ...data, credits: solde ?? data.credits } : null;
  majEntete();
}

function majEntete() {
  const connecte = !!utilisateur;
  $("#btn-auth").textContent = connecte ? "Mon compte" : "Se connecter";
  $("#btn-auth").dataset.vue = connecte ? "tableau" : "auth";
  $("#btn-credits").hidden = !connecte;
  $("#credits-entete").textContent = profil ? profil.credits : 0;
}

function majTableau() {
  if (!profil) return;
  $("#nom-utilisateur").textContent = profil.nom || (utilisateur.email || "").split("@")[0];
  $("#credits").textContent = profil.credits;
  $("#plan-utilisateur").textContent = profil.plan;
  $("#role-utilisateur").textContent = profil.role;
}

/* ---------- Connexion ---------- */
function basculerModeAuth(inscription) {
  modeInscription = inscription;
  $("#titre-auth").textContent = inscription ? "Créer un compte" : "Connexion";
  $("#btn-valider-auth").textContent = inscription ? "Créer mon compte" : "Se connecter";
  $("#bascule-auth").textContent = inscription ? "Déjà un compte ? Se connecter" : "Pas de compte ? Créer un compte";
  $("#champ-nom").hidden = !inscription;
  $("#mot-de-passe").autocomplete = inscription ? "new-password" : "current-password";
  dire("#message-connexion", "");
}
$("#bascule-auth").addEventListener("click", () => basculerModeAuth(!modeInscription));
$("#btn-commencer").addEventListener("click", () => { basculerModeAuth(true); ouvrirVue(utilisateur ? "chat" : "auth"); });

$("#form-connexion").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const mdp = $("#mot-de-passe").value;
  const bouton = $("#btn-valider-auth");

  if (mdp.length < 6) { dire("#message-connexion", "Le mot de passe doit contenir au moins 6 caractères.", true); return; }
  occupe(bouton, true, "Patientez…");

  if (modeInscription) {
    const nom = $("#nom").value.trim();
    const { data, error } = await sb.auth.signUp({
      email, password: mdp,
      options: { data: { nom }, emailRedirectTo: SITE_URL }
    });
    if (error) dire("#message-connexion", "Erreur : " + error.message, true);
    else if (data.session) { dire("#message-connexion", "Compte créé !"); ouvrirVue("tableau"); }
    else dire("#message-connexion", "Compte créé. Ouvrez le lien reçu par e-mail pour confirmer.");
  } else {
    const { error } = await sb.auth.signInWithPassword({ email, password: mdp });
    if (error) dire("#message-connexion", "Erreur : " + error.message, true);
    else { dire("#message-connexion", ""); ouvrirVue("tableau"); }
  }
  occupe(bouton, false);
});

$("#connexion-google").addEventListener("click", async () => {
  dire("#message-connexion", "Ouverture de Google…");
  const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: SITE_URL } });
  if (error) dire("#message-connexion", "Erreur Google : " + error.message, true);
});

$("#mot-de-passe-oublie").addEventListener("click", async () => {
  const email = $("#email").value.trim();
  if (!email) { dire("#message-connexion", "Entrez d'abord votre adresse e-mail.", true); return; }
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL });
  if (error) dire("#message-connexion", "Erreur : " + error.message, true);
  else dire("#message-connexion", "Consultez votre boîte e-mail pour le lien de réinitialisation.");
});

$("#valider-nouveau-mdp").addEventListener("click", async () => {
  const mdp = $("#nouveau-mdp").value;
  if (mdp.length < 6) { toast("6 caractères minimum.", true); return; }
  const { error } = await sb.auth.updateUser({ password: mdp });
  if (error) toast("Erreur : " + error.message, true);
  else { toast("Mot de passe modifié."); $("#bloc-nouveau-mdp").hidden = true; ouvrirVue("tableau"); }
});

$("#btn-deconnexion").addEventListener("click", async () => {
  await sb.auth.signOut();
  toast("Vous êtes déconnecté.");
  ouvrirVue("accueil");
});

sb.auth.onAuthStateChange((evenement, session) => {
  utilisateur = session ? session.user : null;
  // setTimeout évite un blocage connu quand on appelle Supabase dans ce rappel
  setTimeout(async () => {
    await chargerProfil();
    if (evenement === "PASSWORD_RECOVERY") {
      ouvrirVue("auth");
      $("#bloc-nouveau-mdp").hidden = false;
    }
    if (evenement === "SIGNED_OUT") { conversationId = null; }
  }, 0);
});

/* ---------- IA : appel sécurisé via la fonction Supabase ---------- */
async function appelerIA(corps) {
  const { data, error } = await sb.functions.invoke("hyper-processor",({ body: corps });
  if (error) {
    let message = error.message;
    try { const j = await error.context.json(); if (j && j.erreur) message = j.erreur; } catch (e) { /* ignore */ }
    throw new Error(message);
  }
  if (data && typeof data.credits === "number" && profil) {
    profil.credits = data.credits;
    majEntete();
  }
  return data;
}

/* ---------- Chat ---------- */
function ajouterBulle(role, texte) {
  const zone = $("#messages-chat");
  const vide = $(".vide", zone);
  if (vide) vide.remove();
  const bulle = h("div", { class: "bulle " + (role === "user" ? "moi" : "ia") }, texte);
  if (role !== "user") bulle.append(h("button", { type: "button", onclick: () => copier(texte) }, "Copier"));
  zone.append(bulle);
  zone.scrollTop = zone.scrollHeight;
  return bulle;
}

async function chargerConversations() {
  const { data } = await sb.from("conversations").select("id, titre, created_at").order("created_at", { ascending: false }).limit(30);
  const liste = $("#liste-conversations");
  vider(liste);
  liste.append(h("option", { value: "" }, "Nouvelle conversation"));
  (data || []).forEach((c) => liste.append(h("option", { value: c.id }, (c.titre || "Sans titre") + " — " + dateFr(c.created_at))));
  liste.value = conversationId || "";
}

async function ouvrirConversation(id) {
  conversationId = id || null;
  const zone = $("#messages-chat");
  vider(zone);
  if (!id) { zone.append(h("p", { class: "vide" }, "Posez votre première question. Chaque réponse coûte 1 crédit.")); return; }
  const { data } = await sb.from("messages").select("role, contenu").eq("conversation_id", id).order("created_at");
  (data || []).forEach((m) => ajouterBulle(m.role, m.contenu));
}

$("#liste-conversations").addEventListener("change", (e) => ouvrirConversation(e.target.value));
$("#nouvelle-conversation").addEventListener("click", () => { conversationId = null; $("#liste-conversations").value = ""; ouvrirConversation(null); });
$("#supprimer-conversation").addEventListener("click", async () => {
  if (!conversationId) return;
  if (!confirm("Supprimer cette conversation ?")) return;
  const { error } = await sb.from("conversations").delete().eq("id", conversationId);
  if (error) { toast("Suppression impossible : " + error.message, true); return; }
  conversationId = null;
  await chargerConversations();
  ouvrirConversation(null);
  toast("Conversation supprimée.");
});

$("#envoyer-chat").addEventListener("click", async () => {
  const champ = $("#saisie-chat");
  const message = champ.value.trim();
  if (!message) { toast("Écrivez d'abord un message.", true); return; }
  const bouton = $("#envoyer-chat");
  occupe(bouton, true, "L'IA réfléchit…");
  ajouterBulle("user", message);
  champ.value = "";
  try {
    const rep = await appelerIA({ mode: "chat", message, conversation_id: conversationId });
    conversationId = rep.conversation_id;
    ajouterBulle("assistant", rep.texte);
    chargerConversations();
  } catch (err) {
    ajouterBulle("assistant", "Erreur : " + err.message);
  }
  occupe(bouton, false);
});

/* ---------- Générateur de textes ---------- */
$("#generer-texte").addEventListener("click", async () => {
  const demande = $("#demande-texte").value.trim();
  if (!demande) { dire("#message-texte", "Décrivez d'abord votre demande.", true); return; }
  const bouton = $("#generer-texte");
  occupe(bouton, true, "Génération…");
  dire("#message-texte", "");
  try {
    const rep = await appelerIA({ mode: "texte", type: $("#type-texte").value, message: demande });
    $("#texte-genere").textContent = rep.texte;
    $("#resultat-texte").hidden = false;
    dire("#message-texte", "Texte enregistré dans « Mes créations ».");
  } catch (err) {
    dire("#message-texte", "Erreur : " + err.message, true);
  }
  occupe(bouton, false);
});
$("#copier-texte").addEventListener("click", () => copier($("#texte-genere").textContent));

/* ---------- Mes créations ---------- */
async function chargerCreations() {
  const zone = $("#liste-creations");
  vider(zone);
  const { data, error } = await sb.from("creations").select("id, type, titre, contenu, cout, created_at").order("created_at", { ascending: false }).limit(50);
  if (error) { zone.append(h("p", { class: "message erreur" }, error.message)); return; }
  if (!data.length) { zone.append(h("p", { class: "vide" }, "Aucune création pour le moment. Générez votre premier texte !")); return; }
  data.forEach((c) => {
    const carte = h("div", { class: "creation" },
      h("h4", {}, c.titre || "Sans titre"),
      h("small", {}, c.type + " · " + c.cout + " crédit(s) · " + dateFr(c.created_at)),
      h("pre", {}, c.contenu || ""),
      h("div", { class: "rangee-boutons" },
        h("button", { class: "bouton bouton-petit", type: "button", onclick: () => copier(c.contenu) }, "Copier"),
        h("button", { class: "bouton bouton-petit bouton-contour", type: "button", onclick: async () => {
          if (!confirm("Supprimer cette création ?")) return;
          const { error: e2 } = await sb.from("creations").delete().eq("id", c.id);
          if (e2) toast(e2.message, true); else { carte.remove(); toast("Supprimée."); }
        } }, "Supprimer")
      ));
    zone.append(carte);
  });
}

/* ---------- Boutiques (vendeur) ---------- */
let mesBoutiques = [];

async function chargerBoutiquesVendeur() {
  const { data, error } = await sb.from("boutiques").select("id, nom, description, categorie, localisation").eq("proprietaire", utilisateur.id).order("created_at", { ascending: false });
  mesBoutiques = error ? [] : data;

  const zone = $("#mes-boutiques");
  vider(zone);
  if (!mesBoutiques.length) zone.append(h("p", { class: "vide" }, "Vous n'avez pas encore de boutique."));
  mesBoutiques.forEach((b) => zone.append(h("div", { class: "ligne-item" },
    h("h4", {}, b.nom),
    h("small", {}, [b.categorie, b.localisation].filter(Boolean).join(" · ")),
    h("p", {}, b.description || ""))));

  const sel = $("#boutique-produit");
  vider(sel);
  sel.append(h("option", { value: "" }, "Choisir une boutique"));
  mesBoutiques.forEach((b) => sel.append(h("option", { value: b.id }, b.nom)));
  chargerMesProduits();
}

$("#ouvrir-boutique").addEventListener("click", () => { const f = $("#formulaire-boutique"); f.hidden = !f.hidden; });

$("#enregistrer-boutique").addEventListener("click", async () => {
  const nom = $("#nom-boutique").value.trim();
  if (!nom) { dire("#message-boutique", "Entrez le nom de votre boutique.", true); return; }
  const bouton = $("#enregistrer-boutique");
  occupe(bouton, true, "Enregistrement…");
  const { error } = await sb.from("boutiques").insert({
    proprietaire: utilisateur.id, nom,
    description: $("#description-boutique").value.trim(),
    categorie: $("#categorie-boutique").value.trim(),
    localisation: $("#localisation-boutique").value.trim()
  });
  occupe(bouton, false);
  if (error) { dire("#message-boutique", "Erreur : " + error.message, true); return; }
  dire("#message-boutique", "Boutique « " + nom + " » enregistrée !");
  ["#nom-boutique", "#description-boutique", "#categorie-boutique", "#localisation-boutique"].forEach((s) => { $(s).value = ""; });
  chargerBoutiquesVendeur();
});

/* ---------- Produits (vendeur) ---------- */
$("#afficher-formulaire-produit").addEventListener("click", () => { const f = $("#formulaire-produit"); f.hidden = !f.hidden; });

$("#enregistrer-produit").addEventListener("click", async () => {
  const boutiqueId = $("#boutique-produit").value;
  const nom = $("#nom-produit").value.trim();
  const prixTexte = $("#prix-produit").value;
  const prix = Number(prixTexte);
  const stock = parseInt($("#stock-produit").value, 10);
  const photo = $("#photo-produit").files[0];

  if (!boutiqueId) { dire("#message-produit", "Choisissez une boutique (créez-en une d'abord).", true); return; }
  if (!nom || prixTexte === "" || !Number.isFinite(prix) || prix < 0) { dire("#message-produit", "Entrez un nom et un prix valides.", true); return; }
  if (!Number.isInteger(stock) || stock < 0) { dire("#message-produit", "Le stock doit être un nombre entier positif.", true); return; }

  const bouton = $("#enregistrer-produit");
  occupe(bouton, true, "Enregistrement…");
  try {
    let photoUrl = null;
    if (photo) {
      if (!photo.type.startsWith("image/")) throw new Error("Choisissez un fichier image.");
      if (photo.size > 2 * 1024 * 1024) throw new Error("La photo ne doit pas dépasser 2 Mo.");
      const ext = (photo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const chemin = utilisateur.id + "/" + Date.now() + "." + ext;
      const { error: ep } = await sb.storage.from(BUCKET_PHOTOS).upload(chemin, photo);
      if (ep) throw new Error("Photo : " + ep.message);
      photoUrl = sb.storage.from(BUCKET_PHOTOS).getPublicUrl(chemin).data.publicUrl;
    }
    const { error } = await sb.from("produits").insert({
      boutique_id: boutiqueId, proprietaire: utilisateur.id, nom,
      description: $("#description-produit").value.trim(),
      categorie: $("#categorie-produit").value.trim(),
      prix, stock, photo_url: photoUrl
    });
    if (error) throw new Error(error.message);
    dire("#message-produit", "Produit enregistré !");
    ["#nom-produit", "#prix-produit", "#description-produit", "#categorie-produit"].forEach((s) => { $(s).value = ""; });
    $("#photo-produit").value = "";
    chargerMesProduits();
  } catch (err) {
    dire("#message-produit", "Erreur : " + err.message, true);
  }
  occupe(bouton, false);
});

async function chargerMesProduits() {
  const zone = $("#mes-produits");
  vider(zone);
  const { data, error } = await sb.from("produits").select("id, nom, prix, stock, boutiques(nom)").eq("proprietaire", utilisateur.id).order("created_at", { ascending: false });
  if (error || !data.length) { zone.append(h("p", { class: "vide" }, "Aucun produit pour le moment.")); return; }
  data.forEach((p) => {
    const ligne = h("div", { class: "ligne-item" },
      h("h4", {}, p.nom),
      h("small", {}, (p.boutiques ? p.boutiques.nom + " · " : "") + fcfa(p.prix) + " · stock : " + p.stock),
      h("div", { class: "rangee-boutons" },
        h("button", { class: "bouton bouton-petit", type: "button", onclick: async () => {
          const prix = Number(prompt("Nouveau prix (FCFA) :", p.prix));
          const stock = parseInt(prompt("Nouveau stock :", p.stock), 10);
          if (!Number.isFinite(prix) || prix < 0 || !Number.isInteger(stock) || stock < 0) { toast("Valeurs invalides.", true); return; }
          const { error: e2 } = await sb.from("produits").update({ prix, stock }).eq("id", p.id);
          if (e2) toast(e2.message, true); else { toast("Produit modifié."); chargerMesProduits(); }
        } }, "Modifier prix / stock"),
        h("button", { class: "bouton bouton-petit bouton-contour", type: "button", onclick: async () => {
          if (!confirm("Supprimer ce produit ?")) return;
          const { error: e2 } = await sb.from("produits").delete().eq("id", p.id);
          if (e2) toast(e2.message, true); else { ligne.remove(); toast("Produit supprimé."); }
        } }, "Supprimer")
      ));
    zone.append(ligne);
  });
}

/* ---------- BARKA : catalogue public ---------- */
async function chargerCatalogue() {
  // remplir le filtre boutiques (une seule fois)
  const filtre = $("#filtre-boutique");
  if (filtre.options.length <= 1) {
    const { data: bs } = await sb.from("boutiques").select("id, nom").order("nom");
    (bs || []).forEach((b) => filtre.append(h("option", { value: b.id }, b.nom)));
  }

  const zone = $("#liste-produits");
  vider(zone);
  zone.append(h("p", { class: "vide" }, "Chargement…"));

  let requete = sb.from("produits").select("id, nom, description, prix, photo_url, stock, boutique_id, boutiques(nom)").eq("statut", "publie").order("created_at", { ascending: false }).limit(60);
  const mot = $("#recherche-produit").value.trim().replace(/[%,]/g, " ");
  if (mot) requete = requete.ilike("nom", "%" + mot + "%");
  if (filtre.value) requete = requete.eq("boutique_id", filtre.value);

  const { data, error } = await requete;
  vider(zone);
  if (error) { zone.append(h("p", { class: "message erreur" }, "Impossible de charger les produits : " + error.message)); return; }
  if (!data.length) { zone.append(h("p", { class: "vide" }, "Aucun produit trouvé.")); return; }

  data.forEach((p) => {
    const image = p.photo_url ? h("img", { src: p.photo_url, alt: p.nom, loading: "lazy" }) : h("div", { class: "sans-photo" }, "📦");
    zone.append(h("div", { class: "produit" }, image,
      h("div", { class: "corps" },
        h("h4", {}, p.nom),
        h("span", { class: "prix" }, fcfa(p.prix)),
        h("span", { class: "boutique" }, p.boutiques ? p.boutiques.nom : ""),
        p.stock > 0
          ? h("button", { class: "bouton bouton-or", type: "button", onclick: () => ajouterAuPanier(p) }, "Ajouter au panier")
          : h("span", { class: "boutique" }, "Épuisé"))));
  });
}
$("#lancer-recherche").addEventListener("click", chargerCatalogue);
$("#recherche-produit").addEventListener("keydown", (e) => { if (e.key === "Enter") chargerCatalogue(); });
$("#filtre-boutique").addEventListener("change", chargerCatalogue);

/* ---------- Panier et commandes ---------- */
function sauverPanier() {
  localStorage.setItem("fribouk_panier", JSON.stringify(panier));
  $("#compteur-panier").textContent = Object.values(panier).reduce((s, l) => s + l.qte, 0);
}

function ajouterAuPanier(p) {
  const ligne = panier[p.id] || { id: p.id, nom: p.nom, prix: p.prix, qte: 0 };
  if (ligne.qte >= p.stock) { toast("Stock maximum atteint.", true); return; }
  ligne.qte += 1;
  panier[p.id] = ligne;
  sauverPanier();
  toast(p.nom + " ajouté au panier.");
}

function afficherPanier() {
  const zone = $("#lignes-panier");
  vider(zone);
  const lignes = Object.values(panier);
  $("#bloc-commande").hidden = !lignes.length;
  if (!lignes.length) zone.append(h("p", { class: "vide" }, "Votre panier est vide. Découvrez BARKA !"));
  let total = 0;
  lignes.forEach((l) => {
    total += l.prix * l.qte;
    zone.append(h("div", { class: "ligne-item" },
      h("h4", {}, l.nom),
      h("small", {}, fcfa(l.prix) + " l'unité"),
      h("div", { class: "rangee-boutons" },
        h("span", { class: "qte" },
          h("button", { type: "button", "aria-label": "Retirer un", onclick: () => { l.qte -= 1; if (l.qte <= 0) delete panier[l.id]; sauverPanier(); afficherPanier(); } }, "−"),
          h("b", {}, l.qte),
          h("button", { type: "button", "aria-label": "Ajouter un", onclick: () => { l.qte += 1; sauverPanier(); afficherPanier(); } }, "+")),
        h("button", { class: "bouton bouton-petit bouton-contour", type: "button", onclick: () => { delete panier[l.id]; sauverPanier(); afficherPanier(); } }, "Retirer"))));
  });
  $("#total-panier").textContent = total.toLocaleString("fr-FR");
}

$("#passer-commande").addEventListener("click", async () => {
  if (!utilisateur) { toast("Connectez-vous pour commander.", true); ouvrirVue("auth"); return; }
  const adresse = $("#adresse-livraison").value.trim();
  const tel = $("#tel-livraison").value.trim();
  if (!adresse || !tel) { dire("#message-panier", "Entrez votre adresse et votre téléphone.", true); return; }
  const items = Object.values(panier).map((l) => ({ produit_id: l.id, quantite: l.qte }));
  const bouton = $("#passer-commande");
  occupe(bouton, true, "Envoi…");
  const { error } = await sb.rpc("passer_commande", { p_items: items, p_adresse: adresse, p_telephone: tel });
  occupe(bouton, false);
  if (error) { dire("#message-panier", "Commande refusée : " + error.message, true); return; }
  panier = {};
  sauverPanier();
  toast("Commande enregistrée !");
  ouvrirVue("commandes");
});

async function chargerCommandes() {
  const zone = $("#liste-commandes");
  vider(zone);
  const { data } = await sb.from("commandes").select("id, total, statut, created_at, commande_lignes(nom, quantite, prix)").eq("acheteur", utilisateur.id).order("created_at", { ascending: false });
  if (!data || !data.length) zone.append(h("p", { class: "vide" }, "Aucune commande."));
  (data || []).forEach((c) => zone.append(h("div", { class: "ligne-item" },
    h("h4", {}, fcfa(c.total) + " — " + c.statut),
    h("small", {}, dateFr(c.created_at)),
    h("p", {}, (c.commande_lignes || []).map((l) => l.quantite + " × " + l.nom).join(", ")))));

  const recues = $("#liste-commandes-recues");
  vider(recues);
  const { data: mb } = await sb.from("boutiques").select("id").eq("proprietaire", utilisateur.id);
  const ids = (mb || []).map((b) => b.id);
  let miennes = [];
  if (ids.length) {
    const { data: lignes } = await sb.from("commande_lignes").select("id, nom, quantite, prix, created_at, boutique_id").in("boutique_id", ids).order("created_at", { ascending: false });
    miennes = lignes || [];
  }
  if (!miennes.length) recues.append(h("p", { class: "vide" }, "Aucune commande reçue."));
  miennes.forEach((l) => recues.append(h("div", { class: "ligne-item" },
    h("h4", {}, l.quantite + " × " + l.nom),
    h("small", {}, fcfa(l.prix * l.quantite) + " · " + dateFr(l.created_at)))));
}

/* ---------- Herboriste Guiyagui ---------- */
async function chargerHerboriste() {
  const [plantes, conseils, traditions] = await Promise.all([
    sb.from("hg_plantes").select("id, nom, description, usages, precautions, prix, photo_url").eq("publie", true).order("nom"),
    sb.from("hg_conseils").select("titre, contenu").eq("publie", true).order("created_at", { ascending: false }),
    sb.from("hg_traditions").select("titre, contenu").eq("publie", true).order("created_at", { ascending: false })
  ]);

  const zp = $("#hg-plantes"); vider(zp);
  if (!plantes.data || !plantes.data.length) zp.append(h("p", { class: "vide" }, "Le catalogue arrive bientôt."));
  (plantes.data || []).forEach((p) => zp.append(h("div", { class: "produit" },
    p.photo_url ? h("img", { src: p.photo_url, alt: p.nom, loading: "lazy" }) : h("div", { class: "sans-photo" }, "🌿"),
    h("div", { class: "corps" },
      h("h4", {}, p.nom),
      p.prix ? h("span", { class: "prix" }, fcfa(p.prix)) : "",
      h("span", { class: "boutique" }, p.description || ""),
      p.usages ? h("span", { class: "boutique" }, "Usage traditionnel : " + p.usages) : "",
      p.precautions ? h("span", { class: "boutique" }, "Précautions : " + p.precautions) : ""))));

  const remplir = (sel, res, vide) => {
    const z = $(sel); vider(z);
    if (!res.data || !res.data.length) z.append(h("p", { class: "vide" }, vide));
    (res.data || []).forEach((x) => z.append(h("div", { class: "ligne-item" }, h("h4", {}, x.titre), h("p", {}, x.contenu))));
  };
  remplir("#hg-conseils", conseils, "Aucun conseil publié pour le moment.");
  remplir("#hg-traditions", traditions, "Aucune tradition publiée pour le moment.");
}

$("#hg-envoyer").addEventListener("click", async () => {
  if (!utilisateur) { toast("Connectez-vous pour demander un rendez-vous.", true); ouvrirVue("auth"); return; }
  const date = $("#hg-date").value;
  const message = $("#hg-message").value.trim();
  if (!date || !message) { dire("#message-hg", "Indiquez une date et votre demande.", true); return; }
  const { error } = await sb.from("hg_rendez_vous").insert({ user_id: utilisateur.id, date_souhaitee: new Date(date).toISOString(), message });
  if (error) { dire("#message-hg", "Erreur : " + error.message, true); return; }
  dire("#message-hg", "Demande envoyée. Vous serez contacté pour confirmation.");
  $("#hg-message").value = "";
});

/* ---------- Démarrage ---------- */
sauverPanier();
majEntete();
ouvrirVue("accueil");
