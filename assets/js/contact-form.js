window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const successCard = document.getElementById("contactFormSuccess");
  const errorMessage = document.getElementById("contactFormError");
  const submitButton = document.getElementById("contactFormSubmit");
  const submitLabel = document.getElementById("contactFormSubmitLabel");
  if (!form || !successCard || !errorMessage || !submitButton || !submitLabel) {
    return;
  }
  if (typeof window.fetch !== "function") return;

  const defaultLabel = submitLabel.textContent.trim();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.classList.add("hidden");
    submitButton.disabled = true;
    submitLabel.textContent = "Sending...";

    const formData = new FormData(form);
    if (!formData.get("form-name")) {
      formData.set("form-name", form.getAttribute("name") || "contact");
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) {
        throw new Error(`Netlify form submission failed: ${response.status}`);
      }

      form.reset();
      form.classList.add("hidden");
      successCard.classList.remove("hidden");
      successCard.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error("Contact form submission failed", error);
      errorMessage.classList.remove("hidden");
      submitButton.disabled = false;
      submitLabel.textContent = defaultLabel;
    }
  });
});
