script.js
document.addEventListener("DOMContentLoaded", () => {
  const bouton = document.getElementById("commencer");

  if (!bouton) return;

  bouton.addEventListener("click", () => {
    let message = document.getElementById("message-fribouk");

    if (!message) {
      message = document.createElement("p");
      message.id = "message-fribouk";
      message.textContent =
        "Bienvenue sur FRIBOUK ! Votre espace est prêt.";
      bouton.insertAdjacentElement("afterend", message);
    }

    message.scrollIntoView({ behavior: "smooth" });
  });
});
