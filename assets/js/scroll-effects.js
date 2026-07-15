// Scroll effects: background parallax and pill-menu section tracking, driven
// by one shared requestAnimationFrame scheduler so scrolling never runs two
// competing rAF pipelines. Split from main.js (P2.4); kept together
// deliberately rather than as two fully separate initialisers — see the
// scheduler comment below.
(function () {
  const header = document.getElementById("siteHeader");
  const pillsBar = document.getElementById("pills");
  const links = Array.from(
    document.querySelectorAll("#pills .pillmenu a.pill"),
  );

  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

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
  };
  let activeSectionId = "";
  let isLightThemeActive = null;
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
    [header, pillsBar, ...sections].forEach((el) => el && ro.observe(el));
  }
})();
