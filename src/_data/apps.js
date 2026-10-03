const fs = require("fs");
const path = require("path");

// How-to guides, written as Markdown in src/_includes/apps/guides/<slug>.md
// and published at /apps/<slug>/guide/. Returns "" for an app with no guide.
function readGuide(slug) {
  const file = path.join(__dirname, "..", "_includes", "apps", "guides", `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

const lastUpdated = "29 April 2026";
const supportEmail = "info@curateddesign.studio";
const supportEmailUrl = `mailto:${supportEmail}`;

const items = [
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
    // Mac window screenshots for the /apps/ showcase, shown as stacked windows
    // rather than phones; the first is shown front and centre.
    screenshotLayout: "desktop",
    screenshots: [
      { src: "/assets/images/app_screenshots/procurecore/01-dashboard.webp", alt: "ProcureCore dashboard with what needs action today and each project's budget by style" },
      { src: "/assets/images/app_screenshots/procurecore/02-projects.webp", alt: "ProcureCore projects view with photographed project cards" },
      { src: "/assets/images/app_screenshots/procurecore/04-product-library.webp", alt: "ProcureCore product library showing retail and trade prices and lead times" },
    ],
    eyebrow: "Procurement",
    description:
      "A calm procurement and studio collaboration workspace for interior designers, available across iPhone and Mac.",
    overview:
      "ProcureCore brings projects, clients, suppliers, products, placements, approvals, attachments, and reporting into one considered workspace for interior-design studios.",
    lastUpdated: "28 July 2026",
    pageLastUpdated: {
      privacy: "29 September 2026",
      terms: "29 September 2026",
      support: "29 September 2026",
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
    guide: readGuide("procurecore"),
    supportPages: ["guide", "privacy", "terms", "support", "data-processing"],
    pageTitles: {
      terms: "Terms of Use",
      "data-processing": "Data Processing Schedule",
    },
    // Schema.org SoftwareApplication fields for the app page's structured data.
    applicationCategory: "BusinessApplication",
    operatingSystem: "iOS, macOS",
    // Shown as a visible FAQ on /apps/procurecore/ and mirrored as FAQPage
    // structured data. Do not add an availability answer here: "coming soon"
    // is launch-dependent copy (see the note at the top of this array).
    faqs: [
      {
        q: "What is ProcureCore?",
        a: "ProcureCore is a procurement and studio collaboration app for interior designers. It brings projects, clients, suppliers, products, placements, approvals, attachments, and reporting into one workspace across iPhone and Mac.",
      },
      {
        q: "Who is ProcureCore for?",
        a: "Interior-design studios and interior designers who specify furniture, lighting, finishes, and other products for client projects, and want one place to track each item from specification and client approval through to procurement status.",
      },
      {
        q: "Who makes ProcureCore?",
        a: "ProcureCore is made by Curated Design, a London interior design studio. It was developed alongside the studio's own design and procurement work.",
      },
      {
        q: "Can my whole studio use it?",
        a: "Yes. A studio workspace can have owners, admins, members, and read-only viewers, each with permissions appropriate to their role. Secure account-based cloud synchronisation keeps authorised studio members up to date across iPhone and Mac.",
      },
      {
        q: "Can I import products from supplier websites?",
        a: "Yes. ProcureCore can suggest a product's name, price, images, dimensions, and other details from a supplier website. Supplier websites vary, so review every suggested field before saving. The product library keeps retail and trade prices and lead times together.",
      },
      {
        q: "Does ProcureCore use AI?",
        a: "Only if you choose to. The Studio Pro AI assistant is optional. Client names, placement issue notes, and tracking references are excluded from it unless you turn on “Include client & notes”, which is off by default.",
      },
      {
        q: "How much does ProcureCore cost?",
        a: "There is a Free plan for up to 3 projects, 30 products, and 1 editor. Studio+ and Studio Pro are auto-renewing App Store subscriptions, monthly or annual, with higher limits, unlimited read-only viewers, and your studio name on exports; Studio Pro adds the AI assistant and includes a 7-day free trial. Apple shows the current price in the app before purchase.",
      },
      {
        q: "Does ProcureCore show adverts or track me?",
        a: "No. ProcureCore has no advertising or cross-app tracking.",
      },
    ],
    metaTitle: "ProcureCore — Procurement for Interior-Design Studios",
    metaDescription:
      "ProcureCore is a calm procurement and collaboration workspace for interior-design studios, with secure account-based sync across iPhone and Mac.",
    pageMeta: {
      guide: {
        title: "How to Use ProcureCore — Curated Design",
        description:
          "How to use ProcureCore: setting up a studio, adding products from a link, placing products, the Procurement Board, budgets, exports, team roles, plans, and the AI assistant.",
      },
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
    // Phone screenshots for the /apps/ showcase; the first is shown front and centre.
    screenshots: [
      { src: "/assets/images/app_screenshots/concinnity/01-today.webp", alt: "concinnity Today view with planned time, a Top 3, and the day timeline" },
      { src: "/assets/images/app_screenshots/concinnity/04-matrix.webp", alt: "concinnity priority matrix" },
      { src: "/assets/images/app_screenshots/concinnity/06-insights.webp", alt: "concinnity insights view" },
    ],
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
    guide: readGuide("concinnity"),
    supportPages: ["guide", "privacy", "support"],
    applicationCategory: "ProductivityApplication",
    operatingSystem: "iOS, iPadOS, macOS",
    faqs: [
      {
        q: "What is concinnity?",
        a: "concinnity is a native daily planner for iPhone, iPad, and Mac. It brings tasks, calendar events, and focus sessions into one calm view of the day.",
      },
      {
        q: "Who is concinnity for?",
        a: "Anyone who wants a single, calm plan for the day: somewhere to capture tasks as they come up, see them next to calendar events, plan days and weeks, and set aside time for focused work.",
      },
      {
        q: "Does concinnity work offline?",
        a: "Yes. concinnity works offline and stores your planner on your device. Optional iCloud sync keeps your iPhone, iPad, and Mac up to date through your own private iCloud database.",
      },
      {
        q: "Does concinnity connect to my calendar?",
        a: "Only if you allow it. With your permission, concinnity shows events from your calendars on its timeline next to your planned work, and it only creates or changes an event when you choose to.",
      },
      {
        q: "Can I see my plan without opening the app?",
        a: "Yes. concinnity offers widgets for the Home Screen and Lock Screen on iPhone and iPad and for the Mac, and Live Activities keep the day in view.",
      },
      {
        q: "Does concinnity track me?",
        a: "No. concinnity has no advertising, tracking, or third-party analytics, and Curated Design cannot see your planner content.",
      },
    ],
    metaTitle: "concinnity — Daily Planner for iPhone, iPad and Mac",
    metaDescription:
      "concinnity is a native daily planner for iPhone, iPad, and Mac. Capture tasks, plan days and weeks alongside your calendar, and schedule focus sessions. No ads, no tracking, no analytics.",
    pageMeta: {
      guide: {
        title: "How to Use concinnity — Curated Design",
        description:
          "How to use concinnity: adding tasks, planning your day, Top 3, projects, focus sessions, calendars, reminders, and sync.",
      },
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
    // Phone screenshots for the /apps/ showcase; the first is shown front and centre.
    screenshots: [
      { src: "/assets/images/app_screenshots/curated_ledger/01-overview.webp", alt: "CuratedLedger overview showing safe to spend, runway if no further income arrives, and what life costs" },
      { src: "/assets/images/app_screenshots/curated_ledger/02-projections.webp", alt: "CuratedLedger projections chart of the balance over the next twelve months" },
      { src: "/assets/images/app_screenshots/curated_ledger/03-money.webp", alt: "CuratedLedger money view with the current balance and recurring expenses" },
    ],
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
    guide: readGuide("curatedledger"),
    supportPages: ["guide", "privacy", "support"],
    applicationCategory: "FinanceApplication",
    operatingSystem: "iOS, iPadOS",
    faqs: [
      {
        q: "What is CuratedLedger?",
        a: "CuratedLedger is a personal finance planner for iPhone and iPad. It shows what is safe to spend, how long your money will last, and how your estimates compare with what actually happened.",
      },
      {
        q: "Who is CuratedLedger for?",
        a: "People who want a forward-looking view of their money rather than a record of past spending, including anyone with irregular income or expenses who needs to know how long their money lasts if no further income arrives.",
      },
      {
        q: "What does “safe to spend” mean?",
        a: "It is what remains after bills, debts, tax set aside, and your safety buffer are accounted for.",
      },
      {
        q: "Can I import bank statements?",
        a: "Yes, optionally. Choose a CSV statement from your bank or card provider and CuratedLedger reads it on your device. It is never uploaded to Curated Design.",
      },
      {
        q: "Is CuratedLedger financial advice?",
        a: "No. CuratedLedger is a planning tool. Its figures are estimates based on what you enter.",
      },
      {
        q: "Who can see my financial information?",
        a: "Only you. CuratedLedger keeps your ledger on your device and syncs through your own private iCloud database. It has no advertising, tracking, or third-party analytics, and Curated Design cannot see your financial information.",
      },
    ],
    metaTitle: "CuratedLedger — Personal Finance Planner for iPhone and iPad",
    metaDescription:
      "CuratedLedger is a personal finance planner for iPhone and iPad. See what is safe to spend, plan the year ahead, import statements, and compare estimates with what actually happened. No ads, no tracking, no analytics.",
    pageMeta: {
      guide: {
        title: "How to Use CuratedLedger — Curated Design",
        description:
          "How to use CuratedLedger: income and costs, safe to spend, projections, weekly check-ins, importing statements, profiles, and exports.",
      },
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
    // Phone screenshots for the /apps/ showcase; the first is shown front and centre.
    screenshots: [
      { src: "/assets/images/app_screenshots/mythos_log/01-dashboard.webp", alt: "Mythos Log dashboard with skill rings for creativity, focus, strength and more" },
      { src: "/assets/images/app_screenshots/mythos_log/04-weekly-review.webp", alt: "Mythos Log weekly review" },
      { src: "/assets/images/app_screenshots/mythos_log/02-skill-strength.webp", alt: "Mythos Log strength skill detail" },
    ],
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
    guide: readGuide("mythos-log"),
    supportPages: ["guide", "privacy", "support", "terms"],
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS 17 or later, iPadOS",
    faqs: [
      {
        q: "What is Mythos Log?",
        a: "Mythos Log is a self-improvement app for iPhone and iPad that treats real habits like character training. You log effort against skills such as creativity, focus, and strength, build stats over time, and a weekly review decides what levels up.",
      },
      {
        q: "Who is Mythos Log for?",
        a: "People building habits who enjoy the structure of a role-playing game, with stats and levels, but want progress to come from real effort rather than streaks alone.",
      },
      {
        q: "How does levelling up work?",
        a: "Each skill has a baseline, and extra effort becomes charges. Once a week, the Weekly Review resolves progress, stagnation, decay, and level-ups.",
      },
      {
        q: "Does Mythos Log work with Apple Health?",
        a: "Optionally. Turn on workout import in the app's settings and eligible Strength and Cardio workouts are read from Apple Health. Mythos Log does not delete anything from Apple Health.",
      },
      {
        q: "Which devices does Mythos Log run on?",
        a: "iPhone and iPad running iOS 17 or later. Signing in to the same iCloud account on both keeps them in sync, and Export saves your data to a file you choose.",
      },
      {
        q: "Does Mythos Log track me?",
        a: "No. Mythos Log has no ads, no tracking, and no analytics.",
      },
    ],
    metaTitle: "Mythos Log — Curated Design",
    metaDescription:
      "Mythos Log is a self-improvement app for iPhone and iPad that treats real habits like character training, with weekly reviews that decide what levels up. No ads, no tracking, no analytics.",
    pageMeta: {
      guide: {
        title: "How to Use Mythos Log — Curated Design",
        description:
          "How to use Mythos Log: skills, habits and baselines, logging activity, Charge and ranks, the weekly review, goals, and Apple Health.",
      },
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
  {
    name: "Curiosity Tracker",
    slug: "curiosity-tracker",
    // Phone screenshots for the /apps/ showcase; the first is shown front and centre.
    screenshots: [
      { src: "/assets/images/app_screenshots/curiosity_tracker/01-home.webp", alt: "Curiosity Tracker home screen with an overview of curiosities and a weekly research goal" },
      { src: "/assets/images/app_screenshots/curiosity_tracker/02-library.webp", alt: "Curiosity Tracker library of saved questions, filterable by status" },
      { src: "/assets/images/app_screenshots/curiosity_tracker/03-curiosity.webp", alt: "A single curiosity with its notes, source link, tags and timeline" },
    ],
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
    guide: readGuide("curiosity-tracker"),
    supportPages: ["guide", "privacy", "support", "terms"],
    applicationCategory: "ReferenceApplication",
    operatingSystem: "iOS",
    faqs: [
      {
        q: "What is Curiosity Tracker?",
        a: "Curiosity Tracker is a personal iOS app for capturing questions, organising curiosities, and resurfacing ideas over time.",
      },
      {
        q: "Who is Curiosity Tracker for?",
        a: "Curious people, students, researchers, and lifelong learners who collect questions and ideas and want them to come back at the right moment instead of getting lost in notes.",
      },
      {
        q: "What can I save?",
        a: "Questions, notes, links, PDFs, tags, statuses, dates, and resurfacing prompts. Each curiosity keeps its notes, source link, tags, and timeline together, and the library can be filtered by status.",
      },
      {
        q: "Does Curiosity Tracker sync?",
        a: "Optionally. Content is stored on your device, and when iCloud is enabled it syncs through your own private iCloud database.",
      },
      {
        q: "Does Curiosity Tracker track me?",
        a: "No. Curiosity Tracker has no ads, no tracking, and no analytics.",
      },
    ],
    metaTitle: "Curiosity Tracker — Curated Design",
    metaDescription:
      "Curiosity Tracker is a personal iOS app for capturing questions, organising curiosities, and resurfacing ideas over time. No ads, no tracking, no analytics.",
    pageMeta: {
      guide: {
        title: "How to Use Curiosity Tracker — Curated Design",
        description:
          "How to use Curiosity Tracker: adding curiosities, statuses, saving from other apps, Resurface, Insights, and research goals.",
      },
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
  // iPhone only. No account, server, sync, adverts or analytics. Parking rules are
  // downloaded as data files from a static host (currently GitHub Pages), which the
  // privacy policy names: update that paragraph first if the host ever changes, or if
  // the app starts sending anything else off the device.
  // No screenshots yet, so the /apps/ showcase shows the logo instead. No App Store
  // badge or link until there is a real listing URL.
  {
    name: "Locis",
    slug: "locis",
    logo: "/assets/images/app_logos/locis.svg",
    eyebrow: "Parking",
    description:
      "A free iPhone app that shows whether you can legally park on a UK kerb for your whole stay, using open government data.",
    overview:
      "Locis shows where you can legally park for the whole of your stay. Choose when you will arrive and leave, and the kerbs around your destination are coloured by what the published traffic orders allow: free, paid, permit holders, reserved bays, or not allowed. It is guidance, not a guarantee, and it does not show whether a space is free.",
    lastUpdated: "2 October 2026",
    information: [
      {
        label: "Support",
        value: supportEmail,
        url: supportEmailUrl,
      },
      {
        label: "Platform",
        value: "iPhone (iOS 18 or later)",
      },
      {
        label: "Price",
        value: "Free",
      },
      {
        label: "Coverage",
        value:
          "UK, starting with London. Depends on which councils have published their traffic orders",
      },
      {
        label: "Data",
        value:
          "Department for Transport D-TRO service. Contains public sector information licensed under the Open Government Licence v3.0",
      },
      {
        label: "Privacy",
        value: "No account, adverts, tracking or analytics",
      },
    ],
    // Closing section on the app page and the support page.
    notice:
      "Parking information is provided as guidance. Always check local signs, road markings and temporary restrictions before parking. Curated Design cannot accept responsibility for penalty charges.",
    appStoreUrl: "",
    supportPages: ["privacy", "support"],
    applicationCategory: "TravelApplication",
    operatingSystem: "iOS 18 or later",
    price: "0",
    faqs: [
      {
        q: "What is Locis?",
        a: "Locis is a free iPhone app that shows whether you can legally park on a UK kerb for the whole of your stay, using traffic orders that councils publish through the Department for Transport.",
      },
      {
        q: "How does Locis work?",
        a: "Choose when you will arrive and leave, and the kerbs around your destination are coloured by what the published traffic orders allow for that whole period: free, paid, permit holders, reserved bays, or not allowed.",
      },
      {
        q: "Where does Locis work?",
        a: "In the UK, starting with London. Coverage depends on which councils have published their traffic orders. No coloured line never means parking is unrestricted.",
      },
      {
        q: "Does Locis show free parking spaces?",
        a: "No. Locis shows what the rules allow on each kerb, not whether a space is currently empty.",
      },
      {
        q: "Can I rely on Locis instead of the signs?",
        a: "No. Locis is guidance, not a guarantee. Published data can be incomplete, out of date, or wrong, and temporary restrictions may not be included. Always check local signs and road markings before parking.",
      },
      {
        q: "Is Locis free?",
        a: "Yes. Locis is free, with no adverts, tracking, or analytics, and no account to set up. Your settings and saved parking data stay on your device.",
      },
    ],
    metaTitle: "Locis — Curated Design",
    metaDescription:
      "Locis is a free iPhone app that shows whether you can legally park on a UK kerb for your whole stay, using open government data. No account, adverts, tracking or analytics.",
    pageMeta: {
      privacy: {
        title: "Locis Privacy Policy — Curated Design",
        description:
          "How Locis handles your information: no accounts, no personal information collected, and your location, searches, chosen times and settings are not sent to Curated Design.",
      },
      support: {
        title: "Locis Support — Curated Design",
        description:
          "Help with Locis: missing or grey kerb lines, amber lines, missing prices, location access, deleting data, and contact details for Curated Design.",
      },
    },
  },
];

const defaultSupportPages = ["privacy", "support", "terms"];

const titleByKind = {
  guide: "How to Use",
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
