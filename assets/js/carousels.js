// Carousels: the homepage process carousel and the project hero gallery
// carousel. Split from main.js (P2.4).
window.addEventListener("DOMContentLoaded", () => {
  /* --------------------------------------------------------------------------
   * HOMEPAGE PROCESS CAROUSEL
   * Every step is server-rendered with the first open; this only moves the
   * open step (arrows, clicking a step, or ArrowLeft/ArrowRight).
   * -------------------------------------------------------------------------- */
  (function () {
    const carousel = document.querySelector("[data-process-carousel]");
    if (!carousel) return;

    const steps = Array.from(carousel.querySelectorAll("[data-process-step]"));
    const bars = Array.from(carousel.querySelectorAll(".process-dock__progress span"));
    const count = carousel.querySelector("[data-process-count]");
    const prev = carousel.querySelector("[data-process-prev]");
    const next = carousel.querySelector("[data-process-next]");
    if (steps.length <= 1) return;

    const pad = (n) => (n < 10 ? "0" + n : String(n));
    let index = 0;

    function go(nextIndex) {
      index = (nextIndex + steps.length) % steps.length;
      steps.forEach((step, stepIndex) => {
        const isActive = stepIndex === index;
        step.classList.toggle("is-active", isActive);
        step.querySelector("[data-process-toggle]").setAttribute("aria-expanded", isActive ? "true" : "false");
      });
      bars.forEach((bar, barIndex) => bar.classList.toggle("is-done", barIndex <= index));
      if (count) count.textContent = pad(index + 1) + " / " + pad(steps.length);
    }

    steps.forEach((step, stepIndex) => {
      step.querySelector("[data-process-toggle]").addEventListener("click", () => go(stepIndex));
    });
    if (prev) prev.addEventListener("click", () => go(index - 1));
    if (next) next.addEventListener("click", () => go(index + 1));
    carousel.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.target.closest("input, textarea, select")) return;
      event.preventDefault();
      go(index + (event.key === "ArrowRight" ? 1 : -1));
    });
  })();

  /* --------------------------------------------------------------------------
   * PROJECT HERO CAROUSEL
   * -------------------------------------------------------------------------- */
  (function () {
    document.querySelectorAll("[data-project-carousel]").forEach((carousel) => {
      const track = carousel.querySelector("[data-project-carousel-track]");
      const slides = track ? Array.from(track.children) : [];
      const prev = carousel.querySelector("[data-project-carousel-prev]");
      const next = carousel.querySelector("[data-project-carousel-next]");
      const dotsWrap = carousel.querySelector("[data-project-carousel-dots]");

      if (!track || !prev || !next || !dotsWrap || slides.length <= 1) return;

      let index = 0;

      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = i === 0 ? "active" : "";
        dot.setAttribute("aria-label", "Go to project image " + (i + 1));
        dot.addEventListener("click", () => go(i));
        dotsWrap.appendChild(dot);
      });

      function go(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = "translateX(" + -index * 100 + "%)";
        slides.forEach((slide, slideIndex) => {
          const isActive = slideIndex === index;
          if (isActive) slide.setAttribute("aria-current", "true");
          else slide.removeAttribute("aria-current");
          slide.setAttribute("aria-hidden", isActive ? "false" : "true");
        });
        Array.from(dotsWrap.children).forEach((dot, dotIndex) => {
          const isActive = dotIndex === index;
          dot.classList.toggle("active", isActive);
          dot.setAttribute("aria-current", isActive ? "true" : "false");
        });
      }

      prev.addEventListener("click", () => go(index - 1));
      next.addEventListener("click", () => go(index + 1));
      carousel.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        go(index + (event.key === "ArrowRight" ? 1 : -1));
      });

      let startX = null;
      track.addEventListener(
        "touchstart",
        (event) => {
          startX = event.touches[0].clientX;
        },
        { passive: true },
      );
      track.addEventListener("touchend", (event) => {
        if (startX === null) return;
        const deltaX = event.changedTouches[0].clientX - startX;
        if (Math.abs(deltaX) > 40) go(index + (deltaX < 0 ? 1 : -1));
        startX = null;
      });
      go(0);
    });
  })();
});
