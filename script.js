

document.addEventListener("DOMContentLoaded", function () {
  alert("FRIBOUK : le JavaScript fonctionne !");

  const envoyer = document.getElementById("envoyer-chat");

  if (envoyer) {
    envoyer.addEventListener("click", function () {
      alert("Le bouton Envoyer fonctionne !");
    });
  } else {
    alert("Erreur : bouton Envoyer introuvable !");
  }
});
