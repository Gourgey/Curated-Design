// All page behavior moved here from index.html
window.addEventListener("DOMContentLoaded", () => {
  /* --------------------------------------------------------------------------
   * PARALLAX BACKGROUND
   * -------------------------------------------------------------------------- */
  (function () {
    const img = document.getElementById("bgImg");
    if (!img) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lowMemory =
      typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;

    if (prefersReducedMotion || lowMemory) return; // no parallax

    const speed = 0.4;
    const scale = 1.12;

    let raf = 0;
    function update() {
      raf = 0;
      const y = window.scrollY;
      img.style.transform = `translate3d(0, ${-y * speed}px, 0) scale(${scale})`;
    }

    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
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

// ===== RAF-BASED SCROLL HANDLER (cached metrics; avoids layout reads on scroll) =====
(function () {
  const header = document.getElementById("siteHeader");
  const pillsBar = document.getElementById("pills");
  const links = Array.from(
    document.querySelectorAll("#pills .pillmenu a.pill"),
  );

  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const band = document.querySelector(".projects-band");

  // If this page has no pill menu, bail early
  if (!links.length || !sections.length) return;

  const metrics = {
    offset: 0,
    sectionTops: [],
    sectionIds: [],
    bandTop: null,
    bandBottom: null,
  };

  function setActiveById(id) {
    links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${id}`),
    );
  }

  function measure() {
    // Heights (use rects; avoid offsetHeight surprises)
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const pillsH = pillsBar ? pillsBar.getBoundingClientRect().height : 0;
    metrics.offset = headerH + pillsH + 8;

    // Cache section top positions in document coordinates
    metrics.sectionTops = sections.map(
      (sec) => sec.getBoundingClientRect().top + window.scrollY,
    );
    metrics.sectionIds = sections.map((sec) => sec.id);

    // Cache projects band range
    if (band) {
      const r = band.getBoundingClientRect();
      const top = r.top + window.scrollY;
      metrics.bandTop = top;
      metrics.bandBottom = top + r.height;
    } else {
      metrics.bandTop = null;
      metrics.bandBottom = null;
    }
  }

  function sectionIdAt(y) {
    const tops = metrics.sectionTops;
    const ids = metrics.sectionIds;
    if (!tops.length) return "";

    // Binary search: last section whose top <= y
    let lo = 0;
    let hi = tops.length - 1;
    let ans = 0;

    if (y < tops[0]) return ids[0] || "";

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (tops[mid] <= y) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ids[ans] || "";
  }

  let ticking = false;
  function update() {
    const y = window.scrollY + metrics.offset + 1;

    // Active pill highlight
    const id = sectionIdAt(y);
    if (id) setActiveById(id);

    // Projects-band colour mode
    if (band && metrics.bandTop != null && metrics.bandBottom != null) {
      document.body.classList.toggle(
        "is-projects-band",
        y >= metrics.bandTop && y < metrics.bandBottom,
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

  // Throttled re-measure (so resize/fonts/images don’t spam measure calls)
  let measureScheduled = false;
  function scheduleMeasure() {
    if (measureScheduled) return;
    measureScheduled = true;
    requestAnimationFrame(() => {
      measure();
      update();
      measureScheduled = false;
    });
  }

  // Initial
  scheduleMeasure();

  // Scroll just updates (no layout reads)
  window.addEventListener("scroll", onScroll, { passive: true });

  // Re-measure when layout might change
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("load", scheduleMeasure);

  // Fonts can shift layout after first paint
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure).catch(() => {});
  }

  // Optional-but-good: catch dynamic size changes (images loading, menu opening, etc.)
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => scheduleMeasure());
    [header, pillsBar, band, ...sections].forEach((el) => el && ro.observe(el));
  }
})();
