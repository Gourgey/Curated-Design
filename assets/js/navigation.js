// Navigation: pill-menu anchor scrolling, the floating overlay menu, and the
// compact pill menu toggle used under 900px. Split from main.js (P2.4).
window.addEventListener("DOMContentLoaded", () => {
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
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
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
    const menu = nav.querySelector("#floatingPillMenu");
    if (!navToggle || !menu) return;

    const siteHeader = nav.closest("header");
    const logo = siteHeader && siteHeader.querySelector(".top-left-logo");
    let inertTargets = [];

    function setBackgroundInert(isInert) {
      if (isInert) {
        inertTargets = Array.from(document.body.children).filter(
          (child) => child !== siteHeader && child.tagName !== "SCRIPT",
        );
        inertTargets.forEach((child) => {
          child.dataset.navWasInert = child.inert ? "true" : "false";
          child.inert = true;
        });
        if (logo) logo.inert = true;
        return;
      }

      inertTargets.forEach((child) => {
        child.inert = child.dataset.navWasInert === "true";
        delete child.dataset.navWasInert;
      });
      inertTargets = [];
      if (logo) logo.inert = false;
    }

    function focusableMenuItems() {
      return Array.from(menu.querySelectorAll("a[href], button:not([disabled])")).filter(
        (item) => item.getClientRects().length > 0,
      );
    }

    function closeNav({ restoreFocus = false } = {}) {
      const wasOpen = nav.classList.contains("is-open");
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open primary menu");
      document.body.classList.remove("nav-open");
      setBackgroundInert(false);
      if (wasOpen && restoreFocus) navToggle.focus();
    }

    function openNav() {
      nav.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close primary menu");
      document.body.classList.add("nav-open");
      setBackgroundInert(true);
      window.requestAnimationFrame(() => {
        const [firstItem] = focusableMenuItems();
        if (firstItem) firstItem.focus();
      });
    }

    navToggle.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) closeNav({ restoreFocus: true });
      else openNav();
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNav();
    });

    nav.addEventListener("click", (event) => {
      if (event.target === nav && nav.classList.contains("is-open")) {
        closeNav({ restoreFocus: true });
      }
    });

    nav.addEventListener("keydown", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeNav({ restoreFocus: true });
        return;
      }
      if (event.key !== "Tab") return;

      const items = [navToggle, ...focusableMenuItems()];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
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
