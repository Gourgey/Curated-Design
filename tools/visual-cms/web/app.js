const state = {
  home: null,
  pages: {},
  services: [],
  projects: [],
  selected: null,
  frameReady: false,
  mode: "edit",
  currentPage: { kind: "home", path: "/index.html" },
  newProject: null,
  imageBuckets: [],
  selectedImage: null,
};

const editor = document.getElementById("editor");
const statusEl = document.getElementById("status");
const frame = document.getElementById("previewFrame");
const reloadButton = document.getElementById("reloadButton");
const navigateModeButton = document.getElementById("navigateModeButton");
const editModeButton = document.getElementById("editModeButton");
const previewHelp = document.getElementById("previewHelp");
const currentPageEl = document.getElementById("currentPage");
const workspace = document.getElementById("workspace");
const panelResizer = document.getElementById("panelResizer");
const modalRoot = document.getElementById("modalRoot");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }
  return payload;
}

async function loadContent() {
  setStatus("Loading content...");
  const payload = await api("/api/content/home");
  state.home = payload.home;
  state.pages = payload.pages || {};
  state.services = payload.services || [];
  state.projects = payload.projects || [];
  // Eagerly load the image catalog so the in-context image panel can show
  // the project + file dropdowns without an additional click.
  try {
    await loadImageBuckets();
  } catch (error) {
    console.warn("Image catalog failed to load:", error);
  }
  setStatus("Content loaded. Click the preview to edit.");
  renderEditor();
  syncPreview();
}

function serviceBySlug(slug) {
  return state.services.find((item) => item.slug === slug);
}

function projectBySlug(slug) {
  return state.projects.find((item) => item.slug === slug);
}

function publicProjects() {
  return state.projects.filter((item) => item.status !== "draft");
}

function assetPath(value) {
  if (!value || /^https?:\/\//.test(value) || value.startsWith("/")) return value || "";
  return `/${value}`;
}

function projectImageOptions(project) {
  if (!project) return [];
  return [...new Set([
    project.cardImage,
    project.heroImage,
    ...((project.gallery && project.gallery.images) || []).map((item) => item.image),
    ...(project.imagePool || []),
  ].filter(Boolean).map(assetPath))];
}

function selectedEntry() {
  if (!state.selected) return null;
  if (state.selected.type === "service") return serviceBySlug(state.selected.slug);
  if (state.selected.type === "project") return projectBySlug(state.selected.slug);
  return null;
}

function currentPageData() {
  if (state.selected && state.selected.type === "page") return state.pages[state.selected.slug];
  if (state.currentPage.kind === "about") return state.pages.about;
  if (state.currentPage.kind === "contact") return state.pages.contact;
  if (state.currentPage.kind === "projectsPage") return state.pages.projectsPage;
  return null;
}

function setMode(mode) {
  state.mode = mode;
  navigateModeButton.classList.toggle("is-active", mode === "navigate");
  editModeButton.classList.toggle("is-active", mode === "edit");
  previewHelp.textContent =
    mode === "navigate"
      ? "Navigate mode: click links and cards normally to move around the site."
      : "Edit mode: click text, images, cards, or sections to edit the matching source.";
  setStatus(mode === "navigate" ? "Navigate mode enabled." : "Edit mode enabled.");
  if (mode === "edit" && !state.selected) {
    state.selected = defaultSelectionForCurrentPage();
    renderEditor();
  }
  injectPreviewHooks(true);
  markPreviewSelection();
}

function defaultSelectionForCurrentPage() {
  if (state.currentPage.kind === "about") return { type: "page", slug: "about" };
  if (state.currentPage.kind === "contact") return { type: "page", slug: "contact" };
  if (state.currentPage.kind === "projectsPage") return { type: "page", slug: "projectsPage" };
  if (state.currentPage.kind === "project") return { type: "project", slug: state.currentPage.slug };
  if (state.currentPage.kind === "service") return { type: "service", slug: state.currentPage.slug };
  return null;
}

function detectCurrentPage() {
  let pathname = "/index.html";
  try {
    pathname = frame.contentWindow.location.pathname || pathname;
  } catch (error) {
    pathname = "/index.html";
  }

  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const projectMatch = cleanPath.match(/^\/projects\/([^/]+)\.html$/);
  const serviceMatch = cleanPath.match(/^\/curated_services\/([^/]+)\.html$/);
  let currentPage = { kind: "home", path: cleanPath };

  if (cleanPath === "/about.html") currentPage = { kind: "about", path: cleanPath };
  else if (cleanPath === "/contact.html") currentPage = { kind: "contact", path: cleanPath };
  else if (cleanPath === "/projects.html") currentPage = { kind: "projectsPage", path: cleanPath };
  else if (projectMatch) currentPage = { kind: "project", slug: decodeURIComponent(projectMatch[1]), path: cleanPath };
  else if (serviceMatch) currentPage = { kind: "service", slug: decodeURIComponent(serviceMatch[1]), path: cleanPath };

  state.currentPage = currentPage;
  currentPageEl.textContent = cleanPath;
  if (
    state.selected &&
    !(
      currentPage.kind === "home" ||
      (currentPage.kind === "project" && state.selected.type === "project" && state.selected.slug === currentPage.slug) ||
      (currentPage.kind === "service" && state.selected.type === "service" && state.selected.slug === currentPage.slug) ||
      (["about", "contact", "projectsPage"].includes(currentPage.kind) &&
        state.selected.type === "page" &&
        state.selected.slug === currentPage.kind)
    )
  ) {
    state.selected = null;
    renderEditor();
  }
}

function select(type, slug) {
  state.selected = { type, slug: slug || "" };
  renderEditor();
  markPreviewSelection();
}

function selectToken(token) {
  const separator = token.indexOf(":");
  if (separator === -1) {
    select(token);
    return;
  }
  select(token.slice(0, separator), token.slice(separator + 1));
}

function openModal(title, content) {
  modalRoot.innerHTML = "";
  const body = typeof content === "function" ? content() : content;
  const card = el("section", { class: "modal-card", role: "dialog", "aria-modal": "true", "aria-label": title }, [
    el("div", { class: "modal-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Visual CMS" }),
        el("h2", { text: title }),
      ]),
      el("button", { class: "modal-close", type: "button", text: "×", onclick: closeModal, "aria-label": "Close modal" }),
    ]),
    body,
  ]);
  modalRoot.appendChild(card);
  modalRoot.hidden = false;
}

function closeModal() {
  modalRoot.hidden = true;
  modalRoot.innerHTML = "";
}

function missingPublishedProjectFields(project) {
  const missing = [];
  if (!project.lead) missing.push({ label: "Lead", token: `text:project.${project.slug}.lead` });
  if (!project.body) missing.push({ label: "Body", token: `text:project.${project.slug}.body` });
  if (!project.facts || !project.facts.length) missing.push({ label: "Facts", token: `project:${project.slug}` });
  if (!project.gallery || !project.gallery.images || !project.gallery.images.length) missing.push({ label: "Hero carousel images", token: `project:${project.slug}` });
  if (!project.ctaHeading) missing.push({ label: "CTA heading", token: `text:project.${project.slug}.ctaHeading` });
  if (!project.ctaText) missing.push({ label: "CTA text", token: `text:project.${project.slug}.ctaText` });
  return missing;
}

function showPublishWarningModal(project) {
  const missing = missingPublishedProjectFields(project);
  if (!missing.length) return;
  openModal("Published project checklist", el("div", { class: "compact-group" }, [
    el("p", { class: "help", text: `${project.title} is now set to Published. These fields are recommended for a complete case-study page; saving is still allowed.` }),
    ...missing.map((item) => el("button", {
      class: "button secondary",
      type: "button",
      text: `Edit ${item.label}`,
      onclick: () => {
        closeModal();
        selectToken(item.token);
      },
    })),
    el("div", { class: "button-row" }, [
      el("button", { class: "button", type: "button", text: "Continue", onclick: closeModal }),
    ]),
  ]));
}

function pathParts(path) {
  return String(path || "").split(".").filter(Boolean);
}

function getAtPath(root, parts) {
  return parts.reduce((current, key) => {
    if (current == null) return undefined;
    return current[key];
  }, root);
}

function setAtPath(root, parts, value) {
  const last = parts[parts.length - 1];
  const parent = getAtPath(root, parts.slice(0, -1));
  if (parent == null || last == null) return;
  parent[last] = value;
}

function titleFromKey(value) {
  return String(value || "")
    .replace(/\.\d+\./g, " ")
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveEditableField(kind, path) {
  const parts = pathParts(path);
  const scope = parts.shift();
  let root = null;
  let sourceType = scope;
  let sourceKey = "";
  let sourceFile = "";
  let entry = null;

  if (scope === "home") {
    root = state.home;
    sourceKey = "home";
    sourceFile = "src/content/pages/home.json";
  } else if (scope === "page") {
    sourceKey = parts.shift();
    root = state.pages[sourceKey];
    sourceType = "page";
    sourceFile = `src/content/pages/${sourceKey === "projectsPage" ? "projects" : sourceKey}.json`;
  } else if (scope === "project") {
    sourceKey = parts.shift();
    entry = projectBySlug(sourceKey);
    root = entry;
    sourceFile = entry ? `src/content/projects/${entry.filename}` : "";
  } else if (scope === "service") {
    sourceKey = parts.shift();
    entry = serviceBySlug(sourceKey);
    root = entry;
    sourceFile = entry ? `src/content/services/${entry.filename}` : "";
  }

  if (!root) return null;

  const fieldPath = parts;
  const value = getAtPath(root, fieldPath);
  const resolved = {
    kind,
    path,
    scope,
    root,
    sourceType,
    sourceKey,
    sourceFile,
    entry,
    fieldPath,
    label: titleFromKey(fieldPath.join(".")),
    value,
    affected: affectedForField(scope, sourceKey, fieldPath),
    relatedProject: relatedProjectForField(scope, root, fieldPath),
  };
  return resolved;
}

function affectedForField(scope, sourceKey, fieldPath) {
  const joined = fieldPath.join(".");
  if (scope === "home") {
    if (joined.startsWith("carousel.slides")) return ["Homepage carousel"];
    if (joined.startsWith("collectionsSection.featuredProjects")) return ["Homepage Collections card"];
    if (joined.startsWith("servicesSection.featuredServices")) return ["Homepage Services card"];
    return ["Homepage"];
  }
  if (scope === "project") {
    if (fieldPath[0] === "cardImage" || fieldPath[0] === "cardAlt" || fieldPath[0] === "title" || fieldPath[0] === "kicker") {
      return ["Project detail page", "Projects listing cards", "Homepage project cards when referenced"];
    }
    if (fieldPath[0] === "heroImage" || fieldPath[0] === "heroAlt") return ["Project detail page hero"];
    return ["Project detail page"];
  }
  if (scope === "service") {
    if (fieldPath[0] === "cardImage" || fieldPath[0] === "cardAlt" || fieldPath[0] === "title" || fieldPath[0] === "summary") {
      return ["Service detail page", "Homepage service cards when referenced"];
    }
    return ["Service detail page"];
  }
  if (scope === "page") return [`${titleFromKey(sourceKey)} page`];
  return [];
}

function relatedProjectForField(scope, root, fieldPath) {
  if (scope === "project") return root;
  if (scope !== "home") return null;
  if (fieldPath[0] === "carousel" && fieldPath[1] === "slides") {
    const slide = getAtPath(root, fieldPath.slice(0, 3));
    return slide ? projectBySlug(slide.project) : null;
  }
  if (fieldPath[0] === "collectionsSection" && fieldPath[1] === "featuredProjects") {
    const relation = getAtPath(root, fieldPath.slice(0, 3));
    return relation ? projectBySlug(relation.project) : null;
  }
  return null;
}

function saveResolvedFieldButton(resolved) {
  return el("button", {
    class: "button",
    type: "button",
    text: "Save change",
    onclick: async () => {
      try {
        if (resolved.sourceType === "home") {
          setStatus("Saving homepage...");
          const payload = await api("/api/content/home", {
            method: "POST",
            body: JSON.stringify({ home: state.home }),
          });
          state.home = payload.home;
          state.services = payload.services || state.services;
          state.projects = payload.projects || state.projects;
        } else if (resolved.sourceType === "page") {
          setStatus("Saving page...");
          const payload = await api(`/api/content/page/${encodeURIComponent(resolved.sourceKey)}`, {
            method: "POST",
            body: JSON.stringify({ page: state.pages[resolved.sourceKey] }),
          });
          state.pages = payload.pages || state.pages;
        } else {
          setStatus(`Saving ${resolved.sourceType}...`);
          const payload = await api(`/api/content/${resolved.sourceType}/${encodeURIComponent(resolved.sourceKey)}`, {
            method: "POST",
            body: JSON.stringify({ fields: resolved.root }),
          });
          state.home = payload.home;
          state.pages = payload.pages || state.pages;
          state.services = payload.services || state.services;
          state.projects = payload.projects || state.projects;
          if (payload.warnings && payload.warnings.length) {
            setStatus(`${titleFromKey(resolved.sourceType)} saved with warnings: ${payload.warnings.join(" ")}`);
            syncPreview();
            renderEditor();
            return;
          }
        }
        setStatus("Change saved.");
        syncPreview();
        renderEditor();
      } catch (error) {
        setStatus(error.message, true);
      }
    },
  });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function field(label, value, onInput, options = {}) {
  const control = options.multiline
    ? el("textarea", { rows: options.rows || 4 })
    : options.select
      ? el("select")
      : el("input", { type: options.type || "text" });

  if (options.select) {
    for (const option of options.select) {
      control.appendChild(el("option", { value: option.value, text: option.label }));
    }
  }

  control.value = value || "";
  control.addEventListener("input", () => onInput(control.value));
  control.addEventListener("change", () => onInput(control.value));

  return el("div", { class: "field" }, [
    el("label", { text: label }),
    control,
    options.help ? el("p", { class: "help", text: options.help }) : null,
  ]);
}

function sectionHeader(kicker, title, help) {
  return el("div", { class: "panel-head" }, [
    el("p", { class: "eyebrow", text: kicker }),
    el("h2", { text: title }),
    help ? el("p", { class: "help", text: help }) : null,
  ]);
}

function sourceCard(lines) {
  return el("div", { class: "source-card" }, lines.map((line) => (
    line.code ? el("code", { text: line.text }) : el("strong", { text: line.text })
  )));
}

function saveHomeButton() {
  return el("button", {
    class: "button",
    type: "button",
    text: "Save homepage",
    onclick: async () => {
      try {
        setStatus("Saving homepage...");
        const payload = await api("/api/content/home", {
          method: "POST",
          body: JSON.stringify({ home: state.home }),
        });
        state.home = payload.home;
        state.services = payload.services || state.services;
        state.projects = payload.projects || state.projects;
        setStatus("Homepage saved.");
        syncPreview();
      } catch (error) {
        setStatus(error.message, true);
      }
    },
  });
}

function savePageButton(pageName) {
  return el("button", {
    class: "button",
    type: "button",
    text: "Save page",
    onclick: async () => {
      try {
        setStatus("Saving page...");
        const payload = await api(`/api/content/page/${encodeURIComponent(pageName)}`, {
          method: "POST",
          body: JSON.stringify({ page: state.pages[pageName] }),
        });
        state.pages = payload.pages || state.pages;
        setStatus("Page saved.");
        syncPreview();
      } catch (error) {
        setStatus(error.message, true);
      }
    },
  });
}

function renderEditor() {
  editor.innerHTML = "";

  if (!state.home) {
    editor.appendChild(sectionHeader("Loading", "Reading content", "The editor will appear shortly."));
    return;
  }

  if (!state.selected) {
    editor.appendChild(document.getElementById("emptyStateTemplate").content.cloneNode(true));
    return;
  }

  if (state.selected.type === "text") renderTextFieldEditor(state.selected.slug);
  else if (state.selected.type === "image") renderImageFieldEditor(state.selected.slug);
  else if (state.selected.type === "imagesIndex") renderImagesIndex();
  else if (state.selected.type === "imageBrowse") renderImageBrowse();
  else if (state.selected.type === "hero") renderHeroEditor();
  else if (state.selected.type === "carousel") renderCarouselEditor();
  else if (state.selected.type === "servicesSection") renderServicesSectionEditor();
  else if (state.selected.type === "collectionsSection") renderCollectionsSectionEditor();
  else if (state.selected.type === "homeProjectCard") renderHomeProjectCardEditor(Number(state.selected.slug));
  else if (state.selected.type === "philosophy") renderPhilosophyEditor();
  else if (state.selected.type === "cta") renderCtaEditor();
  else if (state.selected.type === "service") renderServiceEditor();
  else if (state.selected.type === "project") renderProjectEditor();
  else if (state.selected.type === "page") renderPageEditor(state.selected.slug);
  else if (state.selected.type === "newProject") renderNewProjectEditor();
}

function renderTextFieldEditor(path) {
  const resolved = resolveEditableField("text", path);
  if (!resolved) return renderMissing("text field");
  const multiline = String(resolved.value || "").length > 70 || String(resolved.value || "").includes("\n");
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Selected text", resolved.label, "Only this selected text field is shown here."),
    sourceCard([
      { text: `File: ${resolved.sourceFile}`, code: true },
      { text: `Field: ${resolved.path}`, code: true },
      ...resolved.affected.map((item) => ({ text: `Affects: ${item}`, code: true })),
    ]),
    field(resolved.label, resolved.value, (value) => {
      setAtPath(resolved.root, resolved.fieldPath, value);
      syncPreview();
    }, { multiline, rows: multiline ? 5 : 2 }),
    el("div", { class: "button-row" }, [saveResolvedFieldButton(resolved)]),
  ]));
}

function renderImageFieldEditor(path) {
  const resolved = resolveEditableField("image", path);
  if (!resolved) return renderMissing("image field");

  // If the catalog isn't ready yet, show a brief loading state and try once.
  if (!state.imageBuckets.length) {
    editor.appendChild(el("section", { class: "panel-section" }, [
      sectionHeader("Selected image", resolved.label, "Loading image catalog..."),
    ]));
    loadImageBuckets()
      .then(() => renderEditor())
      .catch((error) => setStatus(error.message, true));
    return;
  }

  const currentValue = () => assetPath(resolveEditableField("image", path)?.value || "");
  const setValue = (value) => {
    const fresh = resolveEditableField("image", path) || resolved;
    setAtPath(fresh.root, fresh.fieldPath, value);
  };

  // Initial group: prefer the bucket containing the current file; fall back
  // to the field's "related project" (so a homepage Collections card defaults
  // to the project the card represents even if its image override is empty).
  let activeGroup = findGroupForPath(currentValue());
  if (!activeGroup && resolved.relatedProject) {
    activeGroup = flatGroups().find((g) => g.kind === "project" && g.slug === resolved.relatedProject.slug)
      || null;
  }

  const renderPanel = () => {
    const current = currentValue();
    editor.innerHTML = "";

    // Project / Site bucket dropdown — every project + every site sub-bucket
    const groupSelect = el("select", { class: "image-browse-select" });
    for (const bucket of state.imageBuckets) {
      if (!bucket.groups.length) continue;
      const optgroup = el("optgroup", { label: bucket.name });
      for (const g of bucket.groups) {
        optgroup.appendChild(el("option", { value: g.id, text: g.name }));
      }
      groupSelect.appendChild(optgroup);
    }
    if (activeGroup) groupSelect.value = activeGroup.id;
    groupSelect.addEventListener("change", () => {
      const next = findGroup(groupSelect.value);
      if (!next) return;
      activeGroup = next;
      const first = next.images[0];
      if (first) setValue(first.path);
      syncPreview();
      renderPanel();
    });

    // File-name dropdown — files in the current group (plus a fallback row
    // for the current value if it doesn't match any catalog file).
    const fileSelect = el("select", { class: "image-browse-select" });
    if (activeGroup) {
      for (const img of activeGroup.images) {
        fileSelect.appendChild(el("option", { value: img.path, text: img.filename }));
      }
      const inGroup = activeGroup.images.some((img) => img.path === current);
      if (!inGroup && current) {
        const fallback = el("option", {
          value: current,
          text: `${current.split("/").pop() || current} (not in this group)`,
        });
        fallback.selected = true;
        fileSelect.appendChild(fallback);
      } else if (inGroup) {
        fileSelect.value = current;
      }
    } else {
      fileSelect.appendChild(el("option", { value: "", text: "No group selected" }));
    }
    fileSelect.addEventListener("change", () => {
      setValue(fileSelect.value);
      syncPreview();
      renderPanel();
    });

    const sectionChildren = [
      sectionHeader("Selected image", resolved.label, "This panel only controls the image you clicked."),
      el("div", { class: "thumb-row image-focus" }, [
        el("img", { src: current || "", alt: resolved.label }),
        el("div", {}, [
          el("h3", { text: (current || "").split("/").pop() || "No image selected" }),
          el("p", { text: current || "Choose an image below." }),
        ]),
      ]),
      sourceCard([
        { text: `File: ${resolved.sourceFile}`, code: true },
        { text: `Field: ${resolved.path}`, code: true },
        ...resolved.affected.map((item) => ({ text: `Affects: ${item}`, code: true })),
      ]),
      el("div", { class: "field" }, [
        el("label", { text: activeGroup && activeGroup.kind === "site" ? "Site bucket" : "Project" }),
        groupSelect,
      ]),
      el("div", { class: "field" }, [
        el("label", { text: "Image file" }),
        fileSelect,
      ]),
    ];

    if (activeGroup && activeGroup.kind === "project" && activeGroup.slug) {
      sectionChildren.push(el("div", { class: "image-browse-actions" }, [
        el("button", {
          class: "button secondary",
          type: "button",
          text: "Edit project →",
          onclick: () => {
            if (activeGroup.url) {
              state.currentPage = { kind: "project", path: activeGroup.url, slug: activeGroup.slug };
            }
            select("project", activeGroup.slug);
            syncPreview();
          },
        }),
      ]));

      const targetProject = projectBySlug(activeGroup.slug);
      if (targetProject) {
        sectionChildren.push(uploadProjectImageControl(targetProject, async (uploadedPath) => {
          await loadImageBuckets();
          activeGroup = findGroupForPath(uploadedPath) || activeGroup;
          setValue(uploadedPath);
          renderPanel();
          syncPreview();
        }));
      }
    }

    sectionChildren.push(el("div", { class: "button-row" }, [saveResolvedFieldButton(resolved)]));
    editor.appendChild(el("section", { class: "panel-section" }, sectionChildren));
  };

  renderPanel();
}

function renderHeroEditor() {
  const hero = state.home.hero || (state.home.hero = {});
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Homepage source", "Hero", "These fields live in src/content/pages/home.json."),
    field("Headline", hero.headline, (value) => { hero.headline = value; syncPreview(); }, { multiline: true, rows: 3 }),
    field("Subhead", hero.subhead, (value) => { hero.subhead = value; syncPreview(); }, { multiline: true, rows: 3 }),
    el("div", { class: "button-row" }, [saveHomeButton()]),
  ]));
}

function renderCarouselEditor() {
  const carousel = state.home.carousel || (state.home.carousel = { slides: [] });
  carousel.slides = carousel.slides || [];
  const list = el("div", { class: "relation-list" });
  carousel.slides.forEach((slide, index) => {
    const project = projectBySlug(slide.project);
    list.appendChild(el("div", { class: "relation-item" }, [
      el("div", { class: "thumb-row" }, [
        el("img", { src: assetPath(slide.image || (project && project.heroImage) || ""), alt: slide.alt || (project && project.title) || "" }),
        el("div", {}, [
          el("h3", { text: `Slide ${index + 1}` }),
          el("p", { text: project ? `Project source: ${project.title}` : "Choose a project for this slide." }),
          el("p", { text: project ? project.url : "" }),
        ]),
      ]),
      selectRelation("Project", slide.project, publicProjects(), (value) => {
        slide.project = value;
        const nextProject = projectBySlug(value);
        slide.image = (nextProject && (nextProject.heroImage || nextProject.cardImage)) || "";
        renderEditor();
        syncPreview();
      }),
      imageChoiceField("Slide image from project", slide.image, project, (value) => {
        slide.image = value;
        syncPreview();
      }),
      field("Alt text", slide.alt, (value) => { slide.alt = value; syncPreview(); }),
      project ? uploadProjectImageControl(project, (path) => {
        slide.image = path;
        renderEditor();
        syncPreview();
      }) : null,
      relationButtons(carousel.slides, index, () => { renderEditor(); syncPreview(); }),
    ]));
  });
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Homepage source", "Carousel", "Each slide references a Project and chooses one image from that Project."),
    list,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: "Add slide",
        onclick: () => {
          const first = publicProjects()[0];
          carousel.slides.push({
            project: first ? first.slug : "",
            image: first ? (first.heroImage || first.cardImage || "") : "",
            alt: "",
          });
          renderEditor();
          syncPreview();
        },
      }),
      saveHomeButton(),
    ]),
  ]));
}

function renderServicesSectionEditor() {
  const section = state.home.servicesSection || (state.home.servicesSection = { featuredServices: [] });
  section.featuredServices = section.featuredServices || [];
  const list = el("div", { class: "relation-list" });

  section.featuredServices.forEach((relation, index) => {
    const service = serviceBySlug(relation.service);
    list.appendChild(el("div", { class: "relation-item" }, [
      serviceThumb(service, "service"),
      selectRelation("Service", relation.service, state.services, (value) => {
        relation.service = value;
        renderEditor();
        syncPreview();
      }),
      sourceCard([
        { text: service ? `Image/title/summary source: Services > ${service.title}` : "Missing service relation" },
        { text: service ? `Links to ${service.url}` : relation.service, code: true },
        { text: "Changing this Service card image affects homepage service cards.", code: true },
      ]),
      relationButtons(section.featuredServices, index, () => { renderEditor(); syncPreview(); }),
    ]));
  });

  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Homepage source", "Services section", "Section copy lives on the Homepage. Card content comes from each selected Service entry."),
    field("Kicker", section.kicker, (value) => { section.kicker = value; syncPreview(); }),
    field("Heading", section.heading, (value) => { section.heading = value; syncPreview(); }, { multiline: true, rows: 3 }),
    field("Lead", section.lead, (value) => { section.lead = value; syncPreview(); }, { multiline: true, rows: 4 }),
    list,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: "Add service card",
        onclick: () => {
          const first = state.services.find((item) => item.status !== "draft");
          section.featuredServices.push({ service: first ? first.slug : "" });
          renderEditor();
          syncPreview();
        },
      }),
      saveHomeButton(),
    ]),
  ]));
}

function renderCollectionsSectionEditor() {
  const section = state.home.collectionsSection || (state.home.collectionsSection = { featuredProjects: [] });
  section.featuredProjects = section.featuredProjects || [];
  const list = el("div", { class: "relation-list" });

  section.featuredProjects.forEach((relation, index) => {
    const project = projectBySlug(relation.project);
    list.appendChild(el("div", { class: "relation-item" }, [
      serviceThumb(project, "project"),
      selectRelation("Project", relation.project, state.projects, (value) => {
        relation.project = value;
        const nextProject = projectBySlug(value);
        relation.image = (nextProject && nextProject.cardImage) || "";
        renderEditor();
        syncPreview();
      }),
      imageChoiceField("Homepage card image from project", relation.image || (project && project.cardImage), project, (value) => {
        relation.image = value;
        syncPreview();
      }),
      field("Homepage card width", relation.cardSpan || "", (value) => {
        relation.cardSpan = value;
        syncPreview();
      }, {
        select: [
          { label: "Auto", value: "" },
          { label: "Half width", value: "span-6" },
          { label: "Third width", value: "span-4" },
        ],
      }),
      sourceCard([
        { text: project ? `Image/title/kicker source: Projects > ${project.title}` : "Missing project relation" },
        { text: project ? `Links to ${project.url}` : relation.project, code: true },
        { text: "This homepage card uses a selected image from the Project image pool.", code: true },
      ]),
      project ? uploadProjectImageControl(project, (path) => {
        relation.image = path;
        renderEditor();
        syncPreview();
      }) : null,
      relationButtons(section.featuredProjects, index, () => { renderEditor(); syncPreview(); }),
    ]));
  });

  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Homepage source", "Collections section", "Section copy lives on the Homepage. Card content comes from each selected Project entry."),
    field("Kicker", section.kicker, (value) => { section.kicker = value; syncPreview(); }),
    field("Heading", section.heading, (value) => { section.heading = value; syncPreview(); }, { multiline: true, rows: 3 }),
    list,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: "Add project card",
        onclick: () => {
          const first = state.projects.find((item) => item.status !== "draft");
          section.featuredProjects.push({ project: first ? first.slug : "", image: first ? first.cardImage : "", cardSpan: "" });
          renderEditor();
          syncPreview();
        },
      }),
      createProjectButton(),
      saveHomeButton(),
    ]),
  ]));
}

function renderHomeProjectCardEditor(index) {
  const section = state.home.collectionsSection || (state.home.collectionsSection = { featuredProjects: [] });
  section.featuredProjects = section.featuredProjects || [];
  const relation = section.featuredProjects[index];
  if (!relation) return renderMissing("homepage project card");
  const project = projectBySlug(relation.project);

  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Homepage card", project ? project.title : `Card ${index + 1}`, "This card lives on the Homepage, but its title, text, target page, and image pool come from the selected Project."),
    selectRelation("Project", relation.project, state.projects, (value) => {
      relation.project = value;
      const nextProject = projectBySlug(value);
      relation.image = (nextProject && (nextProject.cardImage || nextProject.heroImage)) || "";
      renderEditor();
      syncPreview();
    }),
    project ? sourceCard([
      { text: `Project: ${project.title}` },
      { text: `Slug: ${project.slug}`, code: true },
      { text: `Links to ${project.url}`, code: true },
      { text: "Changing this Project affects homepage cards, Projects listing cards, and the Project detail page.", code: true },
    ]) : sourceCard([{ text: "Choose a Project for this card." }]),
    project ? imageChoiceField("Homepage card image", relation.image || project.cardImage, project, (value) => {
      relation.image = value;
      syncPreview();
    }) : null,
    field("Homepage card width", relation.cardSpan || "", (value) => {
      relation.cardSpan = value;
      syncPreview();
    }, {
      select: [
        { label: "Auto", value: "" },
        { label: "Half width", value: "span-6" },
        { label: "Third width", value: "span-4" },
      ],
    }),
    project ? uploadProjectImageControl(project, (path) => {
      relation.image = path;
      renderEditor();
      syncPreview();
    }) : null,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: "Edit full project",
        onclick: () => project && select("project", project.slug),
      }),
      saveHomeButton(),
    ]),
  ]));
}

function renderPhilosophyEditor() {
  const philosophy = state.home.philosophy || (state.home.philosophy = { paragraphs: [] });
  philosophy.paragraphs = philosophy.paragraphs || [];
  const paragraphs = el("div", { class: "relation-list" });
  philosophy.paragraphs.forEach((paragraph, index) => {
    paragraphs.appendChild(el("div", { class: "relation-item" }, [
      field(`Paragraph ${index + 1}`, paragraph, (value) => { philosophy.paragraphs[index] = value; syncPreview(); }, { multiline: true, rows: 4 }),
      relationButtons(philosophy.paragraphs, index, () => { renderEditor(); syncPreview(); }),
    ]));
  });

  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Homepage source", "Design philosophy", "These fields and this image live on the Homepage entry."),
    field("Kicker", philosophy.kicker, (value) => { philosophy.kicker = value; syncPreview(); }),
    field("Image path", philosophy.image, (value) => { philosophy.image = value; syncPreview(); }),
    field("Image alt", philosophy.imageAlt, (value) => { philosophy.imageAlt = value; syncPreview(); }),
    field("Heading", philosophy.heading, (value) => { philosophy.heading = value; syncPreview(); }, { multiline: true, rows: 3 }),
    paragraphs,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: "Add paragraph",
        onclick: () => {
          philosophy.paragraphs.push("");
          renderEditor();
          syncPreview();
        },
      }),
      saveHomeButton(),
    ]),
  ]));
}

function renderCtaEditor() {
  const cta = state.home.cta || (state.home.cta = {});
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Homepage source", "CTA", "This call-to-action copy lives on the Homepage entry."),
    field("Heading", cta.heading, (value) => { cta.heading = value; syncPreview(); }),
    field("Text", cta.text, (value) => { cta.text = value; syncPreview(); }, { multiline: true, rows: 4 }),
    field("Button label", cta.buttonLabel, (value) => { cta.buttonLabel = value; syncPreview(); }),
    el("div", { class: "button-row" }, [saveHomeButton()]),
  ]));
}

function renderServiceEditor() {
  const service = selectedEntry();
  if (!service) return renderMissing("service");
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Service source", service.title, "This card content is owned by the Service entry and appears wherever the Service is featured."),
    sourceCard([
      { text: `File: src/content/services/${service.filename}`, code: true },
      { text: `Links to ${service.url}`, code: true },
      { text: "Affects homepage service cards and this service detail page.", code: true },
    ]),
    entryFields(service, "service"),
    saveEntryButton("service", service.slug),
  ]));
}

function renderProjectEditor() {
  const project = selectedEntry();
  if (!project) return renderMissing("project");
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Project source", project.title, "This card content is owned by the Project entry and appears wherever the Project is featured."),
    sourceCard([
      { text: `File: src/content/projects/${project.filename}`, code: true },
      { text: `Links to ${project.url}`, code: true },
      { text: "Affects homepage collection cards, Projects listing cards, and this project detail page.", code: true },
    ]),
    entryFields(project, "project"),
    saveEntryButton("project", project.slug),
  ]));
}

function renderNewProjectEditor() {
  const draft = state.newProject || (state.newProject = {
    title: "",
    slug: "",
    status: "draft",
    category: "Residential",
    summary: "",
  });
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Project source", "Create project", "Creates a new project entry and matching image folder."),
    field("Title", draft.title, (value) => {
      draft.title = value;
      if (!draft.slug) draft.slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    }),
    field("Slug", draft.slug, (value) => { draft.slug = value; }),
    field("Status", draft.status, (value) => { draft.status = value; }, {
      select: [
        { label: "Draft", value: "draft" },
        { label: "Coming soon", value: "coming_soon" },
        { label: "Published", value: "published" },
      ],
    }),
    field("Category", draft.category, (value) => { draft.category = value; }, {
      select: [
        { label: "Residential", value: "Residential" },
        { label: "Hospitality", value: "Hospitality" },
        { label: "Commercial", value: "Commercial" },
      ],
    }),
    field("Summary", draft.summary, (value) => { draft.summary = value; }, { multiline: true, rows: 4 }),
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button",
        type: "button",
        text: "Create project",
        onclick: async () => {
          try {
            setStatus("Creating project...");
            const payload = await api("/api/content/project", {
              method: "POST",
              body: JSON.stringify({ fields: draft }),
            });
            state.home = payload.home;
            state.services = payload.services || [];
            state.projects = payload.projects || [];
            state.newProject = null;
            setStatus("Project created.");
            select("project", draft.slug);
            syncPreview();
          } catch (error) {
            setStatus(error.message, true);
          }
        },
      }),
    ]),
  ]));
}

function openCreateProjectModal() {
  const draft = {
    title: "",
    slug: "",
    status: "draft",
    category: "Residential",
    summary: "",
    cardImage: "",
    heroImage: "",
    cardAlt: "",
    heroAlt: "",
    showInProjects: true,
    addToHome: true,
  };

  function render() {
    openModal("Create project", el("div", { class: "compact-group" }, [
      field("Title", draft.title, (value) => {
        draft.title = value;
        if (!draft.slug) draft.slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        if (!draft.cardAlt) draft.cardAlt = value;
        if (!draft.heroAlt) draft.heroAlt = value;
      }),
      field("Slug", draft.slug, (value) => { draft.slug = value; }),
      field("Status", draft.status, (value) => { draft.status = value; }, {
        select: [
          { label: "Draft", value: "draft" },
          { label: "Coming soon", value: "coming_soon" },
          { label: "Published", value: "published" },
        ],
      }),
      field("Category", draft.category, (value) => { draft.category = value; }, {
        select: [
          { label: "Residential", value: "Residential" },
          { label: "Hospitality", value: "Hospitality" },
          { label: "Commercial", value: "Commercial" },
        ],
      }),
      field("Summary / subtitle", draft.summary, (value) => { draft.summary = value; }, { multiline: true, rows: 4 }),
      field("Card image path", draft.cardImage, (value) => { draft.cardImage = value; }),
      field("Hero image path", draft.heroImage, (value) => { draft.heroImage = value; }),
      field("Card alt", draft.cardAlt, (value) => { draft.cardAlt = value; }),
      field("Hero alt", draft.heroAlt, (value) => { draft.heroAlt = value; }),
      booleanField("Show in Projects listing", draft.showInProjects, (value) => { draft.showInProjects = value; }),
      booleanField("Add to homepage Collections", draft.addToHome, (value) => { draft.addToHome = value; }),
      el("div", { class: "button-row" }, [
        el("button", {
          class: "button",
          type: "button",
          text: "Create project",
          onclick: async () => {
            try {
              if (draft.addToHome && draft.status === "draft") {
                setStatus("Draft projects cannot be added to homepage Collections.", true);
                return;
              }
              setStatus("Creating project...");
              const payload = await api("/api/content/project", {
                method: "POST",
                body: JSON.stringify({ fields: draft }),
              });
              state.home = payload.home;
              state.services = payload.services || [];
              state.projects = payload.projects || [];
              if (draft.addToHome) {
                const section = state.home.collectionsSection || (state.home.collectionsSection = { featuredProjects: [] });
                section.featuredProjects = section.featuredProjects || [];
                section.featuredProjects.push({
                  project: draft.slug,
                  image: draft.cardImage || draft.heroImage || "",
                  cardSpan: "",
                });
                const homePayload = await api("/api/content/home", {
                  method: "POST",
                  body: JSON.stringify({ home: state.home }),
                });
                state.home = homePayload.home;
                state.projects = homePayload.projects || state.projects;
                closeModal();
                setStatus("Project created and added to homepage.");
                select("homeProjectCard", String(section.featuredProjects.length - 1));
              } else {
                closeModal();
                setStatus("Project created.");
                select("project", draft.slug);
              }
              syncPreview();
            } catch (error) {
              setStatus(error.message, true);
            }
          },
        }),
        el("button", { class: "button secondary", type: "button", text: "Cancel", onclick: closeModal }),
      ]),
    ]));
  }

  render();
}

function renderPageEditor(pageName) {
  const page = state.pages[pageName];
  if (!page) return renderMissing("page");
  if (pageName === "about") return renderAboutEditor(page);
  if (pageName === "contact") return renderContactEditor(page);
  if (pageName === "projectsPage") return renderProjectsPageEditor(page);
  return renderMissing("page");
}

function renderAboutEditor(page) {
  page.workParagraphs = page.workParagraphs || [];
  page.focusAreas = page.focusAreas || [];
  page.processSteps = page.processSteps || [];

  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Page source", "About page", "These fields live in src/content/pages/about.json."),
    sourceCard([{ text: "File: src/content/pages/about.json", code: true }]),
    field("SEO title", page.title, (value) => { page.title = value; }),
    field("Intro heading", page.introHeading, (value) => { page.introHeading = value; syncPreview(); }),
    field("Intro text", page.introText, (value) => { page.introText = value; syncPreview(); }, { multiline: true, rows: 4 }),
    field("Work heading", page.workHeading, (value) => { page.workHeading = value; syncPreview(); }),
    stringListEditor("Work paragraphs", page.workParagraphs, () => { renderEditor(); syncPreview(); }, { rows: 4 }),
    field("Focus heading", page.focusHeading, (value) => { page.focusHeading = value; syncPreview(); }),
    stringListEditor("Focus areas", page.focusAreas, () => { renderEditor(); syncPreview(); }),
    objectListEditor("Process steps", page.processSteps, [
      { key: "title", label: "Title" },
      { key: "text", label: "Text", multiline: true, rows: 3 },
    ], () => { renderEditor(); syncPreview(); }),
    field("Locations heading", page.locationsHeading, (value) => { page.locationsHeading = value; syncPreview(); }),
    field("Locations text", page.locationsText, (value) => { page.locationsText = value; syncPreview(); }, { multiline: true, rows: 4 }),
    el("div", { class: "button-row" }, [savePageButton("about")]),
  ]));
}

function renderContactEditor(page) {
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Page source", "Contact page", "These text fields live in src/content/pages/contact.json. The contact form markup is intentionally not edited here."),
    sourceCard([{ text: "File: src/content/pages/contact.json", code: true }]),
    field("SEO title", page.title, (value) => { page.title = value; }),
    field("Heading", page.heading, (value) => { page.heading = value; syncPreview(); }),
    field("Lead", page.lead, (value) => { page.lead = value; syncPreview(); }, { multiline: true, rows: 4 }),
    field("Details heading", page.detailsHeading, (value) => { page.detailsHeading = value; syncPreview(); }),
    field("Note", page.note, (value) => { page.note = value; syncPreview(); }, { multiline: true, rows: 3 }),
    el("div", { class: "button-row" }, [savePageButton("contact")]),
  ]));
}

function renderProjectsPageEditor(page) {
  page.categories = page.categories || [];
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Page source", "Projects listing", "Page hero and category labels live in src/content/pages/projects.json. Project cards are owned by Project entries."),
    sourceCard([
      { text: "File: src/content/pages/projects.json", code: true },
      { text: "Project card images/titles/kickers are edited from each Project entry.", code: true },
    ]),
    field("Hero headline", page.heroHeadline, (value) => { page.heroHeadline = value; syncPreview(); }, { multiline: true, rows: 3 }),
    field("Hero subhead", page.heroSubhead, (value) => { page.heroSubhead = value; syncPreview(); }, { multiline: true, rows: 4 }),
    objectListEditor("Project categories", page.categories, [
      { key: "id", label: "Anchor ID" },
      { key: "label", label: "Label" },
      { key: "heading", label: "Heading" },
      { key: "note", label: "Note", multiline: true, rows: 3 },
    ], () => { renderEditor(); syncPreview(); }),
    el("div", { class: "button-row" }, [savePageButton("projectsPage")]),
  ]));
}

function stringListEditor(label, items, onChange, options = {}) {
  const list = el("div", { class: "relation-list" });
  items.forEach((item, index) => {
    list.appendChild(el("div", { class: "relation-item" }, [
      field(`${label} ${index + 1}`, item, (value) => { items[index] = value; syncPreview(); }, { multiline: true, rows: options.rows || 2 }),
      relationButtons(items, index, onChange),
    ]));
  });

  return el("div", { class: "relation-list" }, [
    el("p", { class: "eyebrow", text: label }),
    list,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: `Add ${label.toLowerCase().replace(/s$/, "")}`,
        onclick: () => {
          items.push("");
          onChange();
        },
      }),
    ]),
  ]);
}

function objectListEditor(label, items, fields, onChange) {
  const list = el("div", { class: "relation-list" });
  items.forEach((item, index) => {
    const controls = fields.map((config) => field(
      config.label,
      item[config.key],
      (value) => { item[config.key] = value; syncPreview(); },
      { multiline: config.multiline, rows: config.rows || 2 },
    ));
    controls.push(relationButtons(items, index, onChange));
    list.appendChild(el("div", { class: "relation-item" }, controls));
  });

  return el("div", { class: "relation-list" }, [
    el("p", { class: "eyebrow", text: label }),
    list,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: `Add ${label.toLowerCase().replace(/s$/, "")}`,
        onclick: () => {
          items.push(fields.reduce((next, config) => ({ ...next, [config.key]: "" }), {}));
          onChange();
        },
      }),
    ]),
  ]);
}

function entryFields(entry, type) {
  const fields = el("div", { class: "field-grid" });
  fields.appendChild(field("Title", entry.title, (value) => { entry.title = value; syncPreview(); }));
  fields.appendChild(field("Slug", entry.slug, (value) => { entry.slug = value; }));
  fields.appendChild(field("Status", entry.status, (value) => {
    const previous = entry.status;
    entry.status = value;
    if (type === "project" && value === "coming_soon" && !entry.statusLabel) entry.statusLabel = "Coming soon";
    if (type === "project" && value === "published" && (entry.statusLabel || "").toLowerCase().includes("coming soon")) entry.statusLabel = "";
    renderEditor();
    syncPreview();
    if (type === "project" && previous !== "published" && value === "published") showPublishWarningModal(entry);
  }, {
    select: [
      { label: "Published", value: "published" },
      { label: "Coming soon", value: "coming_soon" },
      { label: "Draft", value: "draft" },
    ],
  }));
  fields.appendChild(field("Order", entry.order, (value) => { entry.order = Number(value) || 999; }, { type: "number" }));
  if (type === "project") {
    fields.appendChild(projectWarningsPanel(entry));
    fields.appendChild(field("Category", entry.category, (value) => { entry.category = value; syncPreview(); }, {
      select: [
        { label: "Residential", value: "Residential" },
        { label: "Hospitality", value: "Hospitality" },
        { label: "Commercial", value: "Commercial" },
      ],
    }));
    fields.appendChild(field("Kicker", entry.kicker, (value) => { entry.kicker = value; syncPreview(); }));
    fields.appendChild(field("Summary / subtitle", entry.subtitle, (value) => { entry.subtitle = value; entry.summary = value; syncPreview(); }, { multiline: true, rows: 4 }));
    fields.appendChild(field("Status label", entry.statusLabel || "", (value) => { entry.statusLabel = value; syncPreview(); }, {
      help: "Only renders publicly while status is Coming soon.",
    }));
    fields.appendChild(booleanField("Show in Projects listing", entry.showInProjects !== false, (value) => { entry.showInProjects = value; syncPreview(); }));
    fields.appendChild(field("Listing grid class", entry.gridClass || "", (value) => { entry.gridClass = value; }));
  } else {
    fields.appendChild(field("Summary", entry.summary, (value) => { entry.summary = value; syncPreview(); }, { multiline: true, rows: 4 }));
  }
  fields.appendChild(field("Card image path", entry.cardImage, (value) => { entry.cardImage = value; syncPreview(); }));
  fields.appendChild(field("Card alt", entry.cardAlt, (value) => { entry.cardAlt = value; syncPreview(); }));
  if (type === "project") {
    fields.appendChild(uploadProjectImageControl(entry, () => { renderEditor(); syncPreview(); }));
    fields.appendChild(field("Hero image path", entry.heroImage, (value) => { entry.heroImage = value; syncPreview(); }));
    fields.appendChild(field("Hero alt", entry.heroAlt, (value) => { entry.heroAlt = value; syncPreview(); }));
    entry.projectTags = entry.projectTags || [];
    entry.extraSections = entry.extraSections || [];
    entry.facts = entry.facts || [];
    entry.gallery = entry.gallery || { heading: "Gallery", text: "", images: [] };
    entry.gallery.images = entry.gallery.images || [];
    entry.callout = entry.callout || { title: "", text: "" };
    fields.appendChild(stringListEditor("Project tags", entry.projectTags, () => { renderEditor(); syncPreview(); }));
    fields.appendChild(field("Article heading", entry.articleHeading || "", (value) => { entry.articleHeading = value; syncPreview(); }));
    fields.appendChild(field("Lead", entry.lead || "", (value) => { entry.lead = value; syncPreview(); }, { multiline: true, rows: 4 }));
    fields.appendChild(field("Body", entry.body || "", (value) => { entry.body = value; syncPreview(); }, { multiline: true, rows: 8 }));
    fields.appendChild(field("Callout title", entry.callout.title || "", (value) => { entry.callout.title = value; syncPreview(); }));
    fields.appendChild(field("Callout text", entry.callout.text || "", (value) => { entry.callout.text = value; syncPreview(); }, { multiline: true, rows: 4 }));
    fields.appendChild(objectListEditor("Extra sections", entry.extraSections, [
      { key: "heading", label: "Heading" },
      { key: "text", label: "Text", multiline: true, rows: 5 },
    ], () => { renderEditor(); syncPreview(); }));
    fields.appendChild(objectListEditor("Facts", entry.facts, [
      { key: "label", label: "Label" },
      { key: "value", label: "Value" },
    ], () => { renderEditor(); syncPreview(); }));
    fields.appendChild(field("Aside text", entry.asideText || "", (value) => { entry.asideText = value; syncPreview(); }, { multiline: true, rows: 4 }));
    fields.appendChild(field("Gallery heading", entry.gallery.heading || "", (value) => { entry.gallery.heading = value; syncPreview(); }));
    fields.appendChild(field("Gallery text", entry.gallery.text || "", (value) => { entry.gallery.text = value; syncPreview(); }, { multiline: true, rows: 3 }));
    fields.appendChild(galleryEditor(entry));
    fields.appendChild(field("CTA heading", entry.ctaHeading || "", (value) => { entry.ctaHeading = value; syncPreview(); }));
    fields.appendChild(field("CTA text", entry.ctaText || "", (value) => { entry.ctaText = value; syncPreview(); }, { multiline: true, rows: 3 }));
  } else {
    fields.appendChild(field("Cover image path", entry.coverImage, (value) => { entry.coverImage = value; syncPreview(); }));
    fields.appendChild(field("Cover alt", entry.coverAlt, (value) => { entry.coverAlt = value; syncPreview(); }));
    fields.appendChild(field("Intro", entry.intro || "", (value) => { entry.intro = value; syncPreview(); }, { multiline: true, rows: 4 }));
    entry.glance = entry.glance || [];
    entry.sections = entry.sections || [];
    fields.appendChild(objectListEditor("At a glance", entry.glance, [
      { key: "label", label: "Label" },
      { key: "text", label: "Text" },
    ], () => { renderEditor(); syncPreview(); }));
    fields.appendChild(serviceSectionsEditor(entry));
    fields.appendChild(field("Enquiry heading", entry.enquiryHeading || "", (value) => { entry.enquiryHeading = value; syncPreview(); }));
    fields.appendChild(field("Enquiry text", entry.enquiryText || "", (value) => { entry.enquiryText = value; syncPreview(); }, { multiline: true, rows: 3 }));
    fields.appendChild(field("CTA heading", entry.ctaHeading || "", (value) => { entry.ctaHeading = value; syncPreview(); }));
    fields.appendChild(field("CTA text", entry.ctaText || "", (value) => { entry.ctaText = value; syncPreview(); }, { multiline: true, rows: 3 }));
  }
  return fields;
}

function booleanField(label, value, onInput) {
  return field(label, value ? "true" : "false", (next) => onInput(next === "true"), {
    select: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  });
}

function projectWarningsPanel(project) {
  const warnings = [];
  if (project.status === "published") {
    if ((project.statusLabel || "").toLowerCase().includes("coming soon")) warnings.push("Status Label says Coming soon; it will not render while Published.");
    if (!project.lead) warnings.push("Lead is empty.");
    if (!project.body) warnings.push("Body is empty.");
    if (!project.facts || !project.facts.length) warnings.push("Facts are empty.");
    if (!project.gallery || !project.gallery.images || !project.gallery.images.length) warnings.push("Gallery images are empty.");
    if (!project.ctaHeading) warnings.push("CTA heading is empty.");
    if (!project.ctaText) warnings.push("CTA text is empty.");
  }
  if (!warnings.length) return el("div");
  return el("div", { class: "warning-box" }, [
    el("strong", { text: "Published project warnings" }),
    ...warnings.map((warning) => el("p", { text: warning })),
  ]);
}

function galleryEditor(project) {
  const images = project.gallery.images;
  const list = el("div", { class: "relation-list" });
  images.forEach((item, index) => {
    list.appendChild(el("div", { class: "relation-item" }, [
      el("div", { class: "thumb-row" }, [
        el("img", { src: assetPath(item.image), alt: item.alt || "" }),
        el("div", {}, [
          el("h3", { text: `Gallery image ${index + 1}` }),
          el("p", { text: item.image || "Choose an image" }),
        ]),
      ]),
      imageChoiceField("Image", item.image, project, (value) => { item.image = value; syncPreview(); }),
      field("Alt", item.alt, (value) => { item.alt = value; syncPreview(); }),
      relationButtons(images, index, () => { renderEditor(); syncPreview(); }),
    ]));
  });
  return el("div", { class: "relation-list" }, [
    el("p", { class: "eyebrow", text: "Gallery images" }),
    list,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: "Add gallery image",
        onclick: () => {
          images.push({ image: projectImageOptions(project)[0] || "", alt: "" });
          renderEditor();
          syncPreview();
        },
      }),
    ]),
  ]);
}

function serviceSectionsEditor(service) {
  const list = el("div", { class: "relation-list" });
  service.sections.forEach((section, index) => {
    section.items = section.items || [];
    list.appendChild(el("div", { class: "relation-item" }, [
      field("Heading", section.heading || "", (value) => { section.heading = value; syncPreview(); }),
      field("List type", section.listType || "ul", (value) => { section.listType = value; syncPreview(); }, {
        select: [
          { label: "Bullets", value: "ul" },
          { label: "Numbers", value: "ol" },
        ],
      }),
      stringListEditor("Items", section.items, () => { renderEditor(); syncPreview(); }),
      field("Note", section.note || "", (value) => { section.note = value; syncPreview(); }, { multiline: true, rows: 3 }),
      relationButtons(service.sections, index, () => { renderEditor(); syncPreview(); }),
    ]));
  });
  return el("div", { class: "relation-list" }, [
    el("p", { class: "eyebrow", text: "Content sections" }),
    list,
    el("div", { class: "button-row" }, [
      el("button", {
        class: "button secondary",
        type: "button",
        text: "Add section",
        onclick: () => {
          service.sections.push({ heading: "", listType: "ul", items: [], note: "" });
          renderEditor();
          syncPreview();
        },
      }),
    ]),
  ]);
}

function saveEntryButton(type, slug) {
  return el("div", { class: "button-row" }, [
    el("button", {
      class: "button",
      type: "button",
      text: `Save ${type}`,
      onclick: async () => {
        const entry = selectedEntry();
        if (!entry) return;
        try {
          setStatus(`Saving ${type}...`);
          const payload = await api(`/api/content/${type}/${encodeURIComponent(slug)}`, {
            method: "POST",
            body: JSON.stringify({ fields: entry }),
          });
          state.home = payload.home;
          state.pages = payload.pages || state.pages;
          state.services = payload.services || [];
          state.projects = payload.projects || [];
          setStatus(payload.warnings && payload.warnings.length
            ? `${type[0].toUpperCase() + type.slice(1)} saved with warnings: ${payload.warnings.join(" ")}`
            : `${type[0].toUpperCase() + type.slice(1)} saved.`);
          syncPreview();
          renderEditor();
        } catch (error) {
          setStatus(error.message, true);
        }
      },
    }),
  ]);
}

function renderMissing(type) {
  editor.appendChild(el("section", { class: "panel-section" }, [
    sectionHeader("Missing entry", `Unknown ${type}`, "Reload content and try again."),
  ]));
}

function selectRelation(label, value, entries, onChange) {
  return field(label, value, onChange, {
    select: entries
      .filter((item) => item.status !== "draft")
      .map((item) => ({ label: `${item.title} (${item.slug})`, value: item.slug })),
  });
}

function imageChoiceField(label, value, project, onChange) {
  const options = projectImageOptions(project);
  if (value && !options.includes(assetPath(value))) options.unshift(assetPath(value));
  return field(label, assetPath(value), onChange, {
    select: [
      { label: "Choose image", value: "" },
      ...options.map((item) => ({ label: item, value: item })),
    ],
    help: project
      ? `Images are drawn from ${project.title}'s card, hero, gallery, and project folder.`
      : "Choose a Project first.",
  });
}

function uploadProjectImageControl(project, onUploaded) {
  const wrap = el("div", { class: "upload-box" });
  const file = el("input", { type: "file", accept: "image/*" });
  const filename = el("input", {
    type: "text",
    placeholder: "filename.png",
    "aria-label": "Filename",
  });
  file.addEventListener("change", () => {
    const selected = file.files && file.files[0];
    if (selected && !filename.value) filename.value = selected.name;
  });
  wrap.append(
    el("p", { class: "help", text: `Upload into assets/images/projects/${project.slug}/. Assign it after upload to use it on this page/card.` }),
    file,
    filename,
    el("button", {
      class: "button secondary",
      type: "button",
      text: "Upload image",
      onclick: async () => {
        const selected = file.files && file.files[0];
        if (!selected) {
          setStatus("Choose an image before uploading.", true);
          return;
        }
        try {
          setStatus("Uploading image...");
          const dataUrl = await readFileAsDataUrl(selected);
          const payload = await api(`/api/content/project/${encodeURIComponent(project.slug)}/upload`, {
            method: "POST",
            body: JSON.stringify({
              filename: filename.value || selected.name,
              dataUrl,
            }),
          });
          state.home = payload.home;
          state.services = payload.services || state.services;
          state.projects = payload.projects || state.projects;
          setStatus(`Uploaded ${payload.path}.`);
          onUploaded(payload.path);
        } catch (error) {
          setStatus(error.message, true);
        }
      },
    }),
  );
  return wrap;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createProjectButton() {
  return el("button", {
    class: "button secondary",
    type: "button",
    text: "Create project",
    onclick: openCreateProjectModal,
  });
}

function serviceThumb(entry, type) {
  if (!entry) {
    return el("div", { class: "source-card" }, [el("strong", { text: "Missing relation" })]);
  }
  return el("div", { class: "thumb-row" }, [
    el("img", { src: assetPath(entry.cardImage), alt: entry.cardAlt || entry.title }),
    el("div", {}, [
      el("h3", { text: entry.title }),
      el("p", { text: `${type === "service" ? "Service" : "Project"} source: ${entry.slug}` }),
      el("p", { text: entry.url }),
    ]),
  ]);
}

function relationButtons(items, index, onChange) {
  return el("div", { class: "button-row" }, [
    el("button", {
      class: "button secondary",
      type: "button",
      text: "Move up",
      onclick: () => {
        if (index <= 0) return;
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        onChange();
      },
    }),
    el("button", {
      class: "button secondary",
      type: "button",
      text: "Move down",
      onclick: () => {
        if (index >= items.length - 1) return;
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        onChange();
      },
    }),
    el("button", {
      class: "button danger",
      type: "button",
      text: "Remove",
      onclick: () => {
        items.splice(index, 1);
        onChange();
      },
    }),
  ]);
}

function cardSpan(relation, count) {
  if (count === 1) return "";
  if (count === 2) return "span-6";
  return relation.cardSpan || "span-4";
}

function syncPreview() {
  if (!state.frameReady || !state.home) return;
  const doc = frame.contentDocument;
  if (!doc) return;

  applyPreviewMode(doc);

  if (state.currentPage.kind !== "home") {
    syncCurrentPage(doc);
    injectPreviewHooks();
    markPreviewSelection();
    return;
  }

  const hero = state.home.hero || {};
  const heroHeadline = doc.querySelector(".hero .headline");
  const heroSubhead = doc.querySelector(".hero .subhead");
  setText(heroHeadline, hero.headline);
  setText(heroSubhead, hero.subhead);
  markEditableText(heroHeadline, "home.hero.headline", "Edit homepage hero headline");
  markEditableText(heroSubhead, "home.hero.subhead", "Edit homepage hero subhead");

  syncCarousel(doc);
  syncServiceCards(doc);
  syncProjectCards(doc);
  syncPhilosophy(doc);
  syncCta(doc);
  injectPreviewHooks();
  markPreviewSelection();
}

function setText(node, value) {
  if (node) node.textContent = value || "";
}

function setImage(node, src, alt) {
  if (!node) return;
  node.src = assetPath(src);
  node.alt = alt || "";
}

function markEditable(node, token, label) {
  if (!node || !token) return;
  node.classList.add("cms-edit-target", "cms-edit-field");
  node.dataset.cmsSelect = token;
  if (label) node.setAttribute("aria-label", label);
}

function markEditableText(node, path, label) {
  markEditable(node, `text:${path}`, label || "Edit text");
}

function markEditableImage(node, path, label) {
  markEditable(node, `image:${path}`, label || "Edit image");
}

function syncCurrentPage(doc) {
  if (state.currentPage.kind === "about") syncAboutPage(doc);
  else if (state.currentPage.kind === "contact") syncContactPage(doc);
  else if (state.currentPage.kind === "projectsPage") syncProjectsPage(doc);
  else if (state.currentPage.kind === "project") syncProjectDetailPage(doc, state.currentPage.slug);
  else if (state.currentPage.kind === "service") syncServiceDetailPage(doc, state.currentPage.slug);
}

function syncAboutPage(doc) {
  const page = state.pages.about || {};
  const section = doc.querySelector(".about-content");
  if (section) {
    section.classList.add("cms-edit-target");
    section.dataset.cmsSelect = "page:about";
  }
  const introHeading = doc.querySelector(".about-content .space-y-4 .h2");
  const introText = doc.querySelector(".about-content .space-y-4 .lead");
  setText(introHeading, page.introHeading);
  setText(introText, page.introText);
  markEditableText(introHeading, "page.about.introHeading", "Edit about intro heading");
  markEditableText(introText, "page.about.introText", "Edit about intro text");
  const titles = doc.querySelectorAll(".about-content .title");
  setText(titles[0], page.workHeading);
  setText(titles[1], page.focusHeading);
  markEditableText(titles[0], "page.about.workHeading", "Edit work heading");
  markEditableText(titles[1], "page.about.focusHeading", "Edit focus heading");
  doc.querySelectorAll(".about-content .grid.md\\:grid-cols-2 .space-y-3:first-child p").forEach((node, index) => {
    setText(node, (page.workParagraphs || [])[index]);
    markEditableText(node, `page.about.workParagraphs.${index}`, `Edit work paragraph ${index + 1}`);
  });
  doc.querySelectorAll(".about-content .grid.md\\:grid-cols-2 .space-y-3:last-child li").forEach((node, index) => {
    setText(node, (page.focusAreas || [])[index]);
    markEditableText(node, `page.about.focusAreas.${index}`, `Edit focus area ${index + 1}`);
  });
  doc.querySelectorAll(".about-content .grid.md\\:grid-cols-3 .space-y-2").forEach((node, index) => {
    const step = (page.processSteps || [])[index];
    if (!step) return;
    const stepTitle = node.querySelector(".title");
    const stepText = node.querySelector(".text-sm");
    setText(stepTitle, step.title);
    setText(stepText, step.text);
    markEditableText(stepTitle, `page.about.processSteps.${index}.title`, `Edit process step title`);
    markEditableText(stepText, `page.about.processSteps.${index}.text`, `Edit process step text`);
  });
  const locationsHeading = doc.querySelector(".about-content .space-y-4:last-child .h2");
  const locationsText = doc.querySelector(".about-content .space-y-4:last-child p");
  setText(locationsHeading, page.locationsHeading);
  setText(locationsText, page.locationsText);
  markEditableText(locationsHeading, "page.about.locationsHeading", "Edit locations heading");
  markEditableText(locationsText, "page.about.locationsText", "Edit locations text");
}

function syncContactPage(doc) {
  const page = state.pages.contact || {};
  const section = doc.querySelector(".contact-content");
  if (section) {
    section.classList.add("cms-edit-target");
    section.dataset.cmsSelect = "page:contact";
  }
  const heading = doc.querySelector(".contact-content h1.h2");
  const lead = doc.querySelector(".contact-content .lead");
  const detailsHeading = doc.querySelector(".contact-content .title");
  const note = doc.querySelector(".contact-content .contact-note");
  setText(heading, page.heading);
  setText(lead, page.lead);
  setText(detailsHeading, page.detailsHeading);
  setText(note, page.note);
  markEditableText(heading, "page.contact.heading", "Edit contact heading");
  markEditableText(lead, "page.contact.lead", "Edit contact lead");
  markEditableText(detailsHeading, "page.contact.detailsHeading", "Edit contact details heading");
  markEditableText(note, "page.contact.note", "Edit contact note");
}

function syncProjectsPage(doc) {
  const page = state.pages.projectsPage || {};
  const hero = doc.querySelector(".hero");
  if (hero) {
    hero.classList.add("cms-edit-target");
    hero.dataset.cmsSelect = "page:projectsPage";
  }
  const band = doc.querySelector(".projects-band");
  if (band) {
    band.classList.add("cms-edit-target");
    band.dataset.cmsSelect = "page:projectsPage";
  }
  const headline = doc.querySelector(".hero .headline");
  const subhead = doc.querySelector(".hero .subhead");
  setText(headline, page.heroHeadline);
  setText(subhead, page.heroSubhead);
  markEditableText(headline, "page.projectsPage.heroHeadline", "Edit projects page headline");
  markEditableText(subhead, "page.projectsPage.heroSubhead", "Edit projects page subhead");
  doc.querySelectorAll(".widget").forEach((widget) => {
    const match = widget.getAttribute("href") && widget.getAttribute("href").match(/^\/projects\/([^/]+)\.html$/);
    if (!match) return;
    const project = projectBySlug(match[1]);
    if (!project) return;
    widget.classList.add("cms-edit-target");
    widget.dataset.cmsSelect = `project:${project.slug}`;
    const image = widget.querySelector(".widget-media");
    const title = widget.querySelector(".widget-title");
    const meta = widget.querySelector(".widget-meta");
    setImage(image, project.cardImage, project.cardAlt || project.title);
    setText(title, project.title);
    setText(meta, project.kicker);
    markEditableImage(image, `project.${project.slug}.cardImage`, `Edit ${project.title} card image`);
    markEditableText(title, `project.${project.slug}.title`, `Edit ${project.title} title`);
    markEditableText(meta, `project.${project.slug}.kicker`, `Edit ${project.title} kicker`);
  });
  doc.querySelectorAll(".projects-band > section").forEach((section, index) => {
    const category = (page.categories || [])[index];
    if (!category) return;
    const label = section.querySelector(".section-label");
    const heading = section.querySelector(".section-head .h2");
    const note = section.querySelector(".section-note");
    setText(label, category.label);
    setText(heading, category.heading);
    setText(note, category.note);
    markEditableText(label, `page.projectsPage.categories.${index}.label`, "Edit category label");
    markEditableText(heading, `page.projectsPage.categories.${index}.heading`, "Edit category heading");
    markEditableText(note, `page.projectsPage.categories.${index}.note`, "Edit category note");
  });
}

function syncProjectDetailPage(doc, slug) {
  const project = projectBySlug(slug);
  if (!project) return;
  const isComingSoon = project.status === "coming_soon";
  if (doc.body) doc.body.classList.toggle("visual-cms-project-coming-soon", isComingSoon);
  doc.querySelectorAll(".project-hero, .project-body").forEach((node) => {
    node.classList.add("cms-edit-target");
    node.dataset.cmsSelect = `project:${slug}`;
  });
  const kicker = doc.querySelector(".project-kicker");
  syncProjectHeroCarousel(doc, project, isComingSoon);
  setText(kicker, project.kicker);
  markEditableText(kicker, `project.${slug}.kicker`, `Edit ${project.title} kicker`);
  const title = doc.querySelector(".project-title");
  if (title) {
    const titleSpan = title.querySelector("span:first-child");
    if (titleSpan) {
      setText(titleSpan, project.title);
      markEditableText(titleSpan, `project.${slug}.title`, `Edit ${project.title} title`);
    } else {
      setText(title, project.title);
      markEditableText(title, `project.${slug}.title`, `Edit ${project.title} title`);
    }
    let badge = title.querySelector(".coming-soon-badge");
    if (!badge && isComingSoon) {
      badge = doc.createElement("span");
      badge.className = "coming-soon-badge";
      badge.setAttribute("aria-label", "Status");
      title.appendChild(badge);
    }
    if (badge) {
      if (isComingSoon) {
        badge.textContent = project.statusLabel || "Coming soon";
        badge.hidden = false;
        markEditableText(badge, `project.${slug}.statusLabel`, `Edit ${project.title} status label`);
      } else {
        badge.hidden = true;
      }
    }
  }
  const subtitle = doc.querySelector(".project-subtitle");
  setText(subtitle, project.subtitle || project.summary);
  markEditableText(subtitle, `project.${slug}.subtitle`, `Edit ${project.title} subtitle`);
  doc.querySelectorAll(".project-tag").forEach((node, index) => {
    setText(node, (project.projectTags || [])[index]);
    markEditableText(node, `project.${slug}.projectTags.${index}`, `Edit ${project.title} tag`);
  });

  const heading = doc.querySelector(".project-article .project-h2");
  const lead = doc.querySelector(".project-article .project-lead");
  setText(heading, isComingSoon ? (project.articleHeading || project.statusLabel || "Coming soon") : (project.articleHeading || "Overview"));
  setText(lead, project.lead || project.summary || project.subtitle);
  markEditableText(heading, `project.${slug}.articleHeading`, `Edit ${project.title} article heading`);
  markEditableText(lead, `project.${slug}.lead`, `Edit ${project.title} lead`);

  const article = doc.querySelector(".project-article");
  if (article) {
    [...article.children].forEach((child) => {
      if (!isComingSoon) {
        child.hidden = false;
        if (
          !child.classList.contains("project-h2") &&
          !child.classList.contains("project-lead") &&
          !child.classList.contains("project-callout")
        ) {
          markEditableText(child, `project.${slug}.body`, `Edit ${project.title} body`);
        }
        return;
      }
      child.hidden = !(
        child.classList.contains("project-h2") ||
        child.classList.contains("project-lead") ||
        child.classList.contains("project-callout")
      );
    });
  }
  doc.querySelectorAll(".project-gallery-card").forEach((node) => { node.hidden = true; });
  const calloutTitle = doc.querySelector(".project-callout-title");
  const calloutText = doc.querySelector(".project-callout-text");
  if (calloutTitle) {
    setText(calloutTitle, project.callout && project.callout.title);
    markEditableText(calloutTitle, `project.${slug}.callout.title`, `Edit ${project.title} callout title`);
  }
  if (calloutText) {
    setText(calloutText, project.callout && project.callout.text);
    markEditableText(calloutText, `project.${slug}.callout.text`, `Edit ${project.title} callout text`);
  }
  doc.querySelectorAll(".project-fact").forEach((node, index) => {
    const fact = (project.facts || [])[index];
    if (!fact) return;
    const label = node.querySelector("dt");
    const value = node.querySelector("dd");
    setText(label, fact.label);
    setText(value, fact.value);
    markEditableText(label, `project.${slug}.facts.${index}.label`, `Edit project fact label`);
    markEditableText(value, `project.${slug}.facts.${index}.value`, `Edit project fact value`);
  });
  const asideText = doc.querySelector(".project-aside .project-muted");
  if (asideText && !asideText.closest(".project-gallery-card")) {
    setText(asideText, project.asideText);
    markEditableText(asideText, `project.${slug}.asideText`, `Edit aside text`);
  }
  const galleryHeading = doc.querySelector(".project-gallery-card .project-h2");
  const galleryText = doc.querySelector(".project-gallery-card .project-muted");
  if (galleryHeading) {
    setText(galleryHeading, project.gallery && project.gallery.heading);
    markEditableText(galleryHeading, `project.${slug}.gallery.heading`, "Edit gallery heading");
  }
  if (galleryText) {
    setText(galleryText, project.gallery && project.gallery.text);
    markEditableText(galleryText, `project.${slug}.gallery.text`, "Edit gallery text");
  }
  const ctaHeading = doc.querySelector(".about-cta-band .h2");
  const ctaText = doc.querySelector(".about-cta-band .lead");
  setText(ctaHeading, project.ctaHeading);
  setText(ctaText, project.ctaText);
  markEditableText(ctaHeading, `project.${slug}.ctaHeading`, "Edit project CTA heading");
  markEditableText(ctaText, `project.${slug}.ctaText`, "Edit project CTA text");
}

function syncProjectHeroCarousel(doc, project, isComingSoon) {
  const media = doc.querySelector(".project-hero-media");
  if (!media) return;
  let track = media.querySelector(".project-hero-track");
  if (!track) {
    const currentImage = media.querySelector("img");
    track = doc.createElement("div");
    track.className = "project-hero-track";
    if (currentImage) {
      const slide = doc.createElement("div");
      slide.className = "project-hero-slide";
      slide.appendChild(currentImage);
      track.appendChild(slide);
    }
    media.prepend(track);
  }

  const galleryImages = !isComingSoon && project.gallery && project.gallery.images
    ? project.gallery.images
    : [];
  const desired = [
    { image: project.heroImage, alt: project.heroAlt || project.title, token: `project.${project.slug}.heroImage` },
    ...galleryImages.map((item, index) => ({
      image: item.image,
      alt: item.alt || project.title,
      token: `project.${project.slug}.gallery.images.${index}.image`,
    })),
  ];

  track.innerHTML = "";
  desired.forEach((item, index) => {
    const slide = doc.createElement("div");
    slide.className = "project-hero-slide";
    const image = doc.createElement("img");
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";
    setImage(image, item.image, item.alt);
    markEditableImage(image, item.token, index === 0 ? "Edit project hero image" : `Edit project carousel image ${index}`);
    slide.appendChild(image);
    track.appendChild(slide);
  });

  media.classList.toggle("project-hero-carousel", desired.length > 1);
  media.toggleAttribute("data-project-carousel", desired.length > 1);
  track.style.transform = "translateX(0)";
  media.querySelectorAll("[data-project-carousel-prev], [data-project-carousel-next], [data-project-carousel-dots]").forEach((node) => {
    node.hidden = desired.length <= 1;
  });
}

function syncServiceDetailPage(doc, slug) {
  const service = serviceBySlug(slug);
  if (!service) return;
  const section = doc.querySelector(".concept-content");
  if (section) {
    section.classList.add("cms-edit-target");
    section.dataset.cmsSelect = `service:${slug}`;
  }
  const image = doc.querySelector(".concept-hero img");
  const lead = doc.querySelector(".concept-lead");
  setImage(image, service.coverImage, service.coverAlt || service.title);
  setText(lead, service.intro || service.summary);
  markEditableImage(image, `service.${slug}.coverImage`, `Edit ${service.title} cover image`);
  markEditableText(lead, `service.${slug}.intro`, `Edit ${service.title} intro`);
  doc.querySelectorAll(".concept-glance-list li").forEach((node, index) => {
    const item = (service.glance || [])[index];
    if (!item) return;
    const label = node.querySelector("strong");
    if (label) {
      label.textContent = `${item.label}:`;
      markEditableText(label, `service.${slug}.glance.${index}.label`, `Edit ${service.title} glance label`);
    }
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) child.textContent = "";
    });
    node.appendChild(doc.createTextNode(` ${item.text || ""}`));
    markEditableText(node, `service.${slug}.glance.${index}.text`, `Edit ${service.title} glance text`);
  });
  doc.querySelectorAll(".concept-block").forEach((block, sectionIndex) => {
    const section = (service.sections || [])[sectionIndex];
    if (!section) return;
    const heading = block.querySelector(".title2");
    setText(heading, section.heading);
    markEditableText(heading, `service.${slug}.sections.${sectionIndex}.heading`, `Edit service section heading`);
    block.querySelectorAll(".concept-list li").forEach((itemNode, itemIndex) => {
      setText(itemNode, (section.items || [])[itemIndex]);
      markEditableText(itemNode, `service.${slug}.sections.${sectionIndex}.items.${itemIndex}`, `Edit service list item`);
    });
    const note = block.querySelector(".concept-meta");
    if (note) {
      setText(note, section.note);
      markEditableText(note, `service.${slug}.sections.${sectionIndex}.note`, `Edit service section note`);
    }
  });
  const enquiryHeading = doc.querySelector(".enquiry-title");
  const enquiryText = doc.querySelector(".form-card .concept-meta");
  setText(enquiryHeading, service.enquiryHeading);
  setText(enquiryText, service.enquiryText);
  markEditableText(enquiryHeading, `service.${slug}.enquiryHeading`, "Edit enquiry heading");
  markEditableText(enquiryText, `service.${slug}.enquiryText`, "Edit enquiry text");
  const ctaHeading = doc.querySelector(".about-cta-band .h2");
  const ctaText = doc.querySelector(".about-cta-band .lead");
  setText(ctaHeading, service.ctaHeading);
  setText(ctaText, service.ctaText);
  markEditableText(ctaHeading, `service.${slug}.ctaHeading`, "Edit service CTA heading");
  markEditableText(ctaText, `service.${slug}.ctaText`, "Edit service CTA text");
}

function syncCarousel(doc) {
  const slides = (state.home.carousel && state.home.carousel.slides) || [];
  const track = doc.getElementById("track");
  if (!track) return;
  track.innerHTML = "";
  slides.forEach((slide, index) => {
    const project = projectBySlug(slide.project);
    const wrapper = doc.createElement("div");
    wrapper.className = "slide cms-edit-target";
    wrapper.setAttribute("aria-label", `${index + 1} of ${slides.length}`);
    wrapper.dataset.cmsSelect = "carousel";
    const img = doc.createElement("img");
    img.src = assetPath(slide.image || (project && (project.heroImage || project.cardImage)) || "");
    img.alt = slide.alt || (project && (project.heroAlt || project.cardAlt || project.title)) || "";
    img.width = 1600;
    img.height = 900;
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    markEditableImage(img, `home.carousel.slides.${index}.image`, `Edit carousel slide ${index + 1} image`);
    wrapper.appendChild(img);
    track.appendChild(wrapper);
  });
  const dots = doc.getElementById("dots");
  if (dots) {
    dots.innerHTML = "";
    slides.forEach((_, index) => {
      const dot = doc.createElement("button");
      dot.className = `dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dots.appendChild(dot);
    });
  }
}

function syncServiceCards(doc) {
  const section = state.home.servicesSection || {};
  const kicker = doc.querySelector("#services .kicker");
  const heading = doc.querySelector("#services .h2");
  const lead = doc.querySelector("#services .lead");
  setText(kicker, section.kicker);
  setText(heading, section.heading);
  setText(lead, section.lead);
  markEditableText(kicker, "home.servicesSection.kicker", "Edit services section kicker");
  markEditableText(heading, "home.servicesSection.heading", "Edit services section heading");
  markEditableText(lead, "home.servicesSection.lead", "Edit services section lead");
  const grid = doc.querySelector("#services .card-grid");
  if (!grid) return;
  const relations = section.featuredServices || [];
  grid.innerHTML = "";
  relations.forEach((relation) => {
    const service = serviceBySlug(relation.service);
    if (service) grid.appendChild(makeCard(doc, service, "service", cardSpan(relation, relations.length)));
  });
}

function syncProjectCards(doc) {
  const section = state.home.collectionsSection || {};
  const kicker = doc.querySelector("#selected-work .kicker2");
  const heading = doc.querySelector("#selected-work .h22");
  setText(kicker, section.kicker);
  setText(heading, section.heading);
  markEditableText(kicker, "home.collectionsSection.kicker", "Edit collections section kicker");
  markEditableText(heading, "home.collectionsSection.heading", "Edit collections section heading");
  const grid = doc.querySelector("#selected-work .card-grid");
  if (!grid) return;
  const relations = section.featuredProjects || [];
  grid.innerHTML = "";
  relations.forEach((relation, index) => {
    const project = projectBySlug(relation.project);
    if (project) grid.appendChild(makeCard(doc, project, "project", cardSpan(relation, relations.length), relation.image, {
      imagePath: `home.collectionsSection.featuredProjects.${index}.image`,
      cardToken: `homeProjectCard:${index}`,
    }));
  });
}

function makeCard(doc, entry, type, span, imageOverride = "", options = {}) {
  const card = doc.createElement("a");
  card.className = `card ${span || ""} cms-edit-target`;
  card.href = entry.url;
  card.dataset.cmsSelect = options.cardToken || `${type}:${entry.slug}`;
  card.setAttribute("aria-label", `Edit ${entry.title}`);

  const imgWrap = doc.createElement("div");
  imgWrap.className = "img-wrap";
  const img = doc.createElement("img");
  img.src = assetPath(imageOverride || entry.cardImage);
  img.alt = entry.cardAlt || entry.title;
  img.loading = "lazy";
  img.decoding = "async";
  markEditableImage(img, options.imagePath || `${type}.${entry.slug}.cardImage`, `Edit ${entry.title} card image`);
  imgWrap.appendChild(img);

  const body = doc.createElement("div");
  body.className = "body";
  const title = doc.createElement("h3");
  title.className = type === "project" ? "title2" : "title";
  title.textContent = entry.title;
  markEditableText(title, `${type}.${entry.slug}.title`, `Edit ${entry.title} title`);
  const meta = doc.createElement("p");
  meta.className = type === "project" ? "muted2" : "muted";
  meta.textContent = type === "project" ? entry.kicker : entry.summary;
  markEditableText(meta, `${type}.${entry.slug}.${type === "project" ? "kicker" : "summary"}`, `Edit ${entry.title} card text`);
  body.append(title, meta);
  card.append(imgWrap, body);
  return card;
}

function syncPhilosophy(doc) {
  const philosophy = state.home.philosophy || {};
  const kicker = doc.querySelector("#about > .container > .kicker");
  const heading = doc.querySelector("#about .content .h2");
  setText(kicker, philosophy.kicker);
  setText(heading, philosophy.heading);
  markEditableText(kicker, "home.philosophy.kicker", "Edit design philosophy kicker");
  markEditableText(heading, "home.philosophy.heading", "Edit design philosophy heading");
  const img = doc.querySelector("#about .media img");
  if (img) {
    setImage(img, philosophy.image, philosophy.imageAlt);
    markEditableImage(img, "home.philosophy.image", "Edit design philosophy image");
  }
  const content = doc.querySelector("#about .content");
  if (content) {
    [...content.querySelectorAll("p")].forEach((node) => node.remove());
    (philosophy.paragraphs || []).forEach((paragraph, index) => {
      const p = doc.createElement("p");
      p.textContent = paragraph;
      markEditableText(p, `home.philosophy.paragraphs.${index}`, `Edit design philosophy paragraph ${index + 1}`);
      content.appendChild(p);
    });
  }
}

function syncCta(doc) {
  const cta = state.home.cta || {};
  const heading = doc.querySelector("#about .cta h3");
  const text = doc.querySelector("#about .cta .lead");
  setText(heading, cta.heading);
  setText(text, cta.text);
  markEditableText(heading, "home.cta.heading", "Edit CTA heading");
  markEditableText(text, "home.cta.text", "Edit CTA text");
  const link = doc.querySelector("#about .cta .button");
  if (link) {
    [...link.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = ` ${cta.buttonLabel || ""}`;
    });
    markEditableText(link, "home.cta.buttonLabel", "Edit CTA button label");
  }
}

function applyPreviewMode(doc) {
  if (!doc || !doc.body) return;
  doc.body.classList.toggle("visual-cms-navigate", state.mode === "navigate");
}

function injectPreviewHooks(force = false) {
  const doc = frame.contentDocument;
  if (!doc) return;
  applyPreviewMode(doc);
  if (!doc.getElementById("visual-cms-preview-style")) {
    const style = doc.createElement("style");
    style.id = "visual-cms-preview-style";
    style.textContent = `
    .cms-edit-target, .hero, #portfolio, #services, #selected-work, #about .split, #about .cta,
    .about-content, .contact-content, .projects-band, .project-hero, .project-body, .concept-content {
      cursor: pointer !important;
      outline: 2px solid transparent;
      outline-offset: 4px;
    }
    .cms-edit-target:hover, .hero:hover, #portfolio:hover, #services:hover, #selected-work:hover, #about .split:hover, #about .cta:hover,
    .about-content:hover, .contact-content:hover, .projects-band:hover, .project-hero:hover, .project-body:hover, .concept-content:hover {
      outline-color: rgba(72, 184, 148, 0.85);
    }
    .cms-edit-active {
      outline-color: #48b894 !important;
      box-shadow: 0 0 0 4px rgba(72, 184, 148, 0.2);
    }
    body.visual-cms-navigate .cms-edit-target,
    body.visual-cms-navigate .hero,
    body.visual-cms-navigate #portfolio,
    body.visual-cms-navigate #services,
    body.visual-cms-navigate #selected-work,
    body.visual-cms-navigate #about .split,
    body.visual-cms-navigate #about .cta,
    body.visual-cms-navigate .about-content,
    body.visual-cms-navigate .contact-content,
    body.visual-cms-navigate .projects-band,
    body.visual-cms-navigate .project-hero,
    body.visual-cms-navigate .project-body,
    body.visual-cms-navigate .concept-content {
      cursor: inherit !important;
      outline-color: transparent !important;
      box-shadow: none !important;
    }
  `;
    doc.head.appendChild(style);
  } else if (!force) {
    applyPreviewMode(doc);
  }

  if (doc.documentElement.dataset.visualCmsListener === "true") return;
  doc.documentElement.dataset.visualCmsListener = "true";

  doc.addEventListener("click", (event) => {
    if (state.mode !== "edit") return;
    const target = event.target.closest("[data-cms-select], .hero, #portfolio, #services, #selected-work, #about .split, #about .cta, .about-content, .contact-content, .projects-band, .project-hero, .project-body, .concept-content");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();

    const explicit = target.dataset.cmsSelect;
    if (explicit) {
      selectToken(explicit);
      return;
    }
    if (target.matches(".hero")) select("hero");
    else if (target.matches("#portfolio")) select("carousel");
    else if (target.matches("#services")) select("servicesSection");
    else if (target.matches("#selected-work")) select("collectionsSection");
    else if (target.matches("#about .split")) select("philosophy");
    else if (target.matches("#about .cta")) select("cta");
    else if (target.matches(".about-content")) select("page", "about");
    else if (target.matches(".contact-content")) select("page", "contact");
    else if (target.matches(".projects-band")) select("page", "projectsPage");
  }, true);
}

function markPreviewSelection() {
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.querySelectorAll(".cms-edit-active").forEach((node) => node.classList.remove("cms-edit-active"));
  if (!state.selected) return;
  let selector = "";
  if (state.selected.type === "hero") selector = ".hero";
  else if (state.selected.type === "carousel") selector = "#portfolio";
  else if (state.selected.type === "servicesSection") selector = "#services";
  else if (state.selected.type === "collectionsSection") selector = "#selected-work";
  else if (state.selected.type === "homeProjectCard") selector = `[data-cms-select="homeProjectCard:${state.selected.slug}"]`;
  else if (state.selected.type === "philosophy") selector = "#about .split";
  else if (state.selected.type === "cta") selector = "#about .cta";
  else selector = `[data-cms-select="${state.selected.type}:${state.selected.slug}"]`;
  const target = doc.querySelector(selector);
  if (target) target.classList.add("cms-edit-active");
}

frame.addEventListener("load", () => {
  state.frameReady = true;
  detectCurrentPage();
  if (state.mode === "edit" && !state.selected) {
    state.selected = defaultSelectionForCurrentPage();
    renderEditor();
  }
  syncPreview();
});

navigateModeButton.addEventListener("click", () => setMode("navigate"));
editModeButton.addEventListener("click", () => setMode("edit"));

reloadButton.addEventListener("click", async () => {
  try {
    await loadContent();
    frame.contentWindow.location.reload();
  } catch (error) {
    setStatus(error.message, true);
  }
});

const imagesButton = document.getElementById("imagesButton");
if (imagesButton) {
  imagesButton.addEventListener("click", showImagesPanel);
}

/* =========================================================
   Images browser — group all assets by Projects vs Site, allow
   navigation between them via two dropdowns, and surface an
   "Edit project" jump for project images.
   ========================================================= */

async function loadImageBuckets() {
  const payload = await api("/api/content/images");
  state.imageBuckets = payload.buckets || [];
  return state.imageBuckets;
}

function flatGroups() {
  const groups = [];
  for (const bucket of state.imageBuckets) {
    for (const group of bucket.groups) {
      groups.push({ ...group, bucketId: bucket.id, bucketName: bucket.name });
    }
  }
  return groups;
}

function findGroup(groupId) {
  return flatGroups().find((g) => g.id === groupId) || null;
}

function findGroupForPath(imagePath) {
  if (!imagePath) return null;
  const normalized = assetPath(imagePath);
  for (const bucket of state.imageBuckets) {
    for (const group of bucket.groups) {
      if (group.images.some((img) => img.path === normalized)) return group;
    }
  }
  return null;
}

function selectImage(groupId, filename) {
  const group = findGroup(groupId);
  if (!group) return;
  const image = group.images.find((img) => img.filename === filename) || group.images[0];
  if (!image) return;
  state.selectedImage = { groupId, filename: image.filename };
  state.selected = { type: "imageBrowse" };
  renderEditor();
}

function openImagesIndex() {
  state.selected = { type: "imagesIndex" };
  renderEditor();
}

async function showImagesPanel() {
  try {
    setStatus("Loading images...");
    await loadImageBuckets();
    setStatus("Images loaded.");
    if (state.selectedImage && findGroup(state.selectedImage.groupId)) {
      state.selected = { type: "imageBrowse" };
    } else {
      state.selected = { type: "imagesIndex" };
    }
    renderEditor();
  } catch (error) {
    setStatus(error.message, true);
  }
}

function renderImagesIndex() {
  const groups = flatGroups();
  const container = el("section", { class: "panel-section" });
  container.appendChild(sectionHeader(
    "Images browser",
    "All site images",
    "Browse images grouped by project and by site section. Click any image to open it with project and file dropdowns.",
  ));

  if (!groups.length) {
    container.appendChild(el("p", { class: "help", text: "No images found yet." }));
    editor.appendChild(container);
    return;
  }

  for (const bucket of state.imageBuckets) {
    if (!bucket.groups.length) continue;
    container.appendChild(el("h3", { class: "image-bucket-title", text: bucket.name }));
    for (const group of bucket.groups) {
      const groupBlock = el("div", { class: "image-group" }, [
        el("div", { class: "image-group-head" }, [
          el("p", { class: "image-group-name", text: group.name }),
          el("p", { class: "image-group-count", text: `${group.images.length} ${group.images.length === 1 ? "image" : "images"}` }),
        ]),
      ]);
      const grid = el("div", { class: "image-thumb-grid" });
      for (const image of group.images) {
        const tile = el("button", {
          class: "image-thumb",
          type: "button",
          title: image.filename,
          onclick: () => selectImage(group.id, image.filename),
        }, [
          el("img", { src: image.path, alt: image.filename, loading: "lazy" }),
          el("span", { class: "image-thumb-label", text: image.filename }),
        ]);
        grid.appendChild(tile);
      }
      groupBlock.appendChild(grid);
      container.appendChild(groupBlock);
    }
  }

  editor.appendChild(container);
}

function renderImageBrowse() {
  if (!state.selectedImage) {
    openImagesIndex();
    return;
  }
  const group = findGroup(state.selectedImage.groupId);
  if (!group) {
    openImagesIndex();
    return;
  }
  const image = group.images.find((img) => img.filename === state.selectedImage.filename) || group.images[0];
  if (!image) {
    openImagesIndex();
    return;
  }

  const groups = flatGroups();
  const container = el("section", { class: "panel-section" });

  container.appendChild(el("div", { class: "image-browse-back" }, [
    el("button", {
      class: "button-link",
      type: "button",
      text: "← Back to all images",
      onclick: openImagesIndex,
    }),
  ]));

  container.appendChild(el("div", { class: "image-browse-preview" }, [
    el("img", { src: image.path, alt: image.filename }),
  ]));

  // Project / Site bucket dropdown — switches the group context
  const groupSelect = el("select", { class: "image-browse-select" });
  for (const bucket of state.imageBuckets) {
    if (!bucket.groups.length) continue;
    const optgroup = el("optgroup", { label: bucket.name });
    for (const g of bucket.groups) {
      optgroup.appendChild(el("option", { value: g.id, text: g.name }));
    }
    groupSelect.appendChild(optgroup);
  }
  groupSelect.value = group.id;
  groupSelect.addEventListener("change", () => {
    selectImage(groupSelect.value);
  });

  // File-name dropdown — switches the image within the current group
  const fileSelect = el("select", { class: "image-browse-select" });
  for (const img of group.images) {
    fileSelect.appendChild(el("option", { value: img.filename, text: img.filename }));
  }
  fileSelect.value = image.filename;
  fileSelect.addEventListener("change", () => {
    selectImage(group.id, fileSelect.value);
  });

  const groupLabel = group.kind === "project" ? "Project" : "Site bucket";
  container.appendChild(el("div", { class: "field" }, [
    el("label", { text: groupLabel }),
    groupSelect,
  ]));
  container.appendChild(el("div", { class: "field" }, [
    el("label", { text: "Image file" }),
    fileSelect,
  ]));

  if (group.kind === "project" && group.slug) {
    container.appendChild(el("div", { class: "image-browse-actions" }, [
      el("button", {
        class: "button",
        type: "button",
        text: "Edit project →",
        onclick: () => {
          if (group.url) state.currentPage = { kind: "project", path: group.url, slug: group.slug };
          select("project", group.slug);
          syncPreview();
        },
      }),
    ]));
  }

  container.appendChild(el("p", { class: "help", text: image.path }));

  editor.appendChild(container);
}

function initPanelResizer() {
  if (!workspace || !panelResizer) return;
  const saved = Number(localStorage.getItem("visualCmsEditorWidth"));
  if (saved) workspace.style.setProperty("--editor-width", `${Math.min(Math.max(saved, 340), 720)}px`);

  let dragging = false;
  panelResizer.addEventListener("pointerdown", (event) => {
    dragging = true;
    panelResizer.classList.add("is-dragging");
    panelResizer.setPointerCapture(event.pointerId);
  });
  panelResizer.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const rect = workspace.getBoundingClientRect();
    const width = Math.min(Math.max(rect.right - event.clientX, 340), Math.min(760, rect.width - 360));
    workspace.style.setProperty("--editor-width", `${width}px`);
    localStorage.setItem("visualCmsEditorWidth", String(Math.round(width)));
  });
  panelResizer.addEventListener("pointerup", () => {
    dragging = false;
    panelResizer.classList.remove("is-dragging");
  });
}

modalRoot.addEventListener("click", (event) => {
  if (event.target === modalRoot) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalRoot.hidden) closeModal();
});

initPanelResizer();
loadContent().catch((error) => setStatus(error.message, true));
