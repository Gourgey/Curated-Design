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
   * PILL MENU → SECTION SCROLL
   * -------------------------------------------------------------------------- */
  (function () {
    const pills = document.querySelectorAll(
      "#pills .pillmenu .pill, #pillsPanel a.pill",
    );

    const targetMap = {
      "Featured Projects": "#portfolio",
      "Curated Services": "#services",
      Collections: "#selected-work",
      "Design Philosophy": "#about",
    };

    function scrollToTarget(sel) {
      const el = document.querySelector(sel);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

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

  /* --------------------------------------------------------------------------
   * ACTIVE PILL HIGHLIGHT ON SCROLL
   * -------------------------------------------------------------------------- */
  (function () {
    const header = document.getElementById("siteHeader");
    const pillsBar = document.getElementById("pills");
    const links = Array.from(
      document.querySelectorAll("#pills .pillmenu a.pill"),
    );
    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    function setActiveById(id) {
      links.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`),
      );
    }

    function currentSectionId() {
      const headerH = header ? header.offsetHeight : 0;
      const pillsH = pillsBar ? pillsBar.offsetHeight : 0;
      const offset = headerH + pillsH + 8;
      const y = window.scrollY + offset + 1;
      let current = sections[0]?.id || "";
      for (const sec of sections) {
        if (sec.offsetTop <= y) current = sec.id;
        else break;
      }
      return current;
    }

    function updateActive() {
      const id = currentSectionId();
      if (id) setActiveById(id);

      // Band 2 (Collections) colour mode
      document.body.classList.toggle("is-band-2", id === "selected-work");
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
  })();

  /* --------------------------------------------------------------------------
   * PROJECTS PAGE — TOGGLE DARK MODE WHEN SCROLLING THROUGH .projects-band
   * -------------------------------------------------------------------------- */
  (function () {
    const band = document.querySelector(".projects-band");
    if (!band) return; // not on projects page

    const header = document.getElementById("siteHeader");
    const pillsBar = document.getElementById("pills");

    function inBand() {
      const headerH = header ? header.offsetHeight : 0;
      const pillsH = pillsBar ? pillsBar.offsetHeight : 0;
      const offset = headerH + pillsH + 8;

      const y = window.scrollY + offset + 1;
      const top = band.offsetTop;
      const bottom = top + band.offsetHeight;

      return y >= top && y < bottom;
    }

    function update() {
      document.body.classList.toggle("is-projects-band", inBand());
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  })();

  /* --------------------------------------------------------------------------
   * FLOATING NAV PILL — SIMPLE BURGER TOGGLE (BREAKPOINT HANDLED IN CSS)
   * -------------------------------------------------------------------------- */
  (function () {
    const nav = document.getElementById("floatingNavPill");
    if (!nav) return;

    const navToggle = nav.querySelector(".pillmenu-toggle");
    if (!navToggle) return;

    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
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
