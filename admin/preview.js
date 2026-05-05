(function () {
  var previewData = { services: [], projects: [] };

  function loadPreviewData(onLoad) {
    fetch("/admin/preview-data.json", { credentials: "same-origin" })
      .then(function (response) {
        return response.ok ? response.json() : previewData;
      })
      .then(function (data) {
        previewData = data || previewData;
        if (onLoad) onLoad(previewData);
      })
      .catch(function () {
        if (onLoad) onLoad(previewData);
      });
  }

  function boot(attempt) {
    if (!window.CMS || !window.h || !window.createClass) {
      if (attempt < 80) {
        window.setTimeout(function () {
          boot(attempt + 1);
        }, 50);
      }
      return;
    }

    var CMS = window.CMS;
    var h = window.h;
    var createClass = window.createClass;

    loadPreviewData();

    CMS.registerPreviewStyle("/assets/css/styles.css");
    CMS.registerPreviewStyle(
      [
        "body{background:#111;color:#f2f2f2;font-family:Inter,Arial,sans-serif;margin:0}",
        ".cms-preview{padding:28px;max-width:1120px;margin:0 auto;background:#111;color:#f2f2f2}",
        ".cms-preview-section{padding:30px 0;border-top:1px solid rgba(255,255,255,.12)}",
        ".cms-preview-section:first-child{border-top:0}",
        ".cms-preview-note{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#a8a8a8;margin:0 0 10px}",
        ".cms-preview-help{font-size:13px;line-height:1.55;color:#bdbdbd;max-width:720px;margin:8px 0 0}",
        ".cms-preview-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-top:20px}",
        ".cms-preview-card{grid-column:span 4;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);overflow:hidden;border-radius:0}",
        ".cms-preview-card.span-6{grid-column:span 6}",
        ".cms-preview-card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#222}",
        ".cms-preview-card-body{padding:14px 16px}",
        ".cms-preview-card-body h3{margin:0 0 6px;font-size:18px;line-height:1.2}",
        ".cms-preview-card-body p{margin:0;color:#bdbdbd;font-size:14px;line-height:1.45}",
        ".cms-preview-source{display:block;margin-top:10px;color:#a8a8a8;font-size:12px;line-height:1.45}",
        ".cms-preview-link{display:block;margin-top:6px;color:#d9d9d9;font-size:12px;line-height:1.45;word-break:break-word}",
        ".cms-preview-hero{margin:18px 0 0;position:relative}",
        ".cms-preview-hero img{width:100%;max-height:420px;object-fit:cover;display:block;background:#222}",
        ".cms-preview-hero-empty{padding:40px 20px;text-align:center;border:1px dashed rgba(255,255,255,.24);color:#bdbdbd;font-size:13px}",
        ".cms-preview-slides{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}",
        ".cms-preview-slides img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}",
        ".cms-preview-light{background:#f3f0ea;color:#111;padding:30px;margin:0 -28px}",
        ".cms-preview-light .cms-preview-card{border-color:rgba(0,0,0,.16);background:#fff;color:#111}",
        ".cms-preview-light .cms-preview-card-body p{color:#444}",
        ".cms-preview-light .cms-preview-note,.cms-preview-light .cms-preview-help,.cms-preview-light .cms-preview-source{color:#555}",
        ".cms-preview-light .cms-preview-link{color:#111}",
        ".cms-preview-missing{padding:14px 16px;border:1px dashed rgba(255,255,255,.24);color:#bdbdbd}",
        ".cms-preview-status{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:500;margin-left:10px;vertical-align:middle}",
        ".cms-preview-status--published{background:rgba(120,255,160,.18);color:#7eff9e;border:1px solid rgba(120,255,160,.35)}",
        ".cms-preview-status--coming{background:rgba(255,210,120,.16);color:#ffcf7a;border:1px solid rgba(255,210,120,.35)}",
        ".cms-preview-status--draft{background:rgba(255,120,120,.16);color:#ff9090;border:1px solid rgba(255,120,120,.35)}",
        ".cms-preview-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}",
        ".cms-preview-tag{font-size:11px;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.04);color:#d9d9d9}",
        ".cms-preview-callout{margin:18px 0;padding:14px 16px;border-radius:0;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.03)}",
        ".cms-preview-callout-title{margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a8a8a8;font-weight:500}",
        ".cms-preview-callout-text{margin:0;font-size:14px;line-height:1.55;color:#e2e2e2}",
        ".cms-preview-facts{margin-top:18px;display:grid;gap:8px}",
        ".cms-preview-fact{display:grid;grid-template-columns:120px 1fr;gap:10px;font-size:13px}",
        ".cms-preview-fact dt{color:#a8a8a8;letter-spacing:.06em;text-transform:uppercase;font-size:11px}",
        ".cms-preview-fact dd{margin:0;color:#e2e2e2}",
        ".cms-preview-meta{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;color:#a8a8a8}",
        ".cms-preview-meta strong{color:#d9d9d9;font-weight:500}",
        ".cms-preview-list{margin:6px 0 0;padding-left:18px;font-size:13px;color:#bdbdbd;line-height:1.55}",
        ".cms-preview-block{margin-top:18px}",
        ".cms-preview-block h3{margin:0 0 6px;font-size:14px;color:#e2e2e2}",
        "@media(max-width:700px){.cms-preview-card,.cms-preview-card.span-6{grid-column:span 12}.cms-preview-slides{grid-template-columns:1fr}.cms-preview-fact{grid-template-columns:1fr}}",
      ].join("\n"),
      { raw: true },
    );

    function toData(entry) {
      var data = entry && entry.get ? entry.get("data") : {};
      return data && data.toJS ? data.toJS() : data || {};
    }

    function asset(props, value) {
      if (!value) return "";
      return props.getAsset ? props.getAsset(value).toString() : value;
    }

    function text(value, fallback) {
      return value == null || value === "" ? fallback || "" : value;
    }

    function resolve(items, slug) {
      return (items || []).find(function (item) {
        return item.slug === slug;
      });
    }

    function homeModel(data) {
      return {
        hero: data.hero || {
          headline: data.heroHeadline,
          subhead: data.heroSubhead,
        },
        carousel: data.carousel || {
          slides: data.carouselSlides || [],
        },
        servicesSection: data.servicesSection || {
          kicker: data.servicesKicker,
          heading: data.servicesHeading,
          lead: data.servicesLead,
          featuredServices: data.featuredServices || [],
        },
        collectionsSection: data.collectionsSection || {
          kicker: data.collectionsKicker,
          heading: data.collectionsHeading,
          featuredProjects: data.featuredProjects || [],
        },
        philosophy: data.philosophy || {},
        cta: data.cta || {},
      };
    }

    function missingCard(slug, type) {
      return h(
        "div",
        { className: "cms-preview-missing" },
        "Missing " + type + " relation: " + text(slug, "none selected"),
      );
    }

    function cardSpan(relation, count) {
      if (count === 1) return "";
      if (count === 2) return "span-6";
      return relation.cardSpan || "span-4";
    }

    function card(props, item, options) {
      options = options || {};
      if (!item) return null;
      var span = options.span || "span-4";
      var href = options.href || item.url || "";
      var imgSrc = asset(props, item.cardImage);
      return h(
        "article",
        { className: "cms-preview-card " + span },
        imgSrc
          ? h("img", { src: imgSrc, alt: item.cardAlt || item.title })
          : h("div", { className: "cms-preview-hero-empty", style: "aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;margin:0" }, "No card image set"),
        h(
          "div",
          { className: "cms-preview-card-body" },
          h("h3", {}, text(item.title, "Untitled")),
          h("p", {}, text(item.summary || item.kicker, "No summary yet.")),
          h("span", { className: "cms-preview-link" }, "Links to: " + href),
          h("span", { className: "cms-preview-source" }, options.source),
          h("span", { className: "cms-preview-source" }, options.affects),
        ),
      );
    }

    // Render a status pill that mirrors the public-site behaviour:
    // published/coming_soon/draft get distinct colour treatments.
    function statusBadge(status) {
      var label = (status || "published").toString();
      var modifier = label === "coming_soon" ? "coming" : label === "draft" ? "draft" : "published";
      var visible = label === "coming_soon" ? "Coming soon" : label === "draft" ? "Draft (hidden)" : "Published";
      return h(
        "span",
        { className: "cms-preview-status cms-preview-status--" + modifier },
        visible,
      );
    }

    function tagsRow(items) {
      var list = (items || []).filter(Boolean);
      if (!list.length) return null;
      return h(
        "div",
        { className: "cms-preview-tags" },
        list.map(function (tag) {
          return h("span", { className: "cms-preview-tag" }, tag);
        }),
      );
    }

    function calloutBlock(callout) {
      if (!callout) return null;
      var hasTitle = callout.title && callout.title.length;
      var hasText = callout.text && callout.text.length;
      if (!hasTitle && !hasText) return null;
      return h(
        "div",
        { className: "cms-preview-callout" },
        hasTitle ? h("p", { className: "cms-preview-callout-title" }, callout.title) : null,
        hasText ? h("p", { className: "cms-preview-callout-text" }, callout.text) : null,
      );
    }

    function factsBlock(facts) {
      var list = (facts || []).filter(function (f) { return f && (f.label || f.value); });
      if (!list.length) return null;
      return h(
        "dl",
        { className: "cms-preview-facts" },
        list.map(function (fact) {
          return h(
            "div",
            { className: "cms-preview-fact" },
            h("dt", {}, text(fact.label, "")),
            h("dd", {}, text(fact.value, "")),
          );
        }),
      );
    }

    // Show the editable list-of-strings used by service "At a glance" / "Items".
    function bulletedList(items) {
      var list = (items || []).filter(Boolean);
      if (!list.length) return null;
      return h(
        "ul",
        { className: "cms-preview-list" },
        list.map(function (entry) {
          var label = typeof entry === "string" ? entry : entry.label || "";
          var detail = typeof entry === "string" ? "" : entry.text || "";
          return h(
            "li",
            {},
            label && detail ? h("strong", {}, label + ": ") : null,
            label && !detail ? label : detail || (label || ""),
          );
        }),
      );
    }

    // SEO + slug footer common to project + service previews.
    function metaFooter(data, kind) {
      var url =
        kind === "project"
          ? "/projects/" + text(data.slug, "slug") + ".html"
          : kind === "service"
          ? "/curated_services/" + text(data.slug, "slug") + ".html"
          : "/" + text(data.slug, "");
      var children = [
        h("p", { className: "cms-preview-link" }, "URL: " + url),
        data.metaTitle
          ? h("p", { className: "cms-preview-link" }, h("strong", {}, "Meta title: "), data.metaTitle)
          : h("p", { className: "cms-preview-link" }, h("strong", {}, "Meta title: "), "(falls back to ", text(data.title, "Title"), ")"),
        data.metaDescription
          ? h("p", { className: "cms-preview-link" }, h("strong", {}, "Meta description: "), data.metaDescription)
          : h(
              "p",
              { className: "cms-preview-link" },
              h("strong", {}, "Meta description: "),
              "(falls back to ",
              kind === "project" ? "Subtitle / Summary" : "Summary / Intro",
              " or site-wide default)",
            ),
      ];
      return h("div", { className: "cms-preview-meta" }, children);
    }

    function HomePreview() {
      return createClass({
        getInitialState: function () {
          return { previewData: previewData };
        },
        componentDidMount: function () {
          var component = this;
          loadPreviewData(function (data) {
            component.setState({ previewData: data });
          });
        },
        render: function () {
          var data = toData(this.props.entry);
          var model = homeModel(data);
          var related = this.state && this.state.previewData ? this.state.previewData : previewData;
          var slides = model.carousel.slides || [];
          var serviceRelations = model.servicesSection.featuredServices || [];
          var projectRelations = model.collectionsSection.featuredProjects || [];

          return h(
            "main",
            { className: "cms-preview" },
            h(
              "section",
              { className: "cms-preview-section" },
              h("p", { className: "cms-preview-note" }, "Homepage hero"),
              h("h1", { className: "headline" }, text(model.hero.headline, "Homepage headline")),
              h("p", { className: "subhead" }, text(model.hero.subhead, "")),
            ),
            h(
              "section",
              { className: "cms-preview-section" },
          h("p", { className: "cms-preview-note" }, "Homepage carousel, populated from Project entries"),
          h("p", { className: "cms-preview-help" }, "Each slide references a Project and uses one selected image from that Project."),
          h(
            "div",
            { className: "cms-preview-slides" },
            slides.length
              ? slides.map(function (slide) {
                      var project = resolve(related.projects, slide.project);
                      return h(
                        "div",
                        {},
                        h("img", { src: asset(this.props, slide.image || (project && (project.heroImage || project.cardImage))), alt: slide.alt || (project && project.title) || "" }),
                        h("span", { className: "cms-preview-source" }, project ? "Links/source Project: " + project.title : "No project selected"),
                      );
                    }, this)
                  : h("p", {}, "No carousel slides selected."),
          ),
            ),
            h(
              "section",
              { className: "cms-preview-section" },
              h("p", { className: "cms-preview-note" }, "Homepage services, populated from Service entries"),
              h("span", { className: "kicker" }, text(model.servicesSection.kicker, "Services")),
              h("h2", { className: "h2" }, text(model.servicesSection.heading, "Featured services")),
              h("p", { className: "lead" }, text(model.servicesSection.lead, "")),
              h(
                "div",
                { className: "cms-preview-grid" },
                serviceRelations.map(function (relation) {
                  var service = resolve(related.services, relation.service);
                  return service
                    ? card(this.props, service, {
                        span: cardSpan(relation, serviceRelations.length),
                        href: "/curated_services/" + service.slug + ".html",
                        source: "Image/title/summary source: Services > " + service.title,
                        affects: "Changing this Service card image affects this homepage card.",
                      })
                    : missingCard(relation.service, "service");
                }, this),
              ),
            ),
            h(
              "section",
              { className: "cms-preview-section cms-preview-light" },
              h("p", { className: "cms-preview-note" }, "Homepage collections, populated from Project entries"),
              h("span", { className: "kicker2" }, text(model.collectionsSection.kicker, "Collections")),
              h("h2", { className: "h22" }, text(model.collectionsSection.heading, "Featured projects")),
              h(
                "div",
                { className: "cms-preview-grid" },
                projectRelations.map(function (relation) {
                  var project = resolve(related.projects, relation.project);
                  var cardProject = project ? Object.assign({}, project, { cardImage: relation.image || project.cardImage }) : project;
                  return project
                    ? card(this.props, cardProject, {
                        span: cardSpan(relation, projectRelations.length),
                        href: "/projects/" + project.slug + ".html",
                        source: "Title/kicker source: Projects > " + project.title,
                        affects: "Image selected from this Project's image pool.",
                      })
                    : missingCard(relation.project, "project");
                }, this),
              ),
            ),
            h(
              "section",
              { className: "cms-preview-section" },
              h("p", { className: "cms-preview-note" }, "Homepage-owned design philosophy image"),
              model.philosophy.image
                ? h("div", { className: "cms-preview-hero" }, h("img", { src: asset(this.props, model.philosophy.image), alt: model.philosophy.imageAlt || "" }))
                : null,
              h("h2", { className: "h2" }, text(model.philosophy.heading, "")),
            ),
          );
        },
      });
    }

    function PagePreview() {
      return createClass({
        render: function () {
          var data = toData(this.props.entry);
          return h(
            "main",
            { className: "cms-preview" },
            h("p", { className: "cms-preview-note" }, "Page preview"),
            h("h1", { className: "h2" }, text(data.title || data.heading || data.heroHeadline, "Page")),
            h("p", { className: "lead" }, text(data.lead || data.heroSubhead || data.introText, "")),
            h(
              "div",
              { className: "cms-preview-meta" },
              data.metaDescription
                ? h("p", { className: "cms-preview-link" }, h("strong", {}, "Meta description: "), data.metaDescription)
                : h("p", { className: "cms-preview-link" }, h("strong", {}, "Meta description: "), "(falls back to the site-wide default in Site Settings)"),
            ),
          );
        },
      });
    }

    function ServicePreview() {
      return createClass({
        render: function () {
          var data = toData(this.props.entry);
          var isDraft = data.status === "draft";
          var coverSrc = asset(this.props, data.coverImage);

          return h(
            "main",
            { className: "cms-preview" },

            // Card preview
            h(
              "section",
              { className: "cms-preview-section" },
              h(
                "p",
                { className: "cms-preview-note" },
                "Card preview ",
                statusBadge(data.status),
              ),
              h(
                "p",
                { className: "cms-preview-help" },
                "How this service appears on the homepage Curated Services grid. Card image, title, and summary come from the fields below.",
              ),
              h(
                "div",
                { className: "cms-preview-grid" },
                card(this.props, data, {
                  href: "/curated_services/" + (data.slug || "slug") + ".html",
                  source: "Card image source: this Service entry",
                  affects:
                    "Changing this card image affects every homepage card that features this Service.",
                }),
              ),
              isDraft
                ? h(
                    "p",
                    { className: "cms-preview-help" },
                    "Status is Draft — this service will not appear on the public site.",
                  )
                : null,
            ),

            // Detail page cover + intro
            h(
              "section",
              { className: "cms-preview-section" },
              h("p", { className: "cms-preview-note" }, "Service page"),
              coverSrc
                ? h(
                    "div",
                    { className: "cms-preview-hero" },
                    h("img", { src: coverSrc, alt: data.coverAlt || data.title || "" }),
                  )
                : h(
                    "div",
                    { className: "cms-preview-hero-empty" },
                    "No cover image set",
                  ),
              h("h1", { className: "h2", style: "margin-top:18px" }, text(data.title, "Service title")),
              data.intro ? h("p", { className: "lead" }, data.intro) : null,
            ),

            // At a glance
            data.glance && data.glance.length
              ? h(
                  "section",
                  { className: "cms-preview-section" },
                  h("p", { className: "cms-preview-note" }, "At a glance"),
                  bulletedList(data.glance),
                )
              : null,

            // Content sections
            data.sections && data.sections.length
              ? h(
                  "section",
                  { className: "cms-preview-section" },
                  h("p", { className: "cms-preview-note" }, "Content sections"),
                  data.sections.map(function (section) {
                    if (!section) return null;
                    return h(
                      "div",
                      { className: "cms-preview-block" },
                      section.heading ? h("h3", {}, section.heading) : null,
                      bulletedList(section.items),
                      section.note
                        ? h("p", { className: "cms-preview-help" }, section.note)
                        : null,
                    );
                  }),
                )
              : null,

            // Enquiry panel + bottom CTA
            data.enquiryHeading || data.enquiryText
              ? h(
                  "section",
                  { className: "cms-preview-section" },
                  h("p", { className: "cms-preview-note" }, "Enquiry panel (sidebar form)"),
                  data.enquiryHeading
                    ? h("h2", { className: "h2", style: "margin-top:0" }, data.enquiryHeading)
                    : null,
                  data.enquiryText ? h("p", { className: "lead" }, data.enquiryText) : null,
                )
              : null,

            data.ctaHeading || data.ctaText
              ? h(
                  "section",
                  { className: "cms-preview-section" },
                  h("p", { className: "cms-preview-note" }, "Bottom CTA band"),
                  data.ctaHeading ? h("h2", { className: "h2", style: "margin-top:0" }, data.ctaHeading) : null,
                  data.ctaText ? h("p", { className: "lead" }, data.ctaText) : null,
                )
              : null,

            // SEO + URL footer
            metaFooter(data, "service"),
          );
        },
      });
    }

    function ProjectPreview() {
      return createClass({
        render: function () {
          var data = toData(this.props.entry);
          var isComingSoon = data.status === "coming_soon";
          var isDraft = data.status === "draft";
          var heroSrc = asset(this.props, data.heroImage);
          var leadText = data.lead || data.summary || data.subtitle;
          var headingText = data.articleHeading || (isComingSoon ? (data.statusLabel || "Coming soon") : "Overview");
          var galleryImages = ((data.gallery && data.gallery.images) || []).filter(function (img) { return img && img.image; });

          return h(
            "main",
            { className: "cms-preview" },

            // Card preview — what this project looks like wherever it appears as a card.
            h(
              "section",
              { className: "cms-preview-section" },
              h(
                "p",
                { className: "cms-preview-note" },
                "Card preview ",
                statusBadge(data.status),
              ),
              h(
                "p",
                { className: "cms-preview-help" },
                "How this project appears on the homepage Collections grid and the Projects listing page. Card image, title, and kicker come from the fields below.",
              ),
              h(
                "div",
                { className: "cms-preview-grid" },
                card(this.props, data, {
                  href: "/projects/" + (data.slug || "slug") + ".html",
                  source: "Card image source: this Project entry",
                  affects:
                    "Changing this card image affects homepage Collections cards and Projects listing cards.",
                }),
              ),
              isDraft
                ? h(
                    "p",
                    { className: "cms-preview-help" },
                    "Status is Draft — this project will not appear on the public site or in homepage selections.",
                  )
                : null,
            ),

            // Detail page hero
            h(
              "section",
              { className: "cms-preview-section" },
              h(
                "p",
                { className: "cms-preview-note" },
                isComingSoon ? "Project page (Coming Soon teaser)" : "Project page hero",
              ),
              heroSrc
                ? h(
                    "div",
                    { className: "cms-preview-hero" },
                    h("img", { src: heroSrc, alt: data.heroAlt || data.title || "" }),
                  )
                : h(
                    "div",
                    { className: "cms-preview-hero-empty" },
                    "No hero image set",
                  ),
              data.kicker ? h("p", { className: "project-kicker" }, data.kicker) : null,
              h(
                "h1",
                { className: "project-title", style: "margin-top:8px" },
                text(data.title, "Project title"),
                isComingSoon
                  ? h("span", { className: "cms-preview-status cms-preview-status--coming" }, data.statusLabel || "Coming soon")
                  : null,
              ),
              data.subtitle ? h("p", { className: "project-subtitle" }, data.subtitle) : null,
              tagsRow(data.projectTags),
            ),

            // Body content
            h(
              "section",
              { className: "cms-preview-section" },
              h("p", { className: "cms-preview-note" }, "Article"),
              h("h2", { className: "h2", style: "margin-top:0" }, headingText),
              leadText ? h("p", { className: "lead" }, leadText) : null,
              !isComingSoon && data.body
                ? h(
                    "div",
                    { className: "cms-preview-block" },
                    h("p", { className: "cms-preview-help" }, "Body markdown renders here on the published page."),
                  )
                : null,
              calloutBlock(data.callout),
              !isComingSoon && data.extraSections && data.extraSections.length
                ? h(
                    "div",
                    { className: "cms-preview-block" },
                    h("h3", {}, "Extra sections"),
                    h(
                      "ul",
                      { className: "cms-preview-list" },
                      data.extraSections.map(function (section) {
                        return h(
                          "li",
                          {},
                          section && section.heading
                            ? section.heading
                            : "(untitled section)",
                        );
                      }),
                    ),
                  )
                : null,
              isComingSoon
                ? h(
                    "p",
                    { className: "cms-preview-help" },
                    "Coming Soon pages render Lead (or Summary fallback) and Callout only — Body and Extra Sections are intentionally hidden.",
                  )
                : null,
            ),

            // Sidebar
            h(
              "section",
              { className: "cms-preview-section" },
              h("p", { className: "cms-preview-note" }, "Sidebar"),
              factsBlock(data.facts) ||
                h("p", { className: "cms-preview-help" }, "No facts set — the Facts list is hidden in the sidebar."),
              data.asideText ? h("p", { className: "cms-preview-help" }, data.asideText) : null,
            ),

            // Gallery (published only)
            !isComingSoon && galleryImages.length
              ? h(
                  "section",
                  { className: "cms-preview-section" },
                  h("p", { className: "cms-preview-note" }, "Hero carousel images"),
                  h(
                    "p",
                    { className: "cms-preview-help" },
                    "These images appear as a hero carousel on the published project page (after the main hero image).",
                  ),
                  h(
                    "div",
                    { className: "cms-preview-slides" },
                    galleryImages.map(function (item) {
                      return h(
                        "div",
                        {},
                        h("img", { src: asset(this.props, item.image), alt: item.alt || data.title || "" }),
                      );
                    }, this),
                  ),
                )
              : null,

            // Bottom CTA
            data.ctaHeading || data.ctaText
              ? h(
                  "section",
                  { className: "cms-preview-section" },
                  h("p", { className: "cms-preview-note" }, "Bottom CTA band"),
                  data.ctaHeading ? h("h2", { className: "h2", style: "margin-top:0" }, data.ctaHeading) : null,
                  data.ctaText ? h("p", { className: "lead" }, data.ctaText) : null,
                )
              : null,

            // SEO + URL footer
            metaFooter(data, "project"),
          );
        },
      });
    }

    CMS.registerPreviewTemplate("home", HomePreview());
    CMS.registerPreviewTemplate("about", PagePreview());
    CMS.registerPreviewTemplate("contact", PagePreview());
    CMS.registerPreviewTemplate("projectsPage", PagePreview());
    CMS.registerPreviewTemplate("projects", ProjectPreview());
    CMS.registerPreviewTemplate("services", ServicePreview());
  }

  boot(0);
})();
