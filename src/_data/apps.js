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
    supportPages: ["privacy", "support", "terms"],
  },
  {
    name: "ProcureCore",
    slug: "procurecore",
    eyebrow: "Procurement",
    description:
      "A procurement organiser for interior designers, holding projects, styles, areas, suppliers, products, and placements together.",
    overview:
      "ProcureCore is a calmer place to keep procurement organised — projects, styles, areas, suppliers, products, and placements held together so a studio can work from one source of truth.",
    platform: "Coming soon to the App Store · iOS and macOS",
    sync: "Optional iCloud sync via Apple CloudKit",
    privacySummary: "No ads, no tracking, no analytics, no third-party SDKs",
    appStoreUrl: "",
    supportPages: ["privacy", "support"],
    metaTitle: "ProcureCore — Curated Design",
    metaDescription:
      "ProcureCore is a procurement organiser for interior designers. Track projects, styles, areas, suppliers, products, and placements in one calm, considered workspace. Coming soon to the App Store.",
    pageMeta: {
      privacy: {
        title: "ProcureCore Privacy Policy — Curated Design",
        description:
          "How ProcureCore handles your data. ProcureCore stores your work locally on your device, and — when iCloud is enabled — in your own private iCloud database. Curated Design Limited does not operate a server that receives or stores ProcureCore content.",
      },
      support: {
        title: "ProcureCore Support — Curated Design",
        description:
          "Help with ProcureCore: iCloud sync, product import, missing data, and contact details for Curated Design Limited.",
      },
    },
  },
];

const defaultSupportPages = ["privacy", "support", "terms"];

const titleByKind = {
  privacy: "Privacy Policy",
  support: "Support",
  terms: "Terms",
};

module.exports = {
  lastUpdated,
  supportEmail,
  supportEmailUrl,
  items,
  pages: items.flatMap((app) =>
    (app.supportPages || defaultSupportPages).map((kind) => ({
      kind,
      app,
      title: titleByKind[kind] || kind,
      meta: (app.pageMeta && app.pageMeta[kind]) || null,
    })),
  ),
};
