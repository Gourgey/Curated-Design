// Project hero gallery carousel.
window.addEventListener("DOMContentLoaded", () => {
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
