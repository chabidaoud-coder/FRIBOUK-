
document.addEventListener("DOMContentLoaded", () => {
  const bouton = document.getElementById("commencer");

  if (!bouton) return;

  bouton.addEventListener("click", () => {
    let accueil = document.getElementById("accueil-fribouk");

    if (!accueil) {
      accueil = document.createElement("section");
      accueil.id = "accueil-fribouk";

      accueil.innerHTML = `
        <h2>Bienvenue sur FRIBOUK</h2>
        <p>Votre espace d'intelligence artificielle.</p>

        <button class="outil">IA Chat</button>
        <button class="outil">Générateur de textes</button>
        <button class="outil">Générateur d'images</button>
        <button class="outil">Générateur de vidéos</button>
        <button class="outil">Traduction</button>
        <button class="outil">Transcription audio</button>
      `;

      bouton.insertAdjacentElement("afterend", accueil);
    }

    accueil.scrollIntoView({ behavior: "smooth" });
  });
});

