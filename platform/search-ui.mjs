// Command-palette search. Ranking stays in search.mjs; queries never leave the browser.
import { searchLessons, tokenize } from "./search.mjs";

const SECTION_LABELS = {
  java: "Java",
  frc: "Robot programming",
  "robot-types": "Programming by robot type",
  labs: "Interactive labs",
  foundations: "Robot foundations",
  robots: "Real robots",
  vision: "Vision",
  git: "Git and GitHub",
  guides: "Guides",
  documentation: "Documentation",
  website: "Team website",
};
const QUIET = new Set(
  "and are can does for from how not the what when where which why with you your".split(" "),
);
const tidy = (part) => {
  const text = part
    .replace(/\.(md|html)$/i, "")
    .replace(/^\d+[a-z]?[-_]/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};
// "frc/3-Closed_Loop_Control/2-Basics_of_PID.md" → ["Robot programming", "Closed Loop Control"].
export function breadcrumb(page) {
  const id = String(page?.id || "");
  if (!id || id === "README.md") return ["Home"];
  const parts = id.split("/"),
    dirs = parts.slice(1, -1);
  // A README is its folder's landing page, so the folder is the page, not a crumb.
  if (parts.at(-1) === "README.md") dirs.pop();
  return [SECTION_LABELS[parts[0]] || tidy(parts[0]), ...dirs.map(tidy)]
    .filter(Boolean)
    .slice(0, 3);
}
// True when a and b differ by at most one edit or one adjacent swap.
function nearby(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length)
    return (
      a.slice(i + 1) === b.slice(i + 1) ||
      (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2))
    );
  return a.length > b.length
    ? a.slice(i + 1) === b.slice(i)
    : a.slice(i) === b.slice(i + 1);
}
// Matches whole words whose stems equal, extend, or are one typo away from a query term.
export function wordMatcher(query) {
  const terms = [...new Set(tokenize(query))].filter(
    (t) => t.length >= 2 && !QUIET.has(t),
  );
  return (word) =>
    tokenize(word).some((part) =>
      terms.some(
        (t) =>
          part === t ||
          (t.length >= 3 && part.startsWith(t)) ||
          (t.length >= 4 && part[0] === t[0] && nearby(part, t)),
      ),
    );
}
// Builds text nodes and <mark> elements; result text is never parsed as HTML.
export function highlightInto(element, text, isMatch) {
  const doc = element.ownerDocument,
    value = String(text ?? "");
  let last = 0;
  for (const match of value.matchAll(/[\p{L}\p{N}]+/gu)) {
    if (!isMatch(match[0])) continue;
    if (match.index > last)
      element.append(doc.createTextNode(value.slice(last, match.index)));
    const mark = doc.createElement("mark");
    mark.textContent = match[0];
    element.append(mark);
    last = match.index + match[0].length;
  }
  if (last < value.length) element.append(doc.createTextNode(value.slice(last)));
}

export function mountSearch({ base }) {
  const $ = (id) => document.getElementById(id);
  const dialog = $("search-dialog"),
    input = $("search-input"),
    list = $("search-results"),
    status = $("search-status"),
    section = $("search-section"),
    clear = $("search-clear"),
    empty = $("search-empty"),
    retry = $("search-retry"),
    widen = $("search-widen");
  if (!dialog || !input || !list) return;
  let indexPromise,
    loaded = false,
    sequence = 0,
    active = -1,
    opener = null;
  const getIndex = () =>
    (indexPromise ??= fetch(base + "search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error("Search index unavailable");
        return r.json();
      })
      .then((index) => {
        loaded = true;
        return index;
      })
      .catch((error) => {
        indexPromise = null;
        throw error;
      }));
  const say = (text) => {
    if (status) status.textContent = text;
  };
  const options = () => [...list.querySelectorAll('[role="option"]')];
  function setActive(next, { scroll = true } = {}) {
    const items = options();
    active = items.length ? (next + items.length) % items.length : -1;
    items.forEach((item, i) =>
      item.setAttribute("aria-selected", String(i === active)),
    );
    if (active < 0) input.removeAttribute("aria-activedescendant");
    else {
      input.setAttribute("aria-activedescendant", items[active].id);
      if (scroll) items[active].scrollIntoView({ block: "nearest" });
    }
  }
  function setBusy(busy) {
    dialog.classList.toggle("is-loading", busy);
    if (busy) dialog.setAttribute("aria-busy", "true");
    else dialog.removeAttribute("aria-busy");
  }
  function render(found, query) {
    const isMatch = wordMatcher(query);
    list.replaceChildren();
    found.forEach((page, i) => {
      const li = document.createElement("li"),
        a = document.createElement("a"),
        crumb = document.createElement("span"),
        title = document.createElement("span"),
        snippet = document.createElement("span"),
        enter = document.createElement("span");
      li.id = `search-option-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      a.href = page.href;
      a.tabIndex = -1;
      crumb.className = "result-crumb";
      crumb.textContent = breadcrumb(page).join(" › ");
      title.className = "result-title";
      title.id = `${li.id}-title`;
      highlightInto(title, page.title, isMatch);
      snippet.className = "result-snippet";
      highlightInto(snippet, page.snippet || page.excerpt || "", isMatch);
      enter.className = "result-enter";
      enter.setAttribute("aria-hidden", "true");
      enter.textContent = "↵";
      if (page.section === "labs" && /\.html$/.test(page.id || ""))
        li.classList.add("is-lab");
      li.setAttribute("aria-labelledby", title.id);
      a.append(crumb, title, snippet, enter);
      li.append(a);
      li.addEventListener("mousemove", () => {
        if (active !== i) setActive(i, { scroll: false });
      });
      list.append(li);
    });
    input.setAttribute("aria-expanded", String(found.length > 0));
    setActive(found.length ? 0 : -1);
  }
  async function performSearch() {
    const current = ++sequence,
      query = input.value.trim(),
      filter = section?.value || "";
    if (clear) clear.hidden = !input.value;
    if (retry) retry.hidden = true;
    if (widen) widen.hidden = true;
    if (!query) {
      render([], "");
      if (empty) empty.hidden = false;
      say("");
      setBusy(false);
      return;
    }
    if (!loaded) {
      setBusy(true);
      say("Loading the search index…");
    }
    try {
      const index = await getIndex();
      if (current !== sequence) return;
      setBusy(false);
      const found = searchLessons(index, query, 20, {
        section: filter || undefined,
      });
      render(found, query);
      if (empty) empty.hidden = found.length > 0;
      const where = filter
        ? ` in ${section.selectedOptions[0]?.textContent || filter}`
        : "";
      if (found.length) {
        const fuzzy = found.some((p) => p.fuzzyUsed)
          ? " · includes close spellings"
          : "";
        say(`${found.length} result${found.length === 1 ? "" : "s"}${where}${fuzzy}`);
      } else {
        say(`No results for “${query}”${where}. Try a broader word or a suggestion below.`);
        if (widen) widen.hidden = !filter;
      }
    } catch {
      if (current !== sequence) return;
      setBusy(false);
      render([], "");
      if (empty) empty.hidden = false;
      say("Search couldn't load. Check your connection and try again, or browse the menu.");
      if (retry) retry.hidden = false;
    }
  }
  function open() {
    if (dialog.open) {
      input.focus();
      input.select();
      return;
    }
    opener = document.activeElement;
    dialog.showModal();
    input.focus();
    input.select();
    performSearch();
  }
  function close() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener("close", () => {
    input.setAttribute("aria-expanded", "false");
    const target = opener;
    opener = null;
    if (target?.isConnected && typeof target.focus === "function")
      target.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  input.addEventListener("input", performSearch);
  input.addEventListener("keydown", (event) => {
    const count = options().length;
    // type=search clears the field on Escape and swallows the dialog's cancel; close explicitly.
    if (event.key === "Escape" && !event.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!count) return;
      event.preventDefault();
      setActive(active + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter" && !event.isComposing) {
      const link = options()[active]?.querySelector("a");
      if (!link) return;
      event.preventDefault();
      if (event.metaKey || event.ctrlKey)
        window.open(link.href, "_blank", "noopener");
      else location.assign(link.href);
    }
  });
  section?.addEventListener("change", () => {
    performSearch();
    input.focus();
  });
  clear?.addEventListener("click", () => {
    input.value = "";
    performSearch();
    input.focus();
  });
  retry?.addEventListener("click", () => {
    performSearch();
    input.focus();
  });
  widen?.addEventListener("click", () => {
    if (section) section.value = "";
    performSearch();
    input.focus();
  });
  for (const chip of dialog.querySelectorAll("[data-query]"))
    chip.addEventListener("click", () => {
      input.value = chip.dataset.query;
      performSearch();
      input.focus();
    });
  $("search-close")?.addEventListener("click", close);
  for (const button of document.querySelectorAll("[data-open-search],#search-open")) {
    button.addEventListener("click", open);
    // Warm the local index when the pointer or focus arrives, before the click.
    for (const type of ["pointerenter", "focus"])
      button.addEventListener(type, () => getIndex().catch(() => {}), {
        once: true,
      });
  }
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open();
      return;
    }
    const target = event.target;
    const typing =
      target instanceof HTMLElement &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      open();
    }
  });
}
