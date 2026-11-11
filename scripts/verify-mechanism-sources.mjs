// Read-only verification of the pinned source files behind the mechanism demos.
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const { demos } = JSON.parse(
  await fs.readFile("docs/labs/mechanism-sources.json", "utf8"),
);
const { sources } = JSON.parse(
  await fs.readFile("research_sources/mechanism-code.json", "utf8"),
);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const offline = process.argv.includes("--offline");
let failures = 0;
for (const source of sources) {
  try {
    let raw;
    if (offline)
      raw = await fs.readFile(
        `research_sources/local/mechanism-code/${source.slug}.java`,
      );
    else {
      const url = new URL(source.source_url);
      if (
        url.origin !== "https://raw.githubusercontent.com" ||
        !url.pathname.includes(`/${source.revision}/`)
      )
        throw new Error("Expected an immutable raw GitHub source URL");
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok)
        throw new Error(`Source returned HTTP ${response.status}`);
      raw = Buffer.from(await response.arrayBuffer());
    }
    if (hash(raw) !== source.source_sha256)
      throw new Error("Full source hash differs from receipt");
    const [first, last] = source.lines;
    const excerpt =
      raw
        .toString("utf8")
        .split(/\r?\n/)
        .slice(first - 1, last)
        .join("\n") + "\n";
    if (
      excerpt !== demos[source.slug]?.excerpt ||
      hash(excerpt) !== source.excerpt_sha256
    )
      throw new Error("Excerpt differs from the pinned source lines");
    if (demos[source.slug].revision !== source.revision)
      throw new Error("Revision differs between records");
    const notice = await fs.readFile(`docs/${source.license_copy}`, "utf8");
    if (
      !notice.includes("MIT License") ||
      !notice.includes("Permission is hereby granted")
    )
      throw new Error("Missing MIT permission notice");
    process.stdout.write(
      `Verified ${source.slug}: source hash, lines ${first}–${last}, excerpt and license notice\n`,
    );
  } catch (error) {
    failures++;
    process.stderr.write(`${source.slug}: ${error.message}\n`);
  }
}
if (sources.length !== Object.keys(demos).length) {
  failures++;
  process.stderr.write(
    "Source receipts and demo entries have different counts\n",
  );
}
process.exitCode = failures ? 1 : 0;
