// All page behavior moved here from index.html
window.addEventListener("DOMContentLoaded", () => {
  /* --------------------------------------------------------------------------
   * PARALLAX BACKGROUND
   * -------------------------------------------------------------------------- */
  (function () {
    const img = document.getElementById("bgImg");
    if (!img) return;

    const speed = 0.4;
    const scale = 1.12;

    function update() {
      img.style.transform = `translate3d(0, ${-window.scrollY * speed}px, 0) scale(${scale})`;
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  })();

  /* --------------------------------------------------------------------------
   * MINIMAL CAROUSEL LOGIC
   * -------------------------------------------------------------------------- */
  (function () {
    const track = document.getElementById("track");
    const slides = track ? Array.from(track.children) : [];
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const dotsWrap = document.getElementById("dots");

    if (!track || !prev || !next || !dotsWrap || slides.length === 0) return;

    let index = 0;

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

  /* --------------------------------------------------------------------------
   * PILL MENU → SECTION SCROLL (generic in-page anchors)
   * -------------------------------------------------------------------------- */
  (function () {
    const pills = document.querySelectorAll(
      "#pills a.pill, #pillsPanel a.pill",
    );

    function getOffset() {
      const header = document.getElementById("siteHeader"); // may be null on some pages
      const pillsBar = document.getElementById("pills");
      const headerH = header ? header.offsetHeight : 0;
      const pillsH = pillsBar ? pillsBar.offsetHeight : 0;
      return headerH + pillsH + 12;
    }

    function scrollToHash(hash) {
      const el = document.querySelector(hash);
      if (!el) return;

      const y = el.getBoundingClientRect().top + window.scrollY - getOffset();
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    pills.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return; // allow normal navigation for non-hash links

        e.preventDefault();
        scrollToHash(href);

        // Update active state (both desktop + mobile panel)
        pills.forEach((p) => p.classList.remove("active"));
        a.classList.add("active");
      });
    });
  })();

  /* --------------------------------------------------------------------------
   * FLOATING NAV PILL — SIMPLE BURGER TOGGLE (BREAKPOINT HANDLED IN CSS)
   * -------------------------------------------------------------------------- */
  (function () {
    const nav = document.getElementById("floatingNavPill");
    if (!nav) return;

    const navToggle = nav.querySelector(".pillmenu-toggle");
    if (!navToggle) return;

    function closeNav() {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }

    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Your CSS uses: @media (max-width: 1280px) for burger mode
    // So mobile is <= 1280, desktop is > 1280
    let wasMobile = window.innerWidth <= 1280;

    window.addEventListener("resize", () => {
      const isMobile = window.innerWidth <= 1280;
      if (wasMobile !== isMobile) closeNav(); // crossing breakpoint: reset state
      wasMobile = isMobile;
    });
  })();

  /* --------------------------------------------------------------------------
   * MAIN PILL MENU (CENTER) — COMPACT BURGER UNDER 900px
   * -------------------------------------------------------------------------- */
  (function () {
    const pillsWrap = document.getElementById("pills");
    const toggle = document.getElementById("pillsToggle");
    const panel = document.getElementById("pillsPanel");
    if (!pillsWrap || !toggle || !panel) return;

    function close() {
      pillsWrap.classList.remove("pills-open");
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    function open() {
      pillsWrap.classList.add("pills-open");
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = pillsWrap.classList.contains("pills-open");
      if (isOpen) close();
      else open();
    });

    // Close when a link is clicked (mobile UX)
    panel.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      close();
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!pillsWrap.classList.contains("pills-open")) return;
      if (pillsWrap.contains(e.target)) return;
      close();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // If we resize up past 900 while open, close it.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) close();
    });
  })();
});

// ===== RAF-BASED SCROLL HANDLER (replaces old scroll listeners) =====

const header = document.getElementById("siteHeader");
const pillsBar = document.getElementById("pills");
const links = Array.from(document.querySelectorAll("#pills .pillmenu a.pill"));
const sections = links
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const band = document.querySelector(".projects-band");

// If this page has no pill menu, bail early
if (links.length && sections.length) {
  function getOffset() {
    const headerH = header ? header.offsetHeight : 0;
    const pillsH = pillsBar ? pillsBar.offsetHeight : 0;
    return headerH + pillsH + 8;
  }

  function setActiveById(id) {
    links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${id}`),
    );
  }

  function currentSectionId() {
    const y = window.scrollY + getOffset() + 1;
    let current = sections[0]?.id || "";
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec.id;
      else break;
    }
    return current;
  }

  let ticking = false;

  function update() {
    // Active pill highlight
    const id = currentSectionId();
    if (id) setActiveById(id);

    // Projects-band colour mode
    if (band) {
      const y = window.scrollY + getOffset() + 1;
      const top = band.offsetTop;
      const bottom = top + band.offsetHeight;
      document.body.classList.toggle(
        "is-projects-band",
        y >= top && y < bottom,
      );
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  // Initial run
  update();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}
