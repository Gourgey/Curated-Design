const lastUpdated = "29 April 2026";
const supportEmailPlaceholder = "TODO support/privacy email";
const appStoreUrlPlaceholder = "TODO App Store URL";

const items = [
  {
    name: "Curiosity Tracker",
    slug: "curiosity-tracker",
    eyebrow: "Personal research",
    description:
      "A personal app for capturing questions, organising curiosities, and resurfacing ideas over time.",
    overview:
      "Curiosity Tracker is a quiet place to hold questions, notes, links, PDFs, tags, and resurfacing dates so ideas can return at the right moment.",
  },
  {
    name: "ProcureCore",
    slug: "procurecore",
    eyebrow: "Project procurement",
    description:
      "A procurement-focused tool for interior design projects, products, suppliers, rooms, and placements.",
    overview:
      "ProcureCore is being prepared as a focused tool for managing procurement detail across interior design projects.",
  },
  {
    name: "ArcLog",
    slug: "arclog",
    eyebrow: "Progress logging",
    description:
      "A personal progress and skills-tracking app for logging sessions and visualising growth over time.",
    overview:
      "ArcLog is being prepared as a personal record for sessions, practice, skills, and visible progress over time.",
  },
];

const supportPages = ["privacy", "support", "terms"];

module.exports = {
  lastUpdated,
  supportEmailPlaceholder,
  appStoreUrlPlaceholder,
  items,
  pages: items.flatMap((app) =>
    supportPages.map((kind) => ({
      kind,
      app,
      title:
        kind === "privacy"
          ? "Privacy Policy"
          : kind === "support"
            ? "Support"
            : "Terms",
    })),
  ),
};
