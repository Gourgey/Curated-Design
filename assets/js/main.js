// Feather icons + year + smooth anchors
window.addEventListener("DOMContentLoaded", () => {
  if (window.feather && feather.replace) feather.replace();

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Mobile menu
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const open = !mobileNav.classList.contains("open");
      mobileNav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }

  // Carousel
  const track = document.getElementById("track");
  const dots = document.getElementById("dots");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  if (track && dots && prev && next) {
    const slides = Array.from(track.children);
    let index = 0;

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots
        .querySelectorAll(".dot")
        .forEach((d, i) => d.classList.toggle("active", i === index));
    }

    // dots
    slides.forEach((_, i) => {
      const s = document.createElement("span");
      s.className = "dot" + (i === 0 ? " active" : "");
      s.addEventListener("click", () => {
        index = i;
        update();
      });
      dots.appendChild(s);
    });

    function nextSlide() {
      index = (index + 1) % slides.length;
      update();
    }
    function prevSlide() {
      index = (index - 1 + slides.length) % slides.length;
      update();
    }

    next.addEventListener("click", nextSlide);
    prev.addEventListener("click", prevSlide);

    // keyboard
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    });

    // auto-advance (pause on hover)
    let autoplay = setInterval(nextSlide, 6000);
    [track, prev, next].forEach((el) => {
      el.addEventListener("mouseenter", () => clearInterval(autoplay));
      el.addEventListener(
        "mouseleave",
        () => (autoplay = setInterval(nextSlide, 6000)),
      );
    });
  }
});
