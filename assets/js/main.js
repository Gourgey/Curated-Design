// All page behavior moved here from index.html
window.addEventListener("DOMContentLoaded", () => {
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
        dot.className = i === 0 ? "active" : "";
        dot.setAttribute("aria-label", "Go to project image " + (i + 1));
        dot.addEventListener("click", () => go(i));
        dotsWrap.appendChild(dot);
      });

      function go(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = "translateX(" + -index * 100 + "%)";
        Array.from(dotsWrap.children).forEach((dot, dotIndex) => {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      prev.addEventListener("click", () => go(index - 1));
      next.addEventListener("click", () => go(index + 1));
    });
  })();

  /* --------------------------------------------------------------------------
   * PILL MENU → SECTION SCROLL (generic in-page anchors)
   * -------------------------------------------------------------------------- */
  (function () {
    const pills = document.querySelectorAll(
      "#pills a.pill, #pillsPanel a.pill",
    );

    function scrollToHash(hash) {
      const el = document.querySelector(hash);
      if (!el) return;

      // Scroll to the section's exact document top so the viewport aligns
      // precisely with the target section in Chrome and Safari.
      const y = Math.round(el.getBoundingClientRect().top + window.scrollY);
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

// ===== UNIFIED RAF-BASED SCROLL HANDLER =====
// One scheduler drives both parallax + section tracking to avoid multiple
// per-scroll RAF pipelines competing for frame time.
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
  const bgImg = document.getElementById("bgImg");
  const hero = document.querySelector(".hero");
  const heroBrand = document.querySelector(".hero-brand");
  const body = document.body;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lowMemory =
    typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const parallaxEnabled = Boolean(bgImg) && !prefersReducedMotion && !lowMemory;
  const hasPillTracking = links.length > 0 && sections.length > 0;

  if (!hasPillTracking && !parallaxEnabled) return;

  const parallax = {
    speed: 0.4,
    scale: 1.08,
    maxTranslate: 0,
    willChangeTimer: 0,
    movingClass: "is-parallax-active",
    currentTravel: null,
    currentScale: null,
    stopScrollY: 0,
  };

  const metrics = {
    offset: 0,
    sectionTops: [],
    sectionIds: [],
    sectionThemes: [],
    bandTop: null,
    bandBottom: null,
  };
  let activeSectionId = "";
  let isLightThemeActive = null;
  let isProjectsBandActive = null;
  const isChromeLike = (() => {
    const uaData = navigator.userAgentData;
    if (uaData && Array.isArray(uaData.brands)) {
      return uaData.brands.some((brand) =>
        /Chrom(e|ium)/i.test(brand.brand),
      );
    }

    const ua = navigator.userAgent || "";
    const vendor = navigator.vendor || "";
    return (
      /Chrome|Chromium/i.test(ua) &&
      !/Edg|OPR|Opera|Brave/i.test(ua) &&
      /Google/i.test(vendor)
    );
  })();
  let chromeScrollTimer = 0;

  function setActiveById(id) {
    if (id === activeSectionId) return;
    activeSectionId = id;
    links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${id}`),
    );
  }

  function touchParallaxWillChange() {
    if (!parallaxEnabled) return;
    if (!bgImg.classList.contains(parallax.movingClass)) {
      bgImg.classList.add(parallax.movingClass);
    }
    window.clearTimeout(parallax.willChangeTimer);
    // Keep will-change temporary so Chrome can release compositor memory
    // once scrolling settles.
    parallax.willChangeTimer = window.setTimeout(() => {
      bgImg.classList.remove(parallax.movingClass);
    }, 150);
  }

  function updateParallax(scrollY) {
    if (!parallaxEnabled) return;
    // Cap travel to avoid very large translate values that can trigger
    // fixed-layer jitter on some Chrome/GPU combinations.
    const effectiveScroll = Math.min(scrollY, parallax.stopScrollY);
    const travel = Math.min(
      effectiveScroll * parallax.speed,
      parallax.maxTranslate,
    );
    const scale = Number.isFinite(parallax.scale) ? parallax.scale : 1;
    if (travel === parallax.currentTravel && scale === parallax.currentScale) {
      return;
    }
    parallax.currentTravel = travel;
    parallax.currentScale = scale;
    bgImg.style.transform = `translate3d(0, ${-travel}px, 0) scale(${scale})`;
    touchParallaxWillChange();
  }

  function measure() {
    if (hasPillTracking) {
      // Heights (use rects; avoid offsetHeight surprises)
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const pillsH = pillsBar ? pillsBar.getBoundingClientRect().height : 0;
      metrics.offset = headerH + pillsH + 8;

      // Cache section top positions in document coordinates
      metrics.sectionTops = sections.map(
        (sec) => sec.getBoundingClientRect().top + window.scrollY,
      );
      metrics.sectionIds = sections.map((sec) => sec.id);
      metrics.sectionThemes = sections.map(
        (sec) => sec.getAttribute("data-theme") || "dark",
      );

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

    if (parallaxEnabled) {
      const heroBottomSource = pillsBar || hero || heroBrand;
      const heroBottom = heroBottomSource
        ? heroBottomSource.getBoundingClientRect().bottom + window.scrollY
        : window.innerHeight;
      parallax.stopScrollY = Math.max(1, Math.round(heroBottom));

      // Keep travel below the 130vh background headroom so fixed parallax
      // never exposes image edges while reducing compositor work.
      const safeMaxTranslate = Math.max(
        24,
        Math.min(180, Math.round(window.innerHeight * 0.18)),
      );
      parallax.maxTranslate = Math.min(
        safeMaxTranslate,
        Math.max(24, Math.round(parallax.stopScrollY * parallax.speed)),
      );
    }
  }

  function sectionIndexAt(y) {
    const tops = metrics.sectionTops;
    if (!tops.length) return -1;
    const lastIdx = tops.length - 1;

    // At document bottom, force the final section to stay active even when
    // there isn't enough remaining scroll range for y to cross its top.
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2
    ) {
      return lastIdx;
    }

    // Binary search: last section whose top <= y
    let lo = 0;
    let hi = lastIdx;
    let ans = 0;

    if (y < tops[0]) return 0;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (tops[mid] <= y) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ans;
  }

  function update() {
    const scrollY = window.scrollY;
    updateParallax(scrollY);

    if (!hasPillTracking) return;

    const y = scrollY + metrics.offset + 1;

    // Active pill highlight
    const idx = sectionIndexAt(y);
    const id = idx >= 0 ? metrics.sectionIds[idx] : "";
    if (id) setActiveById(id);

    // Keep pill/nav text readable against light section backgrounds.
    const isLightTheme =
      idx >= 0 && (metrics.sectionThemes[idx] || "").toLowerCase() === "light";
    if (isLightTheme !== isLightThemeActive) {
      isLightThemeActive = isLightTheme;
      document.body.classList.toggle("pills-on-light", isLightTheme);
      // Backwards compatibility with existing index selectors.
      document.body.classList.toggle("is-band-2", isLightTheme);
    }

    // Projects-band colour mode
    if (band && metrics.bandTop != null && metrics.bandBottom != null) {
      const inProjectsBand = y >= metrics.bandTop && y < metrics.bandBottom;
      if (inProjectsBand !== isProjectsBandActive) {
        isProjectsBandActive = inProjectsBand;
        document.body.classList.toggle("is-projects-band", inProjectsBand);
      }
    } else if (isProjectsBandActive !== false) {
      isProjectsBandActive = false;
      document.body.classList.remove("is-projects-band");
    }
  }

  let updateScheduled = false;
  function scheduleUpdate() {
    if (isChromeLike && body) {
      body.classList.add("chrome-scrolling");
      window.clearTimeout(chromeScrollTimer);
      chromeScrollTimer = window.setTimeout(() => {
        body.classList.remove("chrome-scrolling");
      }, 140);
    }

    if (updateScheduled) return;
    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      update();
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
  window.addEventListener("scroll", scheduleUpdate, { passive: true });

  // Re-measure when layout might change
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("load", scheduleMeasure);

  // Fonts can shift layout after first paint
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure).catch(() => {});
  }

  // Optional-but-good: catch dynamic size changes (images loading, menu opening, etc.)
  if (hasPillTracking && "ResizeObserver" in window) {
    const ro = new ResizeObserver(() => scheduleMeasure());
    [header, pillsBar, band, ...sections].forEach((el) => el && ro.observe(el));
  }
})();
