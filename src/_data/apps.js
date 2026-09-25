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
    // The publisher details on the privacy policy and terms were changed on this date.
    pageLastUpdated: {
      privacy: "25 September 2026",
      terms: "25 September 2026",
    },
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
  // Launch-dependent copy. Three strings on this site stop being true the day
  // ProcureCore is listed on the App Store: "ProcureCore is coming soon." on
  // /apps/procurecore/, the two "Coming soon" strings on the home page, and
  // "currently in development and releasing on the Apple App Store" on
  // /company-information/. They are correct today. They are tracked in the
  // ProcureCore application repository, in POST_RELEASE_WEBSITE_CHECKLIST.md,
  // which is where the launch sequence that changes them lives — not here.
  //
  // If you are editing this entry because ProcureCore has been released, those
  // three strings are the change, and the site must not sit half-launched with
  // one page saying "coming soon" while another links to a live listing.
  //
  // A fourth string was removed on 2026-08-13 (commit d5b5689): an unrendered
  // `platform` value that would have published an availability claim if this
  // entry's `information` array were ever emptied. `platform` remains a live
  // field for Curiosity Tracker — see app-pages.njk:57.
  {
    name: "ProcureCore",
    slug: "procurecore",
    eyebrow: "Procurement",
    description:
      "A calm procurement and studio collaboration workspace for interior designers, available across iPhone and Mac.",
    overview:
      "ProcureCore brings projects, clients, suppliers, products, placements, approvals, attachments, and reporting into one considered workspace for interior-design studios.",
    lastUpdated: "28 July 2026",
    pageLastUpdated: {
      privacy: "13 August 2026",
      terms: "12 August 2026",
      support: "12 August 2026",
      "data-processing": "12 August 2026",
    },
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
    summaryInclude: "apps/procurecore-summary.njk",
    appStoreUrl: "",
    supportPages: ["privacy", "terms", "support", "data-processing"],
    pageTitles: {
      terms: "Terms of Use",
      "data-processing": "Data Processing Schedule",
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
      "data-processing": {
        title: "ProcureCore Data Processing Schedule — Curated Design",
        description:
          "The data processing schedule forming part of the ProcureCore Terms of Use, covering roles, instructions, sub-processors, security, deletion, and international transfers.",
      },
    },
  },
  // The name is lowercase by design, including at the start of a sentence.
  // No App Store badge or link until there is a real listing URL: leave
  // appStoreUrl empty and the information list free of availability claims.
  {
    name: "concinnity",
    slug: "concinnity",
    eyebrow: "Daily planning",
    description:
      "A native daily planner for iPhone, iPad, and Mac that brings tasks, calendar events, and focus sessions into one calm view of the day.",
    overview:
      "concinnity is a daily planner for capturing tasks, planning days and weeks, seeing calendar events alongside planned work, and making time for focused sessions.",
    lastUpdated: "24 September 2026",
    information: [
      {
        label: "Platform",
        value: "iPhone, iPad, and Mac",
      },
      {
        label: "Storage and sync",
        value: "Works offline and stores data on your device, with optional iCloud sync",
      },
      {
        label: "Calendar",
        value: "Optional, with your permission",
      },
      {
        label: "Privacy",
        value: "No advertising, tracking, or third-party analytics",
      },
      {
        label: "Support",
        value: supportEmail,
        url: supportEmailUrl,
      },
    ],
    highlights: [
      "Capture tasks as they come up, and keep them organised with projects, tags, and notes.",
      "Plan your days and weeks, with calendar events shown alongside the work you have planned.",
      "Schedule focus sessions, and keep the day in view with widgets and Live Activities.",
    ],
    summaryInclude: "apps/concinnity-summary.njk",
    appStoreUrl: "",
    supportPages: ["privacy", "support"],
    metaTitle: "concinnity — Daily Planner for iPhone, iPad and Mac",
    metaDescription:
      "concinnity is a native daily planner for iPhone, iPad, and Mac. Capture tasks, plan days and weeks alongside your calendar, and schedule focus sessions. No ads, no tracking, no analytics.",
    pageMeta: {
      privacy: {
        title: "concinnity Privacy Policy — Curated Design",
        description:
          "How concinnity handles your planner data: stored on your device, optionally synced through your private iCloud database, with no advertising, tracking, analytics, or Curated Design server.",
      },
      support: {
        title: "concinnity Support — Curated Design",
        description:
          "Help with concinnity: getting started, calendar access, iCloud sync, notifications, widgets, Live Activities, and how to report a problem.",
      },
    },
  },
  // Written CuratedLedger: one word, capital C and L. iPhone and iPad only. It has no
  // in-app sync switch, widgets, Siri or Shortcuts, calendar access, or Mac version,
  // so none of concinnity's copy about those carries over. No App Store badge or
  // link until there is a real listing URL.
  {
    name: "CuratedLedger",
    slug: "curatedledger",
    eyebrow: "Personal finance",
    description:
      "A calm financial planner that shows what is safe to spend, how long your money lasts, and how your estimates compare with what actually happened.",
    overview:
      "CuratedLedger is a personal finance planner for understanding what is safe to spend, how long your money will last, and whether your plans match what actually happens.",
    lastUpdated: "25 September 2026",
    information: [
      {
        label: "Platform",
        value: "iPhone and iPad",
      },
      {
        label: "Storage and sync",
        value: "Stores data on your device, with iCloud sync through your private iCloud database",
      },
      {
        label: "Statement import",
        value: "Optional; CSV files are read on your device",
      },
      {
        label: "Privacy",
        value: "No advertising, tracking, or third-party analytics",
      },
      {
        label: "Support",
        value: supportEmail,
        url: supportEmailUrl,
      },
    ],
    highlights: [
      "See what is safe to spend, after bills, debts, tax set aside and your safety buffer.",
      "Plan recurring costs, irregular expenses and income on a timeline of the year ahead, across lifestyle modes from bare bones to comfortable.",
      "Check in weekly with your balances and spending, import bank and card statements, and compare your estimates with what actually happened.",
    ],
    summaryInclude: "apps/curatedledger-summary.njk",
    appStoreUrl: "",
    supportPages: ["privacy", "support"],
    metaTitle: "CuratedLedger — Personal Finance Planner for iPhone and iPad",
    metaDescription:
      "CuratedLedger is a personal finance planner for iPhone and iPad. See what is safe to spend, plan the year ahead, import statements, and compare estimates with what actually happened. No ads, no tracking, no analytics.",
    pageMeta: {
      privacy: {
        title: "CuratedLedger Privacy Policy — Curated Design",
        description:
          "How CuratedLedger handles your financial information: stored on your device, synced through your private iCloud database, statements read on your device, with no advertising, tracking, analytics, or Curated Design server.",
      },
      support: {
        title: "CuratedLedger Support — Curated Design",
        description:
          "Help with CuratedLedger: getting started, importing statements, iCloud sync, check-in reminders, exports, and how to report a problem.",
      },
    },
  },
  // iPhone and iPad only. Apple Health access is read-only (workouts) and off until the
  // user connects it; the privacy policy's Apple Health section is checked by App Review.
  // No App Store badge or link until there is a real listing URL.
  {
    name: "Mythos Log",
    slug: "mythos-log",
    eyebrow: "Self-improvement",
    description:
      "A self-improvement app that treats real habits like character training: log effort, build stats, and let a weekly review decide what levels up.",
    overview:
      "Mythos Log treats real habits like stat training. Each skill has a baseline, extra effort becomes charges, and a weekly review is where progress, stagnation, decay and level-ups are resolved.",
    lastUpdated: "25 September 2026",
    information: [
      {
        label: "Support email",
        value: supportEmail,
        url: supportEmailUrl,
      },
      {
        label: "Platform",
        value: "Available on iPhone and iPad (iOS 17 or later)",
      },
      {
        label: "Sync",
        value: "iCloud sync via Apple CloudKit when iCloud is available",
      },
      {
        label: "Health",
        value: "Optional workout import from Apple Health",
      },
      {
        label: "Privacy",
        value: "No ads, no tracking, no analytics",
      },
    ],
    appStoreUrl: "",
    supportPages: ["privacy", "support", "terms"],
    metaTitle: "Mythos Log — Curated Design",
    metaDescription:
      "Mythos Log is a self-improvement app for iPhone and iPad that treats real habits like character training, with weekly reviews that decide what levels up. No ads, no tracking, no analytics.",
    pageMeta: {
      privacy: {
        title: "Mythos Log Privacy Policy — Curated Design",
        description:
          "How Mythos Log handles your data: stored on your device, synced through your private iCloud database, optional read-only workout import from Apple Health, and no ads, tracking, analytics, or Curated Design server.",
      },
      support: {
        title: "Mythos Log Support — Curated Design",
        description:
          "Help with Mythos Log: weekly reviews, connecting Apple Health, workout import, iCloud sync between iPhone and iPad, exporting and deleting data.",
      },
      terms: {
        title: "Mythos Log Terms — Curated Design",
        description:
          "Terms of use for Mythos Log, a self-improvement app from Curated Design — your responsibilities, health and fitness notice, app availability, and support contact details.",
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
      pageLastUpdated: (app.pageLastUpdated && app.pageLastUpdated[kind]) || null,
    })),
  ),
};
