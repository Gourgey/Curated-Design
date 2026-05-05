const lastUpdated = "29 April 2026";
const supportEmail = "info@curateddesign.studio";
const supportEmailUrl = `mailto:${supportEmail}`;

const items = [
  {
    name: "Curiosity Tracker",
    slug: "curiosity-tracker",
    eyebrow: "Personal research",
    description:
      "A personal app for capturing questions, organising curiosities, and resurfacing ideas over time.",
    overview:
      "Curiosity Tracker is a quiet place to hold questions, notes, links, PDFs, tags, and resurfacing dates so ideas can return at the right moment.",
    platform: "Available on iOS",
    sync: "Optional iCloud sync via Apple CloudKit",
    privacySummary: "No ads, no tracking, no analytics",
    appStoreUrl: "",
  },
];

const supportPages = ["privacy", "support", "terms"];

module.exports = {
  lastUpdated,
  supportEmail,
  supportEmailUrl,
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
