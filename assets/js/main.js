window.addEventListener("DOMContentLoaded", () => {
  // Icons
  if (window.feather && feather.replace) feather.replace();

  // Mobile menu
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const open = !mobileNav.classList.contains("open");
      mobileNav.classList.toggle("open", open);
      mobileNav.setAttribute("aria-hidden", String(!open));
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

    // build dots
    dots.innerHTML = "";
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
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
      },
      { passive: true },
    );

    // autoplay with hover pause
    let autoplay = setInterval(nextSlide, 6000);
    ["mouseenter", "touchstart"].forEach((evt) =>
      track.addEventListener(evt, () => clearInterval(autoplay), {
        passive: true,
      }),
    );
    ["mouseleave", "touchend"].forEach((evt) =>
      track.addEventListener(
        evt,
        () => (autoplay = setInterval(nextSlide, 6000)),
        { passive: true },
      ),
    );
  }

  // Header behavior (transparent at top; material after a few px)
  const header = document.getElementById("siteHeader");
  if (header) {
    const toggleHeader = () => {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    toggleHeader();
    window.addEventListener("scroll", toggleHeader, { passive: true });
  }

  // Scroll-sync background: image is 150vh tall; reveal it top->bottom as page scrolls
  const bgImg = document.getElementById("bgImg");
  function updateBg() {
    if (!bgImg) return;
    const vh = window.innerHeight;
    const extra = Math.max(0, vh * 1.5 - vh); // 50% of viewport height
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - vh); // avoid divide-by-zero
    const p = Math.min(1, Math.max(0, window.scrollY / maxScroll)); // 0..1
    const y = -(p * extra); // translate up to show lower part
    // Use translate3d for compositor-only movement
    bgImg.style.transform = `translate3d(0, ${y}px, 0)`;
  }
  updateBg();
  window.addEventListener("scroll", updateBg, { passive: true });
  window.addEventListener("resize", updateBg);
});
