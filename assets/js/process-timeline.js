// The timeline follows the viewport until a visitor chooses a stage.
window.addEventListener("DOMContentLoaded", () => {
  const timeline = document.querySelector("[data-process-timeline]");
  if (!timeline) return;

  const steps = Array.from(timeline.querySelectorAll(".process-timeline__step"));
  const sectionMenu = document.getElementById("pills");
  const buttons = steps.map((step) => step.querySelector("button"));
  const count = timeline.querySelector("[data-process-count]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = -1;
  let manualSelection = false;
  let framePending = false;

  function activate(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    steps.forEach((step, stepIndex) => {
      const active = index === stepIndex;
      step.classList.toggle("is-active", active);
      buttons[stepIndex].setAttribute("aria-expanded", String(active));
      step.querySelector(".process-timeline__detail").inert = !active;
    });
    timeline.style.setProperty("--process-progress", (index + 1) / steps.length);
    count.textContent = [index + 1, steps.length]
      .map((number) => String(number).padStart(2, "0"))
      .join(" / ");
  }

  function syncScroll() {
    framePending = false;
    const { top, bottom } = timeline.getBoundingClientRect();
    if (bottom <= 0 || top >= window.innerHeight) {
      manualSelection = false;
      return;
    }
    if (manualSelection || reducedMotion.matches || timeline.contains(document.activeElement)) return;

    const menuBottom = parseFloat(getComputedStyle(sectionMenu).top) + sectionMenu.offsetHeight;
    const lead = Math.min(window.innerHeight * 0.22, 200);
    const stageDistance = Math.max(88, Math.min(window.innerHeight * 0.12, 112));
    const firstDivider = steps[0].getBoundingClientRect().top;
    const distance = menuBottom + lead - firstDivider;

    // Base the triggers on the first divider so expanding a row cannot move them.
    const index = Math.min(steps.length - 1, Math.max(0, 1 + Math.floor(distance / stageDistance)));
    activate(index);
  }

  function scheduleScrollSync() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(syncScroll);
  }

  buttons.forEach((button, index) => {
    button.disabled = false;
    button.addEventListener("click", () => {
      manualSelection = true;
      activate(index);
    });
  });

  activate(0);
  timeline.classList.add("is-enhanced");
  window.addEventListener("scroll", scheduleScrollSync, { passive: true });
  window.addEventListener("resize", scheduleScrollSync);
  reducedMotion.addEventListener("change", scheduleScrollSync);
  scheduleScrollSync();
});
