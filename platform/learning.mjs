export const PROGRESS_VERSION = 1;
export const STORAGE_KEY = "frc1257-learning-v1";
export function validateProgress(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value.version !== 1 ||
    !value.completed ||
    typeof value.completed !== "object" ||
    Array.isArray(value.completed)
  )
    throw new Error("Expected a version 1 learning-progress file.");
  const completed = Object.create(null);
  const entries = Object.entries(value.completed);
  if (entries.length > 5000) throw new Error("Too many lesson entries.");
  for (const [id, date] of entries) {
    if (
      !id ||
      id.length > 300 ||
      ["__proto__", "constructor", "prototype"].includes(id) ||
      /^[a-z]+:\/\//i.test(id) ||
      /[<>\x00-\x1f]/.test(id)
    )
      throw new Error("Invalid lesson identifier.");
    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(date) ||
      !Number.isFinite(Date.parse(date))
    )
      throw new Error("Invalid completion date.");
    completed[id] = new Date(date).toISOString();
  }
  return { version: 1, completed };
}
export function readProgress(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return {
      data: raw
        ? validateProgress(JSON.parse(raw))
        : { version: 1, completed: Object.create(null) },
      available: true,
    };
  } catch {
    return {
      data: { version: 1, completed: Object.create(null) },
      available: false,
    };
  }
}
export function toggleCompletion(progress, id, now = new Date()) {
  const next = validateProgress(progress);
  if (Object.hasOwn(next.completed, id)) delete next.completed[id];
  else next.completed[id] = now.toISOString();
  return validateProgress(next);
}
export function pathProgress(lessons, completed) {
  const unique = [...new Set(lessons)];
  const done = unique.filter((id) => Object.hasOwn(completed, id)).length;
  return {
    done,
    total: unique.length,
    percent: unique.length ? Math.round((100 * done) / unique.length) : 0,
  };
}
export { searchLessons } from "./search.mjs";
export function legacyDestination(routeMap, hash) {
  if (!hash.startsWith("#/")) return null;
  const raw = hash.slice(1),
    question = raw.indexOf("?");
  let route = question < 0 ? raw : raw.slice(0, question);
  try {
    route = decodeURIComponent(route);
  } catch {
    return null;
  }
  const result = routeMap[route] || routeMap[route.replace(/\/$/, "")];
  if (!result || !result.startsWith("/") || result.startsWith("//"))
    return null;
  const id =
    question >= 0
      ? new URLSearchParams(raw.slice(question + 1)).get("id")
      : null;
  return result + (id ? "#" + encodeURIComponent(id) : "");
}
