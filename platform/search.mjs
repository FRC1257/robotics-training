// Local, deterministic weighted search. No queries or documents leave the browser.
const cache = new WeakMap();
const stops = new Set(
  "a an and are as at be by can did do does for from how i in is it me my of on or please the to what when where which why with would you your".split(
    " ",
  ),
);
const groups = [
  ["pid", "proportional", "integral", "derivative", "pidcontroller"],
  ["swerve", "swerve drive", "module"],
  ["encoder", "encoders", "sensor"],
  ["odometry", "odom", "localization", "localisation", "pose"],
  ["vision", "camera", "apriltag"],
  ["feedforward", "feed forward"],
  ["motor", "motors", "sparkmax", "spark max", "cansparkmax", "talon"],
  ["move", "moving", "motion", "drive", "drivetrain"],
  ["tune", "tuning", "tuned"],
  ["troubleshooting", "troubleshoot", "diagnose", "debug", "fault"],
  ["estimate", "estimation", "estimator"],
  ["subsystem", "sub system"],
  ["interface", "interfaces", "abstraction", "abstractions", "io"],
  ["simulation", "simulate", "simulated", "sim"],
  ["interpolation", "interpolate", "interpolating", "lookup", "table"],
  ["latency", "delay", "delayed"],
  ["filter", "filters", "filtering", "smoothing"],
  ["units", "unit", "conversion", "convert"],
];
const stem = (s) => {
  if (s.length > 6 && s.endsWith("ing"))
    return s.slice(0, -3).replace(/(.)\1$/, "$1");
  if (s.length > 5 && s.endsWith("ed")) return s.slice(0, -2);
  if (s.length > 5 && s.endsWith("es")) return s.slice(0, -2);
  if (s.length > 4 && s.endsWith("s") && !s.endsWith("ss"))
    return s.slice(0, -1);
  return s;
};
export function tokenize(value) {
  return (
    String(value ?? "")
      .normalize("NFKC")
      .replace(/sub[\s_-]*system/gi, "Subsystem")
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.map(stem) || []
  );
}
const tokens = (value) => tokenize(value).filter((t) => !stops.has(t));
function counts(list) {
  const m = new Map();
  for (const w of list) m.set(w, (m.get(w) || 0) + 1);
  return m;
}
export function buildSearchIndex(index) {
  if (!Array.isArray(index))
    return { records: [], vocabulary: new Set(), df: new Map() };
  if (cache.has(index)) return cache.get(index);
  const df = new Map(),
    vocabulary = new Set();
  const records = index
    .filter((p) => p && typeof p === "object" && typeof p.href === "string")
    .map((page) => {
      const fields = [
        counts(tokens(page.title)),
        counts(
          tokens(
            Array.isArray(page.headings)
              ? page.headings.join(" ")
              : page.headings || "",
          ),
        ),
        counts(tokens(page.section)),
        counts(tokens(page.text || page.excerpt)),
      ];
      const all = new Set(fields.flatMap((m) => [...m.keys()]));
      for (const word of all) {
        vocabulary.add(word);
        df.set(word, (df.get(word) || 0) + 1);
      }
      return { page, fields, all, normalizedTitle: tokenize(page.title).join(" "), normalizedText: tokenize(page.text || "").join(" ") };
    });
  const result = { records, df, vocabulary };
  cache.set(index, result);
  return result;
}
// Bounded optimal string alignment distance: insertion, deletion, replacement, adjacent swap.
function distance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prevprev = null,
    prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        curr[j] = Math.min(curr[j], prevprev[j - 2] + 1);
      min = Math.min(min, curr[j]);
    }
    if (min > limit) return limit + 1;
    prevprev = prev;
    prev = curr;
  }
  return prev[b.length];
}
function alternatives(term, vocabulary) {
  const options = new Map([[term, { weight: 1, fuzzy: false }]]);
  for (const group of groups) {
    const words = group.flatMap(tokens);
    if (words.includes(term))
      for (const word of words)
        if (word !== term) options.set(word, { weight: 0.55, fuzzy: false });
  }
  if (!vocabulary.has(term) && term.length >= 4 && term.length <= 24) {
    const candidates = [];
    for (const word of vocabulary) {
      if (
        Math.abs(word.length - term.length) > 1 ||
        word.length > 24 ||
        word[0] !== term[0]
      )
        continue;
      const d = distance(term, word, 1);
      if (d <= 1) candidates.push(word);
    }
    candidates.sort((a, b) => a.localeCompare(b));
    for (const word of candidates.slice(0, 12))
      if (!options.has(word)) options.set(word, { weight: 0.65, fuzzy: true });
  }
  return options;
}
function makeSnippet(page, terms) {
  const body = String(page.text || page.excerpt || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!body) return "";
  const lower = body.toLowerCase();
  let pos = -1;
  for (const word of terms) {
    if (word.length < 3) continue;
    const at = lower.indexOf(word.toLowerCase());
    if (at >= 0 && (pos < 0 || at < pos)) pos = at;
  }
  if (pos < 0) pos = 0;
  let start = Math.max(0, pos - 75),
    end = Math.min(body.length, start + 220);
  if (start > 0) {
    const n = body.indexOf(" ", start);
    if (n >= 0 && n < pos) start = n + 1;
  }
  if (end < body.length) {
    const n = body.lastIndexOf(" ", end);
    if (n > start) end = n;
  }
  return (
    (start ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "")
  );
}
export function searchLessons(index, query, limit = 20, options = {}) {
  if (typeof query !== "string" || !query.trim()) return [];
  const q = tokens(query.slice(0, 256).replace(/\bfeed[\s-]+forward\b/gi, "feedforward").replace(/\blow[\s-]*pass\s+filters?\b/gi, "filter")).slice(0, 8);
  if (!q.length) return [];
  const built = buildSearchIndex(index),
    queryTerms = [...new Set(q)],
    expanded = queryTerms.map((t) => alternatives(t, built.vocabulary)),
    phrase = tokenize(query.slice(0, 256)).join(" "),
    limitNum = Number.isFinite(Number(limit))
      ? Math.max(0, Math.min(100, Math.floor(Number(limit))))
      : 20,
    section =
      typeof options?.section === "string" ? options.section.toLowerCase() : "";
  return built.records
    .flatMap(({ page, fields, normalizedTitle, normalizedText }) => {
      if (section && String(page.section || "").toLowerCase() !== section)
        return [];
      let score = 0,
        matched = 0,
        fuzzyUsed = false;
      const matchedTerms = [],
        snippetWords = [], usedWords = new Set();
      for (let i = 0; i < queryTerms.length; i++) {
        let best = 0,
          bestWord = "",
          fuzzy = false;
        for (const [word, meta] of expanded[i]) {
          if (usedWords.has(word)) continue;
          const idf = Math.log(
            1 + (built.records.length + 1) / ((built.df.get(word) || 0) + 1),
          );
          let value = 0;
          for (let j = 0; j < fields.length; j++) {
            const count = fields[j].get(word) || 0;
            if (count) value += [8, 5, 2, 1][j] * (1 + Math.log(count)) * idf;
          }
          value *= meta.weight;
          if (value > best) {
            best = value;
            bestWord = word;
            fuzzy = meta.fuzzy;
          }
        }
        if (best) {
          matched++;
          score += best;
          matchedTerms.push(queryTerms[i]);
          snippetWords.push(bestWord);
          usedWords.add(bestWord);
          fuzzyUsed ||= fuzzy;
        }
      }
      const threshold =
        queryTerms.length === 1 ? 1 : Math.min(2, queryTerms.length);
      if (matched < threshold) return [];
      if (phrase.length > 2 && normalizedTitle.includes(phrase)) score += 18;
      else if (phrase.length > 2 && normalizedText.includes(phrase)) score += 5;
      const compact = query.slice(0, 256).trim();
      if (
        /^[A-Za-z][A-Za-z0-9]{3,}$/.test(compact) &&
        /[a-z][A-Z]/.test(compact) &&
        String(page.text || "")
          .toLowerCase()
          .includes(compact.toLowerCase())
      )
        score += 22;
      if (
        /\b(?:not (?:mov(?:e|ing)|work(?:ing)?)|won['’]?t (?:move|work))\b/i.test(
          query,
        ) &&
        /troubleshoot|diagnos/i.test(
          String(page.title || "") + " " + String(page.id || ""),
        )
      )
        score += /troubleshoot/i.test(String(page.id || "")) ? 50 : 20;
      score *= 0.6 + (0.4 * matched) / queryTerms.length;
      if (
        /(?:^|\/)archive\//i.test(page.id || "") ||
        /\bhistorical\b/i.test(
          String(page.title || "") +
            " " +
            String(page.text || "").slice(0, 200),
        )
      )
        score *= 0.55;
      return [
        {
          ...page,
          score,
          snippet: makeSnippet(page, snippetWords),
          matchedTerms,
          fuzzyUsed,
        },
      ];
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.title || "").localeCompare(String(b.title || "")),
    )
    .slice(0, limitNum);
}
