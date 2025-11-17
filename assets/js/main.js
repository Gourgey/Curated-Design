// All page behavior moved here from index.html
window.addEventListener("DOMContentLoaded", () => {
  // ===== Parallax background (smooth scroll movement) =====
  // This IIFE controls the background image movement for a parallax effect.
  // It moves the background image slower than scroll so the content appears
  // to glide over it.
  (function () {
    const img = document.getElementById("bgImg");
    if (!img) return;

    // speed controls how much the image moves relative to the scroll.
    const speed = 0.4;
    // scale keeps the image slightly zoomed so edges are never exposed when moved.
    const scale = 1.12;

    function update() {
      img.style.transform = `translate3d(0, ${-window.scrollY * speed}px, 0) scale(${scale})`;
    }

    // Run once on load and again on scroll/resize.
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  })();

  // ===== Minimal carousel logic (one slide at a time) =====
  // This IIFE powers the image carousel:
  // - Moves the horizontal track of slides.
  // - Connects previous/next buttons.
  // - Creates dot indicators and enables click + touch swipe.
  (function () {
    const track = document.getElementById("track");
    const slides = track ? Array.from(track.children) : [];
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const dotsWrap = document.getElementById("dots");

    // If any key element is missing, abort safely.
    if (!track || !prev || !next || !dotsWrap || slides.length === 0) return;

    let index = 0; // current slide index

    // --- Build dots dynamically based on number of slides ---
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "dot" + (i === 0 ? " active" : "");
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", () => go(i));
      dotsWrap.appendChild(b);
    });

    // Move the carousel to slide i, wrap-around supported.
    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + -index * 100 + "%)";
      [...dotsWrap.children].forEach((d, di) =>
        d.classList.toggle("active", di === index),
      );
    }

    // Hook up previous/next buttons.
    prev.addEventListener("click", () => go(index - 1));
    next.addEventListener("click", () => go(index + 1));

    // --- Touch swipe support for mobile ---
    let startX = null;
    track.addEventListener(
      "touchstart",
      (e) => (startX = e.touches[0].clientX),
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      // If swipe distance is big enough, move to next/previous slide.
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  })();

  // ===== Pill menu → section scroll =====
  // This block makes each pill in the main pill menu scroll smoothly
  // to its corresponding section on the page, taking the fixed header
  // and pill bar height into account.
  (function () {
    const header = document.getElementById("siteHeader");
    const pills = document.querySelectorAll(".pillmenu .pill");

    // Map human-readable pill labels to section IDs on the page.
    const targetMap = {
      "Featured Projects": "#portfolio",
      "Curated Services": "#services",
      Collections: "#selected-work",
      "Design Philosophy": "#about",
    };

    // Helper: scroll to a given selector, adjusting for fixed header + pill bar
    // so that the section top lines up neatly under the pills.
    function scrollToTarget(sel) {
      const el = document.querySelector(sel);
      if (!el) return;
      // Scroll so the section top aligns with the top of the viewport
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    // For each pill, prevent the default anchor behavior and use the
    // custom smooth scrolling. Also update the active state immediately
    // on click.
    pills.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const label = btn.textContent.trim();
        const target = targetMap[label];
        if (target) {
          scrollToTarget(target);
          pills.forEach((p) => p.classList.remove("active"));
          btn.classList.add("active");
        }
      });
    });
  })();

  // ---- Active pill highlight on scroll (top-of-window logic) ----
  // This IIFE updates which pill is marked .active as you scroll,
  // based on which section is currently at/near the top under the pill bar.
  (function () {
    const header = document.getElementById("siteHeader");
    const pillsBar = document.getElementById("pills");

    // All pill links inside the main pill bar.
    const links = Array.from(
      document.querySelectorAll("#pills .pillmenu a.pill"),
    );

    // Build an array of the corresponding section elements (skipping any missing).
    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    // Helper: mark one pill active by its target section ID.
    function setActiveById(id) {
      links.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`),
      );
    }

    // Determine which section is currently “active” based on scroll:
    // We look at the scroll position plus header + pill heights and pick
    // the last section whose top is above that line.
    function currentSectionId() {
      const headerH = header ? header.offsetHeight : 0;
      const pillsH = pillsBar ? pillsBar.offsetHeight : 0;
      const offset = headerH + pillsH + 8; // align with CSS gap
      const y = window.scrollY + offset + 1; // +1 so it flips cleanly
      let current = sections[0]?.id || "";
      for (const sec of sections) {
        if (sec.offsetTop <= y) current = sec.id;
        else break;
      }
      return current;
    }

    // Recalculate and update the active pill.
    function updateActive() {
      const id = currentSectionId();
      if (id) setActiveById(id);
    }

    // Run once on load and again on scroll/resize.
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
  })();
});
