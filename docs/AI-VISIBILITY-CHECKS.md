# AI visibility checks

A monthly check of whether AI assistants can find and describe the studio and its apps. Run the same questions each time so results can be compared.

## Before you start

AI assistants find a small or new business mainly by searching the web live, so the site has to be in the search indexes first.

1. **Google Search Console** (search.google.com/search-console): `curateddesign.studio` added, sitemap `https://curateddesign.studio/sitemap.xml` submitted. Check the Pages report for anything not indexed.
2. **Bing Webmaster Tools** (bing.com/webmasters): the same. ChatGPT and Microsoft Copilot rely mostly on Bing.
3. Search Google for `site:curateddesign.studio`. If pages are listed, they are indexed.

## How to ask

- Use a **new chat** with **memory and personalisation turned off** (or a logged-out or private window), so your own history doesn't influence the answer.
- Make sure the assistant can **search the web** (on by default in most; in Claude, web search must be enabled).
- Ask the question exactly as written. Don't add hints.
- Assistants to check: ChatGPT, Perplexity, Google Gemini, Google AI Overviews (a normal Google search), Microsoft Copilot, Claude.

## Questions

### 1. By name

- What is ProcureCore?
- What is the concinnity app?
- What is CuratedLedger?
- What is Mythos Log?
- What is CuriosityTracker?
- What is the Locis parking app?
- Who is Curated Design, the London interior design studio?

### 2. Name slightly wrong

- Tell me about the Procure Core app for interior designers
- What is the Curated Ledger finance app?
- What is the Curiosity Tracker app?
- What is MythosLog?
- Concinity daily planner app
- Locus parking app UK

### 3. Without the name (the real test)

Studio:

- Recommend an interior designer in London
- Is there a London interior designer who passes on trade discounts to clients?
- Interior designer in London with no design fee
- Can I get a free photo-realistic render of my room from an interior designer in London?
- Interior designer for restaurants and boutique hotels in London

Apps:

- What app can interior designers use to track procurement and product orders?
- Is there an iPhone and Mac app for interior design studios to manage suppliers and client approvals?
- Is there an app that shows if I can legally park on a UK kerb for my whole stay?
- Daily planner app for iPhone, iPad and Mac with calendar and focus sessions, no tracking
- Personal finance app that shows what is safe to spend and how long my money will last
- Habit tracker app that works like levelling up an RPG character
- App for saving questions and resurfacing them later

## What counts

| Result | Meaning |
|---|---|
| **Named and correct** | Mentions you, and what it says matches the site |
| **Named but wrong** | Mentions you with a wrong detail; note what it got wrong |
| **Linked only** | Cites a curateddesign.studio page without naming you in the answer |
| **Not found** | No mention |

If an assistant gets a detail wrong, check whether the site says it unclearly before changing anything else.

## Log

Add a row per question per assistant, or just note the ones that changed.

| Date | Assistant | Question | Result | Notes |
|---|---|---|---|---|
| 2026-10-03 | Web search (baseline) | ProcureCore, Curated Design, Locis | Not found | Site changes went live that day and were not yet indexed; results showed Programa, Studio Designer, AppyWay instead |
| | | | | |

## What moves the results

- **App Store listings** linked from each app page (`appStoreUrl` in `src/_data/apps.js`)
- **Mentions on other sites**: a Google Business Profile with reviews, Houzz and design directories for the studio; App Store reviews, Product Hunt, articles and forum posts for the apps
- **Time**: weeks after indexing for search-based answers; much longer before an assistant knows you without searching
