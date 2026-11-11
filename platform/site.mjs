import {
  readProgress,
  toggleCompletion,
  validateProgress,
  pathProgress,
  legacyDestination,
  STORAGE_KEY,
} from "./learning.mjs";
import { mountKnowledgeCheck, courseHref } from "./practice.mjs";
import { mountSearch } from "./search-ui.mjs";
const root = document.documentElement;
const base = document.body.dataset.base || "/robotics-training/";
const $ = (id) => document.getElementById(id);
// The lab head script sets this only when a same-origin course page frames the lab.
const embedded = root.dataset.embed === "1";
const FROM_LAB = "frc1257-lab",
  FROM_SITE = "frc1257-site";

// #site-status is a visually hidden live region; the toast is its sighted twin.
let toastTimer;
function announce(message, { visible = true } = {}) {
  const live = $("site-status");
  if (live) live.textContent = message;
  if (!visible || embedded) return;
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("aria-hidden", "true");
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 5000);
}
let localStorageSafe;
try {
  localStorageSafe = window.localStorage;
} catch {
  localStorageSafe = {
    getItem() {
      throw new Error("Storage unavailable");
    },
    setItem() {
      throw new Error("Storage unavailable");
    },
  };
}
let progress = readProgress(localStorageSafe);
const pageId = document.body.dataset.pageId;
const pageToggle = $("complete-lesson");
const isDone = (id) => Object.hasOwn(progress.data.completed, id);
// Lessons a reader explicitly marked not complete; visiting them again must not re-mark them.
const SKIP_KEY = "frc1257-auto-skip-v1";
function readSkips() {
  try {
    const list = JSON.parse(localStorageSafe.getItem(SKIP_KEY) || "[]");
    return new Set(
      Array.isArray(list)
        ? list.filter((id) => typeof id === "string" && id.length <= 300).slice(0, 5000)
        : [],
    );
  } catch {
    return new Set();
  }
}
function writeSkips(skips) {
  try {
    if (skips.size) localStorageSafe.setItem(SKIP_KEY, JSON.stringify([...skips]));
    else localStorageSafe.removeItem?.(SKIP_KEY);
  } catch {}
}

const fetchJson = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw Error(url);
    return r.json();
  });
let catalogPromise, titlesPromise;
const getCatalog = () => (catalogPromise ??= fetchJson(base + "assets/catalog.json"));
const getTitles = () =>
  (titlesPromise ??= fetchJson(base + "assets/lesson-titles.json").catch(() => ({})));

// The icon is never replaced: only aria-pressed, the tooltip and the adjacent status change.
function paintToggle(button, { animate = false } = {}) {
  const done = isDone(button.dataset.lesson);
  button.setAttribute("aria-pressed", String(done));
  const tip = done ? button.dataset.tipOn : button.dataset.tipOff;
  if (tip) button.dataset.tip = tip;
  const wrapper = button.closest(".completion"),
    status = wrapper?.querySelector(".completion-status");
  if (status)
    status.textContent = done ? button.dataset.statusOn : button.dataset.statusOff;
  wrapper?.setAttribute("data-ready", "");
  button.classList.remove("just-completed");
  if (animate && done) {
    void button.offsetWidth;
    button.classList.add("just-completed");
  }
}
async function recommendNext() {
  try {
    const catalog = await getCatalog();
    for (const item of document.querySelectorAll("[data-path-id]")) {
      const path = catalog.paths.find((p) => p.id === item.dataset.pathId);
      const next = path?.lessons.find((id) => !isDone(id));
      const link = item.matches("a") ? item : item.querySelector("a.path-link");
      if (next && link) link.href = courseHref(next, base);
    }
    const box = $("next-activity");
    if (!box || embedded) return;
    const path = catalog.paths.find((p) => p.lessons.includes(pageId));
    if (!path) {
      box.hidden = true;
      return;
    }
    const next = path.lessons.find((id) => id !== pageId && !isDone(id)),
      titles = next ? await getTitles() : {};
    const label = document.createElement("span"),
      name = document.createElement("span");
    label.className = "next-label";
    name.className = "next-path";
    name.textContent = path.title;
    box.replaceChildren();
    if (next) {
      label.textContent = "Up next";
      const link = document.createElement("a");
      link.href = courseHref(next, base);
      link.textContent = titles[next] || "Next unfinished activity";
      box.append(label, link, name);
    } else {
      label.textContent = "Path visited";
      const text = document.createElement("span");
      text.textContent =
        "Every other activity in this path is marked complete. Try a practice project and explain one result to a teammate.";
      box.append(label, text, name);
    }
    box.hidden = false;
  } catch {}
}
function refreshProgress() {
  for (const button of document.querySelectorAll("[data-complete-toggle]"))
    paintToggle(button);
  const count = Object.keys(progress.data.completed).length;
  if ($("progress-summary"))
    $("progress-summary").textContent =
      `${count} ${count === 1 ? "activity" : "activities"} completed on this browser`;
  // Home shows path progress only once started; the learning-paths table always does.
  for (const el of document.querySelectorAll("[data-path-lessons]")) {
    try {
      const p = pathProgress(
        JSON.parse(el.dataset.pathLessons),
        progress.data.completed,
      );
      const show = el.dataset.progressReveal !== "started" || p.done > 0;
      const label = el.querySelector("[data-path-progress]");
      if (label) {
        label.textContent = `${p.done} of ${p.total} completed`;
        label.hidden = !show;
      }
      const bar = el.querySelector("progress");
      if (bar) {
        bar.max = p.total || 1;
        bar.value = p.done;
        bar.hidden = !show;
      }
    } catch {}
  }
  recommendNext();
}
function saveProgress(data) {
  progress.data = data;
  try {
    localStorageSafe.setItem(STORAGE_KEY, JSON.stringify(data));
    progress.available = true;
  } catch {
    progress.available = false;
    announce(
      "Progress works for this visit, but browser storage is unavailable. Export a copy to keep it.",
    );
  }
  refreshProgress();
}
document.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-complete-toggle]");
  if (!button) return;
  const id = button.dataset.lesson;
  saveProgress(toggleCompletion(progress.data, id));
  const done = isDone(id),
    skips = readSkips();
  if (done) skips.delete(id);
  else skips.add(id);
  writeSkips(skips);
  for (const other of document.querySelectorAll("[data-complete-toggle]"))
    if (other.dataset.lesson === id) paintToggle(other, { animate: other === button });
  announce(
    `${button.dataset.noun || "Activity"}: ${done ? button.dataset.statusOn : button.dataset.statusOff}.`,
    { visible: false },
  );
});
// Opening a lesson (or a full lab page) records a visit once. The first timestamp is kept,
// a reader's explicit "not complete" is respected, and embedded labs never self-complete.
function autoComplete() {
  if (embedded || !pageToggle || pageToggle.dataset.auto !== "visit") return;
  const id = pageToggle.dataset.lesson;
  if (!id || !progress.available || isDone(id) || readSkips().has(id)) return;
  const next = validateProgress(progress.data);
  next.completed[id] = new Date().toISOString();
  saveProgress(validateProgress(next));
  paintToggle(pageToggle, { animate: true });
  announce(`${pageToggle.dataset.noun || "Lesson"} marked complete on this browser.`, {
    visible: false,
  });
}
$("progress-export")?.addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(progress.data, null, 2)], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "1257-learning-progress.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce("Progress exported. It contains lesson IDs and completion dates only.");
});
$("progress-import")?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 1_000_000)
      throw new Error("Choose a progress file smaller than 1 MB.");
    const imported = validateProgress(JSON.parse(await file.text()));
    saveProgress(
      validateProgress({
        version: 1,
        completed: { ...progress.data.completed, ...imported.completed },
      }),
    );
    announce("Imported and merged learning progress.");
  } catch (error) {
    announce(`Could not import progress: ${error.message}`);
  } finally {
    event.target.value = "";
  }
});
$("progress-reset")?.addEventListener("click", () => {
  if (
    window.confirm(
      "Clear learning progress saved on this browser? You can export a copy first.",
    )
  ) {
    writeSkips(new Set());
    saveProgress({ version: 1, completed: {} });
    announce("Local progress cleared.");
  }
});
refreshProgress();
autoComplete();
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === SKIP_KEY || event.key === null) {
    progress = readProgress(localStorageSafe);
    refreshProgress();
  }
});

// The inline head script usually set the theme before paint; this is the fallback.
let theme = root.dataset.theme;
if (theme !== "dark" && theme !== "light") {
  theme = "light";
  try {
    theme =
      localStorageSafe.getItem("frc1257-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch {}
}
const labFrames = [...document.querySelectorAll(".lab-embed iframe")];
function sendTheme(frame) {
  try {
    frame.contentWindow?.postMessage(
      { source: FROM_SITE, type: "theme", theme },
      location.origin,
    );
  } catch {}
}
// The label stays "Dark theme"; aria-pressed carries the state and CSS swaps icons.
function applyTheme() {
  root.dataset.theme = theme;
  $("theme-toggle")?.setAttribute("aria-pressed", String(theme === "dark"));
  labFrames.forEach(sendTheme);
}
applyTheme();
$("theme-toggle")?.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  applyTheme();
  try {
    localStorageSafe.setItem("frc1257-theme", theme);
  } catch {}
});

// Embedded labs: the parent sizes the frame to its content (no inner scrolling) and
// pushes theme changes. Both sides accept only same-origin messages from the expected window.
if (labFrames.length)
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin) return;
    const frame = labFrames.find((f) => f.contentWindow === event.source),
      data = event.data;
    if (!frame || !data || typeof data !== "object" || data.source !== FROM_LAB) return;
    if (data.type === "ready") sendTheme(frame);
    if (data.type === "height" && Number.isFinite(data.height)) {
      frame.style.height = `${Math.round(Math.min(Math.max(data.height, 160), 12000))}px`;
      frame.closest(".lab-embed")?.setAttribute("data-sized", "");
    }
  });
if (embedded) {
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (event.origin !== location.origin || event.source !== window.parent) return;
    if (!data || typeof data !== "object" || data.source !== FROM_SITE) return;
    if (data.type === "theme" && (data.theme === "dark" || data.theme === "light")) {
      theme = data.theme;
      root.dataset.theme = theme;
      $("theme-toggle")?.setAttribute("aria-pressed", String(theme === "dark"));
    }
  });
  // Links inside the frame (sources, notes) open in the lesson's window, not the frame.
  for (const link of document.querySelectorAll("a[href]"))
    if (!link.getAttribute("href").startsWith("#")) link.target = "_top";
  const post = (message) => {
    try {
      window.parent.postMessage({ source: FROM_LAB, ...message }, location.origin);
    } catch {}
  };
  let lastHeight = 0;
  const sendHeight = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    if (height && Math.abs(height - lastHeight) > 1) {
      lastHeight = height;
      post({ type: "height", height });
    }
  };
  new ResizeObserver(sendHeight).observe(document.body);
  addEventListener("load", sendHeight);
  post({ type: "ready" });
}

const sidebarEl = $("sidebar"),
  menuButton = $("menu-toggle");
// Scroll the sidebar itself (not the page) so the current lesson is in view.
function revealCurrent() {
  const current = sidebarEl?.querySelector("[aria-current]");
  if (!current) return;
  const item = current.getBoundingClientRect(),
    box = sidebarEl.getBoundingClientRect();
  if (item.top < box.top || item.bottom > box.bottom)
    sidebarEl.scrollTop += item.top - box.top - box.height / 3;
}
for (const button of document.querySelectorAll(
  ".nav-twisty,.nav-group-toggle",
)) {
  button.addEventListener("click", () => {
    const list = $(button.getAttribute("aria-controls"));
    if (!list) return;
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
    list.classList.remove("nav-reveal");
    if (open) {
      void list.offsetWidth;
      list.classList.add("nav-reveal");
    }
  });
}
const drawerQuery = matchMedia("(max-width: 950px)");
let scrim;
if (menuButton && sidebarEl) {
  scrim = document.createElement("div");
  scrim.className = "nav-scrim";
  scrim.addEventListener("click", () => setMenu(false));
  document.body.append(scrim);
}
function setMenu(open, { restoreFocus = true } = {}) {
  if (!menuButton || !sidebarEl) return;
  const wasOpen = document.body.classList.contains("menu-open");
  if (open === wasOpen) return;
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.dataset.tip = open ? "Close menu" : "Menu";
  for (const el of document.querySelectorAll("#main, .toc, .site-footer"))
    el.inert = open;
  if (open) {
    const target =
      sidebarEl.querySelector("[aria-current]") ||
      sidebarEl.querySelector("a[href], button");
    target?.focus({ preventScroll: true });
    revealCurrent();
  } else if (restoreFocus) menuButton.focus();
}
menuButton?.addEventListener("click", () =>
  setMenu(!document.body.classList.contains("menu-open")),
);
sidebarEl?.addEventListener("click", (event) => {
  if (event.target.closest("a[href]")) setMenu(false, { restoreFocus: false });
});
drawerQuery.addEventListener?.("change", (event) => {
  if (!event.matches) setMenu(false, { restoreFocus: false });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("menu-open"))
    setMenu(false);
});
revealCurrent();

mountSearch({ base });

async function redirectLegacy() {
  if (embedded || !location.hash.startsWith("#/")) return;
  try {
    const r = await fetch(base + "route-map.json");
    if (!r.ok) return;
    const destination = legacyDestination(await r.json(), location.hash);
    if (destination) location.replace(destination);
  } catch {}
}
window.addEventListener("hashchange", redirectLegacy);
redirectLegacy();
for (const frame of document.querySelectorAll("iframe")) {
  if (!frame.title)
    frame.title =
      "Supplementary resource for " +
      (document.body.dataset.pageTitle || "this lesson");
  frame.loading = "lazy";
}
for (const image of document.querySelectorAll("article img"))
  image.loading = "lazy";
// Code and tables that scroll sideways must be reachable from the keyboard.
for (const el of document.querySelectorAll("article pre, article table"))
  if (el.scrollWidth > el.clientWidth + 1) el.tabIndex = 0;
mountKnowledgeCheck({ document, base });
const reading = $("reading-progress");
if (reading) {
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    reading.value = max > 0 ? Math.min(100, (scrollY / max) * 100) : 0;
  };
  addEventListener("scroll", update, { passive: true });
  update();
}
