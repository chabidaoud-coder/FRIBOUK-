script.js

document.addEventListener("DOMContentLoaded", function () {
  console.log("Bienvenue sur FRIBOUK !");

  const boutons = document.querySelectorAll("[data-action]");

  boutons.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      const action = bouton.dataset.action;

      alert("FRIBOUK : " + action + " sera bientôt disponible !");
    });
  });
});
