// All page behavior moved here from index.html
window.addEventListener("DOMContentLoaded", () => {
  // Feather icons
  if (window.feather && feather.replace) feather.replace();

  // ===== Parallax background (smooth scroll movement) =====
  (function () {
    const img = document.getElementById("bgImg");
    if (!img) return;
    const speed = 0.4; // from 0.25 → 0.3
    const scale = 1.12; // oversize so edges never show
    function update() {
      img.style.transform = `translate3d(0, ${-window.scrollY * speed}px, 0) scale(${scale})`;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  })();

  // ===== Minimal carousel logic (one slide at a time) =====
  (function () {
    const track = document.getElementById("track");
    const slides = track ? Array.from(track.children) : [];
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const dotsWrap = document.getElementById("dots");
    if (!track || !prev || !next || !dotsWrap || slides.length === 0) return;

    let index = 0;

    // Build dots
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "dot" + (i === 0 ? " active" : "");
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", () => go(i));
      dotsWrap.appendChild(b);
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + -index * 100 + "%)";
      [...dotsWrap.children].forEach((d, di) =>
        d.classList.toggle("active", di === index),
      );
    }

    prev.addEventListener("click", () => go(index - 1));
    next.addEventListener("click", () => go(index + 1));

    // Touch swipe
    let startX = null;
    track.addEventListener(
      "touchstart",
      (e) => (startX = e.touches[0].clientX),
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  })();

  // ===== Mobile menu toggle =====
  (function () {
    const btn = document.getElementById("menuBtn");
    const panel = document.getElementById("mobileNav");
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      panel.setAttribute("aria-hidden", String(!open));
      btn.setAttribute("aria-expanded", String(open));
    });
  })();
  // ===== Pill menu → section scroll =====
  (function () {
    const header = document.getElementById("siteHeader");
    const pills = document.querySelectorAll(".pillmenu .pill");

    // Map pill labels → section IDs on this page
    const targetMap = {
      "Featured Projects": "#portfolio",
      "Curated Services": "#services",
      Collections: "#selected-work",
      "Design Philosophy": "#about",
    };

    // Helper: smooth scroll with fixed-header offset
    function scrollToTarget(sel) {
      const el = document.querySelector(sel);
      if (!el) return;
      const headerH = header ? header.offsetHeight : 0;
      const y = el.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    // Click → scroll
    pills.forEach((btn) => {
      btn.addEventListener("click", () => {
        const label = btn.textContent.trim();
        const target = targetMap[label];
        if (target) {
          scrollToTarget(target);
          // active state styling for pills
          pills.forEach((p) => p.classList.remove("active"));
          btn.classList.add("active");
        }
      });
    });

    // Optional: update active pill while scrolling
    const sections = ["#portfolio", "#services", "#selected-work", "#about"]
      .map((sel) => document.querySelector(sel))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = "#" + visible.target.id;
        const label = Object.entries(targetMap).find(
          ([, sel]) => sel === id,
        )?.[0];
        if (!label) return;
        pills.forEach((p) =>
          p.classList.toggle("active", p.textContent.trim() === label),
        );
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((sec) => observer.observe(sec));
  })();

  // ===== Sticky pills just under the header =====
  (function () {
    const header = document.getElementById("siteHeader");
    const pills = document.getElementById("pills");
    if (!header || !pills) return;

    // Keep CSS var in sync with real header height
    function setHeaderVar() {
      const h = header.offsetHeight || 64;
      document.documentElement.style.setProperty("--header-h", h + "px");
    }
    setHeaderVar();
    window.addEventListener("resize", setHeaderVar);

    // Add a 'stuck' class when the pills are actually docked
    const gap = 8; // matches --pills-gap
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // When the element can no longer be fully seen (because it’s stuck),
        // intersectionRatio drops < 1 — toggle the class.
        pills.classList.toggle("stuck", e.intersectionRatio < 1);
      },
      {
        threshold: [1],
        rootMargin: `-${header.offsetHeight + gap}px 0px 0px 0px`,
      },
    );
    observer.observe(pills);
  })();
});
