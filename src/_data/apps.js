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
    metaTitle: "Curiosity Tracker — Curated Design",
    metaDescription:
      "Curiosity Tracker is a personal iOS app for capturing questions, organising curiosities, and resurfacing ideas over time. No ads, no tracking, no analytics.",
    pageMeta: {
      privacy: {
        title: "Curiosity Tracker Privacy Policy — Curated Design",
        description:
          "How Curiosity Tracker handles your data. Content is stored locally on your device, and — when iCloud is enabled — synced through your own private iCloud database. Curated Design does not operate a server that receives or stores your content.",
      },
      support: {
        title: "Curiosity Tracker Support — Curated Design",
        description:
          "Help with Curiosity Tracker: iCloud sync, PDFs, notifications, deleting data, and contact details for Curated Design.",
      },
      terms: {
        title: "Curiosity Tracker Terms — Curated Design",
        description:
          "Terms of use for Curiosity Tracker, a personal organisation tool from Curated Design — your responsibilities, app availability, and support contact details.",
      },
    },
  },
  {
    name: "ProcureCore",
    slug: "procurecore",
    eyebrow: "Procurement",
    description:
      "A calm procurement and studio collaboration workspace for interior designers, available across iPhone and Mac.",
    overview:
      "ProcureCore brings projects, clients, suppliers, products, placements, approvals, attachments, and reporting into one considered workspace for interior-design studios.",
    platform: "Coming soon to the App Store · iPhone and Mac",
    lastUpdated: "26 July 2026",
    information: [
      {
        label: "Platform",
        value: "iOS and macOS",
      },
      {
        label: "Account and sync",
        value: "A ProcureCore account with secure cloud synchronisation",
      },
      {
        label: "Collaboration",
        value: "Owner, admin, member, and read-only viewer roles",
      },
      {
        label: "Privacy",
        value: "No advertising or cross-app tracking",
      },
      {
        label: "Subscriptions",
        value: "Some features require an auto-renewing App Store subscription",
      },
      {
        label: "Support",
        value: supportEmail,
        url: supportEmailUrl,
      },
    ],
    highlights: [
      "Plan and track projects, clients, suppliers, products, placements, approvals, and procurement status.",
      "Keep images, project covers, studio branding, file attachments, notes, and reporting with the work they support.",
      "Collaborate across iPhone and Mac with permissions appropriate to each studio member.",
    ],
    appStoreUrl: "",
    supportPages: ["privacy", "terms", "support"],
    pageTitles: {
      terms: "Terms of Use",
    },
    metaTitle: "ProcureCore — Procurement for Interior-Design Studios",
    metaDescription:
      "ProcureCore is a calm procurement and collaboration workspace for interior-design studios, with secure account-based sync across iPhone and Mac.",
    pageMeta: {
      privacy: {
        title: "ProcureCore Privacy Policy — Curated Design",
        description:
          "How ProcureCore handles account, workspace, subscription, import, and optional AI information across its iOS, macOS, and cloud services.",
      },
      support: {
        title: "ProcureCore Support — Curated Design",
        description:
          "Help with ProcureCore accounts, studio access, cloud sync, product imports, attachments, subscriptions, AI, and account deletion.",
      },
      terms: {
        title: "ProcureCore Terms of Use — Curated Design",
        description:
          "Terms of Use for ProcureCore, covering accounts, studio workspaces, subscriptions, imported content, optional AI, and responsible professional use.",
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
      title: (app.pageTitles && app.pageTitles[kind]) || titleByKind[kind] || kind,
      meta: (app.pageMeta && app.pageMeta[kind]) || null,
    })),
  ),
};
