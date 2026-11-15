/* FRIBOUK — menu ☰ (infos, résumé, abonnement, Shortcut, déconnexion) — à charger après script.js */
(function () {
  const entete = document.querySelector("header.entete");
  if (!entete) return;

  const bouton = h("button", { id: "btn-menu", class: "btn-menu", type: "button", "aria-label": "Ouvrir le menu", "aria-expanded": "false" }, "☰");
  entete.prepend(bouton);
  const fond = h("div", { id: "menu-fond", class: "menu-fond", hidden: "" });
  const corps = h("div", { class: "menu-corps" });
  const panneau = h("aside", { id: "menu-lateral", class: "menu-lateral", "aria-label": "Menu du compte" },
    h("div", { class: "menu-haut" }, h("strong", {}, "Mon espace"),
      h("button", { type: "button", class: "menu-fermer", "aria-label": "Fermer le menu", onclick: fermer }, "✕")),
    corps);
  document.body.append(fond, panneau);

  function ouvrir() { rendre(); fond.hidden = false; panneau.classList.add("ouvert"); bouton.setAttribute("aria-expanded", "true"); }
  function fermer() { fond.hidden = true; panneau.classList.remove("ouvert"); bouton.setAttribute("aria-expanded", "false"); }
  bouton.addEventListener("click", ouvrir);
  fond.addEventListener("click", fermer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermer(); });
  panneau.addEventListener("click", (e) => { if (e.target.closest("[data-vue], a, [data-ferme]")) fermer(); });

  const ligne = (nom, valeur, id) => h("div", { class: "menu-ligne" }, h("span", {}, nom), h("b", id ? { id } : {}, valeur));
  const section = (titre, ...contenu) => h("section", { class: "menu-section" }, h("h3", {}, titre), ...contenu);
  const lien = (texte, href) => h("a", { class: "menu-lien", href }, texte);
  const vue = (texte, nom) => h("button", { class: "menu-lien", type: "button", "data-vue": nom }, texte);

  async function compter(table, filtre) {
    try {
      let q = sb.from(table).select("id", { count: "exact", head: true });
      if (filtre) q = q.eq(filtre[0], filtre[1]);
      const { count, error } = await q;
      return error ? null : count;
    } catch (e) { return null; }
  }

  let jeton = 0;
  function rendre() {
    vider(corps);
    const moi = ++jeton;

    if (!utilisateur) {
      corps.append(
        h("p", { class: "aide" }, "Connectez-vous pour retrouver vos informations, votre abonnement et le résumé de vos opérations."),
        h("button", { class: "bouton bouton-or bloc", type: "button", "data-vue": "auth" }, "Se connecter / Créer un compte"),
        section("Découvrir", vue("🛍️ Marché BARKA", "barka"), lien("🎓 Formations", "formations.html"), lien("📚 Salles d'études", "salles.html"))
      );
      return;
    }

    const email = utilisateur.email || "";
    const nom = (profil && profil.nom) || email.split("@")[0];
    const plan = (profil && profil.plan) || "FREE";

    corps.append(
      h("div", { class: "menu-profil" },
        h("span", { class: "menu-avatar" }, (nom[0] || "?").toUpperCase()),
        h("div", {}, h("strong", {}, nom), h("small", {}, email))),

      section("Mes informations",
        ligne("Rôle", (profil && profil.role) || "utilisateur"),
        ligne("Formule", plan),
        ligne("Crédits", profil ? profil.credits : 0)),

      section("Résumé de mes opérations",
        ligne("Conversations IA", "…", "mr-conv"),
        ligne("Créations (textes…)", "…", "mr-crea"),
        ligne("Commandes passées", "…", "mr-cmd"),
        ligne("Mes boutiques", "…", "mr-bout"),
        ligne("Mes produits", "…", "mr-prod")),

      section("Mon abonnement",
        ligne("Formule IA", plan),
        h("div", { id: "mr-abos", class: "menu-liste" }, h("p", { class: "aide" }, "Chargement…")),
        h("div", { id: "mr-pay", class: "menu-liste" }),
        lien("💳 Gérer mon abonnement", "abonnements.html")),

      section("Mon travail Shortcut",
        ligne("Points / statut", "…", "mr-sc"),
        ligne("Travaux sauvegardés", "…", "mr-trav"),
        h("div", { id: "mr-travaux", class: "menu-liste" }),
        h("p", { class: "aide" }, "Vos créations Shortcut se téléchargent depuis l'Atelier (PNG, JPG ou PDF)."),
        lien("📂 Mes travaux Shortcut", "atelier.html?travaux=1"),
        lien("🖨️ Nouveau travail", "atelier.html"),
        vue("🗂️ Mes créations (textes IA)", "creations")),

      section("Raccourcis",
        vue("👤 Mon compte", "tableau"),
        vue("📦 Mes commandes", "commandes"),
        vue("🏬 Mes boutiques", "boutiques"),
        lien("📣 Publier sur mes réseaux", "publier.html"),
        lien("📊 Mon activité", "statistiques.html")),

      h("button", { class: "bouton bouton-contour bloc menu-sortie", type: "button", "data-ferme": "1",
        onclick: () => document.getElementById("btn-deconnexion").click() }, "Se déconnecter")
    );

    // Résumé : chargé en arrière-plan
    const maj = (id, v) => { if (moi === jeton) { const e = document.getElementById(id); if (e) e.textContent = v; } };
    const val = (n) => (n === null ? "—" : n);
    compter("conversations").then((n) => maj("mr-conv", val(n)));
    compter("creations").then((n) => maj("mr-crea", val(n)));
    compter("boutiques", ["proprietaire", utilisateur.id]).then((n) => maj("mr-bout", val(n)));
    compter("produits", ["proprietaire", utilisateur.id]).then((n) => maj("mr-prod", val(n)));

    sb.from("abonnements").select("type, fin").gt("fin", new Date().toISOString()).order("fin", { ascending: false }).then(({ data, error }) => {
      if (moi !== jeton) return;
      const z = document.getElementById("mr-abos"); if (!z) return; vider(z);
      if (error || !data || !data.length) { z.append(h("p", { class: "aide" }, "Aucun abonnement en cours : offre gratuite.")); return; }
      const noms = { boutique: "🏪 Boutique", ia: "💬 Chat IA", atelier: "🖨️ Atelier Shortcut" };
      const vus = {};
      data.forEach((a) => { if (vus[a.type]) return; vus[a.type] = 1;
        z.append(ligne(noms[a.type] || a.type, "jusqu'au " + new Date(a.fin).toLocaleDateString("fr-FR", { dateStyle: "medium" }))); });
    }, () => {});
    sb.from("paiements").select("montant, statut, created_at, offres(libelle)").order("created_at", { ascending: false }).limit(3).then(({ data }) => {
      if (moi !== jeton || !data || !data.length) return;
      const z = document.getElementById("mr-pay"); if (!z) return; vider(z);
      const st = { paye: "Payé", en_attente: "En attente", echec: "Échoué" };
      z.append(h("p", { class: "aide" }, "Derniers paiements"));
      data.forEach((p) => z.append(ligne(p.offres ? p.offres.libelle : "Offre", fcfa(p.montant) + " · " + (st[p.statut] || p.statut))));
    }, () => {});
    sb.from("atelier_travaux").select("id, titre, updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(3).then(({ data, count, error }) => {
      if (error) return maj("mr-trav", "—");
      maj("mr-trav", count ?? (data || []).length);
      if (moi !== jeton || !data || !data.length) return;
      const z = document.getElementById("mr-travaux"); if (!z) return; vider(z);
      data.forEach((t) => z.append(h("a", { class: "menu-lien", href: "atelier.html?travail=" + t.id }, "✏️ " + t.titre)));
    }, () => {});
    sb.rpc("atelier_solde").then(({ data }) => {
      maj("mr-sc", !data ? "—" : data.abonne ? "✅ Abonné" : "⭐ " + data.reste + " pts");
    }, () => {});
    sb.from("commandes").select("total").eq("acheteur", utilisateur.id).then(({ data, error }) => {
      if (error || !data) return maj("mr-cmd", "—");
      const somme = data.reduce((s, c) => s + Number(c.total || 0), 0);
      maj("mr-cmd", data.length ? data.length + " · " + fcfa(somme) : "0");
    });
  }
})();
                                 
