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
        ".cms-preview-hero{margin:18px 0 0}",
        ".cms-preview-hero img{width:100%;max-height:420px;object-fit:cover;display:block}",
        ".cms-preview-slides{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}",
        ".cms-preview-slides img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}",
        ".cms-preview-light{background:#f3f0ea;color:#111;padding:30px;margin:0 -28px}",
        ".cms-preview-light .cms-preview-card{border-color:rgba(0,0,0,.16);background:#fff;color:#111}",
        ".cms-preview-light .cms-preview-card-body p{color:#444}",
        ".cms-preview-light .cms-preview-note,.cms-preview-light .cms-preview-help,.cms-preview-light .cms-preview-source{color:#555}",
        ".cms-preview-light .cms-preview-link{color:#111}",
        ".cms-preview-missing{padding:14px 16px;border:1px dashed rgba(255,255,255,.24);color:#bdbdbd}",
        "@media(max-width:700px){.cms-preview-card,.cms-preview-card.span-6{grid-column:span 12}.cms-preview-slides{grid-template-columns:1fr}}",
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
      return h(
        "article",
        { className: "cms-preview-card " + span },
        h("img", {
          src: asset(props, item.cardImage),
          alt: item.cardAlt || item.title,
        }),
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
          );
        },
      });
    }

    function ServicePreview() {
      return createClass({
        render: function () {
          var data = toData(this.props.entry);
          return h(
            "main",
            { className: "cms-preview" },
            h("p", { className: "cms-preview-note" }, "Service card and detail preview"),
            h("div", { className: "cms-preview-grid" }, card(this.props, data, {
              href: "/curated_services/" + data.slug + ".html",
              source: "Card image source: this Service entry",
              affects: "Changing this card image affects homepage service cards that reference this Service.",
            })),
            h("section", { className: "cms-preview-hero" }, h("img", { src: asset(this.props, data.coverImage), alt: data.coverAlt || "" })),
            h("h1", { className: "h2" }, text(data.title, "Service title")),
            h("p", { className: "lead" }, text(data.intro, data.summary)),
            h("p", { className: "cms-preview-link" }, "Detail URL: /curated_services/" + text(data.slug, "slug") + ".html"),
            h("p", { className: "cms-preview-link" }, "Status: " + text(data.status, "published")),
          );
        },
      });
    }

    function ProjectPreview() {
      return createClass({
        render: function () {
          var data = toData(this.props.entry);
          return h(
            "main",
            { className: "cms-preview" },
            h("p", { className: "cms-preview-note" }, "Project card and detail preview"),
            h("div", { className: "cms-preview-grid" }, card(this.props, data, {
              href: "/projects/" + data.slug + ".html",
              source: "Card image source: this Project entry",
              affects: "Changing this card image affects homepage collection cards and Projects listing cards.",
            })),
            h("section", { className: "cms-preview-hero" }, h("img", { src: asset(this.props, data.heroImage), alt: data.heroAlt || "" })),
            h("p", { className: "project-kicker" }, text(data.kicker, "")),
            h("h1", { className: "project-title" }, text(data.title, "Project title")),
            h("p", { className: "project-subtitle" }, text(data.subtitle, data.lead)),
            h("p", { className: "cms-preview-link" }, "Detail URL: /projects/" + text(data.slug, "slug") + ".html"),
            h("p", { className: "cms-preview-link" }, "Status: " + text(data.status, "published")),
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
