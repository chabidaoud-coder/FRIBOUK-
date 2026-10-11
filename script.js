
document.addEventListener("DOMContentLoaded", () => {
  const toolSelect = document.getElementById("toolSelect");
  const promptInput = document.getElementById("promptInput");
  const submitButton = document.getElementById("submitButton");
  const result = document.getElementById("result");

  if (!submitButton || !promptInput || !result) {
    console.error("Vérifie les éléments HTML de FRIBOUK.");
    return;
  }

  submitButton.addEventListener("click", () => {
    const prompt = promptInput.value.trim();
    const tool = toolSelect ? toolSelect.value : "assistant";

    if (!prompt) {
      result.textContent = "Écris d'abord ta demande.";
      return;
    }

    result.textContent =
      "Demande enregistrée dans l'interface FRIBOUK. " +
      "Outil sélectionné : " + tool +
      ". La connexion à l'intelligence artificielle reste à configurer.";
  });

  console.log("FRIBOUK est prêt !");
});
