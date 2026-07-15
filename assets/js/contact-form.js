window.addEventListener("DOMContentLoaded", () => {
  if (typeof window.fetch !== "function") return;

  const forms = document.querySelectorAll("[data-enhanced-netlify-form]");

  forms.forEach((form) => {
    const successTarget = form.getAttribute("data-success-target");
    const successCard = successTarget
      ? document.getElementById(successTarget)
      : null;
    const errorMessage = form.querySelector("[data-form-error]");
    const submitButton = form.querySelector("[data-form-submit]");
    const submitLabel = form.querySelector("[data-form-submit-label]");
    if (!successCard || !errorMessage || !submitButton || !submitLabel) return;

    const defaultLabel = submitLabel.textContent.trim();

    form.addEventListener("submit", async (event) => {
      if (!form.checkValidity()) return;
      event.preventDefault();

      errorMessage.classList.add("hidden");
      submitButton.disabled = true;
      submitLabel.textContent = "Sending…";

      const formData = new FormData(form);
      if (!formData.get("form-name")) {
        formData.set("form-name", form.getAttribute("name") || "contact");
      }

      try {
        const response = await window.fetch("/", {
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
        successCard.focus();
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        successCard.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      } catch (error) {
        console.error("Enquiry form submission failed", error);
        errorMessage.classList.remove("hidden");
        errorMessage.focus();
        submitButton.disabled = false;
        submitLabel.textContent = defaultLabel;
      }
    });
  });
});
