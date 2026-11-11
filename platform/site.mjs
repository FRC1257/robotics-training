import {
  readProgress,
  toggleCompletion,
  validateProgress,
  pathProgress,
  searchLessons,
  legacyDestination,
  STORAGE_KEY,
} from "./learning.mjs";
import { mountKnowledgeCheck, courseHref } from "./practice.mjs";
const base = document.body.dataset.base || "/robotics-training/";
const $ = (id) => document.getElementById(id);
const announce = (message) => {
  const el = $("site-status");
  if (el) el.textContent = message;
};
let localStorageSafe;
try {
  localStorageSafe = window.localStorage;
} catch {
  localStorageSafe = {
    getItem() {
      throw new Error("Storage unavailable");
    },
  };
}
let progress = readProgress(localStorageSafe);
const pageId = document.body.dataset.pageId;
const complete = $("complete-lesson");
let catalogPromise;
const getCatalog = () =>
  (catalogPromise ??= fetch(base + "assets/catalog.json").then((r) => {
    if (!r.ok) throw Error();
    return r.json();
  }));
async function recommendNext() {
  try {
    const catalog = await getCatalog();
    for (const card of document.querySelectorAll(".path-card[data-path-id]")) {
      const path = catalog.paths.find((p) => p.id === card.dataset.pathId);
      const next = path?.lessons.find(
        (id) => !Object.hasOwn(progress.data.completed, id),
      );
      if (next) card.href = courseHref(next, base);
    }
    const path = catalog.paths.find((p) => p.lessons.includes(pageId));
    if (!path || !complete) return;
    const next = path.lessons.find(
      (id) => id !== pageId && !Object.hasOwn(progress.data.completed, id),
    );
    let box = $("next-activity");
    if (!box) {
      box = document.createElement("section");
      box.id = "next-activity";
      box.className = "next-activity card";
      (
        complete.closest(".lesson-actions") || document.querySelector("main")
      )?.append(box);
    }
    box.replaceChildren();
    const heading = document.createElement("h2");
    heading.textContent = "Keep learning";
    const text = document.createElement("p");
    text.textContent = path.title;
    box.append(heading, text);
    if (next) {
      const link = document.createElement("a");
      link.href = courseHref(next, base);
      link.textContent = "Continue with the next unfinished activity →";
      box.append(link);
    } else {
      const done = document.createElement("p");
      done.textContent =
        "You have marked the other activities complete. Try a practice project and explain your result to a teammate.";
      box.append(done);
    }
  } catch {}
}
function refreshProgress() {
  const done = Object.hasOwn(progress.data.completed, pageId);
  if (complete) {
    complete.textContent = done
      ? "Completed · mark incomplete"
      : "Mark lesson complete";
    complete.setAttribute("aria-pressed", String(done));
  }
  if ($("progress-summary"))
    $("progress-summary").textContent =
      `${Object.keys(progress.data.completed).length} lessons completed on this browser`;
  for (const el of document.querySelectorAll("[data-path-lessons]")) {
    try {
      const p = pathProgress(
        JSON.parse(el.dataset.pathLessons),
        progress.data.completed,
      );
      const label = el.querySelector("[data-path-progress]");
      if (label) label.textContent = `${p.done} of ${p.total} completed`;
      const bar = el.querySelector("progress");
      if (bar) {
        bar.max = p.total || 1;
        bar.value = p.done;
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
complete?.addEventListener("click", () => {
  saveProgress(toggleCompletion(progress.data, pageId));
  announce(
    Object.hasOwn(progress.data.completed, pageId)
      ? "Lesson marked complete."
      : "Lesson marked incomplete.",
  );
});
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
  announce(
    "Progress exported. It contains lesson IDs and completion dates only.",
  );
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
    saveProgress({ version: 1, completed: {} });
    announce("Local progress cleared.");
  }
});
refreshProgress();
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    progress = readProgress(localStorageSafe);
    refreshProgress();
  }
});

let theme = "light";
try {
  theme =
    localStorageSafe.getItem("frc1257-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
} catch {}
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  $("theme-toggle")?.setAttribute(
    "aria-label",
    theme === "dark" ? "Use light theme" : "Use dark theme",
  );
  if ($("theme-toggle"))
    $("theme-toggle").textContent =
      theme === "dark" ? "Light theme" : "Dark theme";
}
applyTheme();
$("theme-toggle")?.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  applyTheme();
  try {
    localStorageSafe.setItem("frc1257-theme", theme);
  } catch {}
});
$("menu-toggle")?.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  $("menu-toggle").setAttribute("aria-expanded", String(open));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("menu-open");
    $("menu-toggle")?.setAttribute("aria-expanded", "false");
  }
});

const dialog = $("search-dialog"),
  input = $("search-input"),
  results = $("search-results");
let sectionFilter;
if (input) {
  const label = document.createElement("label");
  label.className = "search-filter";
  label.textContent = "Limit results to ";
  sectionFilter = document.createElement("select");
  sectionFilter.setAttribute("aria-label", "Search section");
  for (const [value, name] of [
    ["", "All topics"],
    ["foundations", "Foundations"],
    ["java", "Java"],
    ["frc", "Robot programming"],
    ["labs", "Interactive labs"],
    ["robots", "Real robot examples"],
    ["guides", "Learning guides"],
  ]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = name;
    sectionFilter.append(option);
  }
  label.append(sectionFilter);
  input.after(label);
  sectionFilter.addEventListener("change", () => performSearch());
}
let indexPromise;
const getIndex = () =>
  (indexPromise ??= fetch(base + "search-index.json")
    .then((r) => {
      if (!r.ok) throw new Error("Search index unavailable");
      return r.json();
    })
    .catch((error) => {
      indexPromise = null;
      throw error;
    }));
let searchSequence = 0;
async function performSearch() {
  const sequence = ++searchSequence,
    query = input.value.trim();
  results.replaceChildren();
  if (!query) {
    if ($("search-status"))
      $("search-status").textContent =
        "Search topics, code and troubleshooting across the whole library.";
    return;
  }
  try {
    const index = await getIndex();
    if (sequence !== searchSequence) return;
    const found = searchLessons(index, query, 20, {
      section: sectionFilter?.value || undefined,
    });
    if ($("search-status"))
      $("search-status").textContent = found.length
        ? `${found.length} matching activities${found.some((p) => p.fuzzyUsed) ? " · including related spellings" : ""}`
        : "No matches. Try PID, swerve, logging, units or vision, or choose All topics.";
    for (const page of found) {
      const li = document.createElement("li"),
        a = document.createElement("a"),
        title = document.createElement("strong"),
        excerpt = document.createElement("span"),
        tag = document.createElement("small");
      a.href = page.href;
      title.textContent = page.title;
      excerpt.textContent =
        page.snippet || page.excerpt || page.text.slice(0, 180);
      tag.textContent = page.section || "Lesson";
      a.append(tag, title, excerpt);
      li.append(a);
      results.append(li);
    }
  } catch {
    if ($("search-status"))
      $("search-status").textContent =
        "Search could not load. Browse the navigation or try again.";
  }
}
async function openSearch() {
  if (!dialog) return;
  dialog.showModal();
  input.focus();
  await performSearch();
}
for (const button of document.querySelectorAll(
  "[data-open-search],#search-open",
))
  button.addEventListener("click", openSearch);
$("search-close")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
input?.addEventListener("input", performSearch);
input?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    results.querySelector("a")?.focus();
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

async function redirectLegacy() {
  if (!location.hash.startsWith("#/")) return;
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
