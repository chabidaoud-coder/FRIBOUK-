# FRIBOUK-
FRIBOUK est une plateforme commerciale d'intelligence artificielle pour générer des textes et des images, analyser des documents, proposer des formations et développer des services numériques.
index.html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#10172a">
  <meta name="description" content="FRIBOUK, votre assistant intelligent pour créer, apprendre et entreprendre.">
  <title>FRIBOUK — Intelligence artificielle</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="header">
    <a class="logo" href="#">FRI<span>BOUK</span></a>
    <button id="menuButton" class="menu-button" aria-label="Ouvrir le menu">☰</button>
    <nav id="navigation">
      <a href="#accueil">Accueil</a>
      <a href="#outils">Nos outils</a>
      <a href="#assistant">Assistant IA</a>
    </nav>
  </header>

  <main>
    <section id="accueil" class="hero">
      <div class="tag">✦ Votre assistant intelligent</div>
      <h1>Imaginez.<br><span>Créez. Réussissez.</span></h1>
      <p>FRIBOUK vous accompagne pour écrire, créer des images, apprendre et développer vos projets.</p>
      <a class="primary-button" href="#assistant">Commencer gratuitement</a>
      <p class="small-note">Une nouvelle façon de créer avec l'intelligence artificielle.</p>
    </section>

    <section id="outils" class="section">
      <h2>Que souhaitez-vous faire ?</h2>
      <p class="section-intro">Choisissez un outil pour commencer.</p>

      <div class="tools-grid">
        <button class="tool-card" data-tool="texte">
          <span class="tool-icon">✍️</span>
          <strong>Générer du texte</strong>
          <span>Rédiger, corriger et trouver des idées.</span>
        </button>

        <button class="tool-card" data-tool="image">
          <span class="tool-icon">🎨</span>
          <strong>Créer des images</strong>
          <span>Imaginer des visuels et des affiches.</span>
        </button>

        <button class="tool-card" data-tool="formation">
          <span class="tool-icon">📚</span>
          <strong>Apprendre</strong>
          <span>Découvrir des cours et des formations.</span>
        </button>

        <button class="tool-card" data-tool="business">
          <span class="tool-icon">💼</span>
          <strong>Entreprendre</strong>
          <span>Préparer vos projets commerciaux.</span>
        </button>
      </div>
    </section>

    <section id="assistant" class="section assistant">
      <h2>Votre espace IA</h2>
      <p class="section-intro">Décrivez ce que vous souhaitez réaliser.</p>

      <label for="toolSelect">Type de demande</label>
      <select id="toolSelect">
        <option value="texte">Génération de texte</option>
        <option value="image">Création d'image</option>
        <option value="formation">Formation et apprentissage</option>
        <option value="business">Conseil commercial</option>
      </select>

      <label for="promptInput">Votre demande</label>
      <textarea id="promptInput" rows="4"
        placeholder="Exemple : rédige une publicité pour mon entreprise..."></textarea>

      <button id="submitButton" class="primary-button full-width">
        Préparer ma demande
      </button>

      <div id="result" class="result" aria-live="polite" hidden></div>
      <p class="small-note">Version initiale : l'assistant IA sera connecté dans une prochaine étape.</p>
    </section>
  </main>

  <footer>
    <a class="logo" href="#">FRI<span>BOUK</span></a>
    <p>Créer, apprendre et entreprendre avec l'IA.</p>
    <p>© <span id="year"></span> FRIBOUK</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
