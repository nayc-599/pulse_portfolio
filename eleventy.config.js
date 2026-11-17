import fs from "node:fs";
export default function (eleventyConfig) {
  // Draft posts waiting for the teammate they feature to read them.
  eleventyConfig.ignores.add("journal/drafts/**");

  // Curly quotes in visible text, at build time: ' -> ’ (or ‘ at the start
  // of a quote), " -> “ ”. Only text between tags is touched; tag
  // attributes (alt, aria-label, href...), and the contents of <script>,
  // <style>, <pre>, <code> and <textarea>, are left exactly as written.
  eleventyConfig.addTransform("smartQuotes", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    const parts = content.split(/(<[^>]*>)/);
    let skip = 0;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith("<")) {
        const m = part.match(/^<(\/?)(script|style|pre|code|textarea)\b/i);
        if (m) skip += m[1] ? -1 : 1;
        if (skip < 0) skip = 0;
        continue;
      }
      if (skip) continue;
      // Templates and markdown write quotes as entities; decode those first
      // (the curly forms need no escaping).
      const text = part.replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&quot;|&#34;|&#x22;/g, '"');
      if (!/['"]/.test(text)) continue;
      parts[i] = text
        .replace(/(^|[\s(\[{\u2014\u2013-])'/g, "$1\u2018")
        .replace(/'/g, "\u2019")
        .replace(/(^|[\s(\[{\u2014\u2013-])"/g, "$1\u201C")
        .replace(/"/g, "\u201D");
    }
    return parts.join("");
  });

  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("media");

  // Markdown tables carry a min-width so their columns stay readable, which
  // is wider than a phone viewport. Wrapping each one in its own scroll
  // container keeps that overflow inside the table instead of letting it
  // drag the whole page sideways.
  eleventyConfig.amendLibrary("md", (md) => {
    md.renderer.rules.table_open = () => '<div class="table-scroll">\n<table>\n';
    md.renderer.rules.table_close = () => '</table>\n</div>\n';
  });

  // One compact date format for meta lines and cards: "7 Oct 2026" (three-
  // letter months, so September is "Sep", not en-GB's "Sept"). Prose writes
  // dates out in full ("7 October 2026") by hand.
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const compactDate = (value) => {
    const d = value instanceof Date ? value : new Date(value + "T00:00:00Z");
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  };
  eleventyConfig.addFilter("dateDisplay", compactDate);

  // Display order (journal index, home page preview): newest date first.
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("journal/posts/*.md").sort((a, b) => b.date - a.date)
  );

  // Journal categories: only "build-log" and "update".
  const CATEGORY_LABELS = { "build-log": "Build log", "update": "Update" };
  eleventyConfig.addFilter("categoryLabel", (c) => CATEGORY_LABELS[c] || "Build log");
  eleventyConfig.addFilter("byCategory", (arr, c) => (arr || []).filter((p) => p.data.category === c));
  // The meta line on cards: "Build log · 27 Sep 2026", or for an Update
  // "Update · Week 6 · 27 Sep 2026". Build log posts carry no week.
  eleventyConfig.addFilter("postMeta", (d) =>
    d.category === "update"
      ? ["Update", d.week ? "Week " + d.week : null, compactDate(d.date)].filter(Boolean).join(" · ")
      : "Build log · " + compactDate(d.date));

  // People: posts name an author (and optional `featuring`) by id from
  // _data/people.json. Returns the people objects, author first.
  const PEOPLE = JSON.parse(fs.readFileSync("_data/people.json", "utf8")).people;
  eleventyConfig.addWatchTarget("_data/people.json");
  eleventyConfig.addFilter("postPeople", function (d) {
    const people = PEOPLE;
    const ids = [d.author].concat(d.featuring ? [].concat(d.featuring) : []);
    return ids.map((id) => people.find((p) => p.id === id) || { id, name: id, role: "" });
  });
  eleventyConfig.addFilter("names", (list) => {
    const n = (list || []).map((p) => p.name);
    return n.length <= 1 ? n.join("") : n.slice(0, -1).join(", ") + " and " + n[n.length - 1];
  });

  // Prev/next reading order: the team publishes out of strict date order
  // (see the Week One entry), so the "newer/older" chain is a separate,
  // hand-authored sequence from the date-sorted display order above.
  eleventyConfig.addCollection("postsChain", (collectionApi) =>
    collectionApi.getFilteredByGlob("journal/posts/*.md")
      .filter((p) => p.data.category !== "update")
      .sort((a, b) => a.data.chainOrder - b.data.chainOrder)
  );
  // Updates read newest to oldest among themselves.
  eleventyConfig.addCollection("updatesChain", (collectionApi) =>
    collectionApi.getFilteredByGlob("journal/posts/*.md")
      .filter((p) => p.data.category === "update")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("findIndexByUrl", (arr, url) => arr.findIndex((p) => p.url === url));
  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));
  // "BUILD LOG" -> "Build log": sentence case for labels stored in capitals.
  eleventyConfig.addFilter("dateText", compactDate);
  eleventyConfig.addFilter("sentence", (s) => {
    const t = String(s ?? "").toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  });
  // Nunjucks' built-in selectattr ignores its "equalto" test, so filtering a
  // list by a field value needs its own filter: items | where("group", "dashboard").
  eleventyConfig.addFilter("where", (arr, key, value) => (arr || []).filter((item) => item && item[key] === value));
  // Media page: by week, oldest first. Ties go by "date" (YYYY-MM-DD) when
  // both items have one, otherwise they keep their order in media.json
  // (Array.prototype.sort is stable).
  eleventyConfig.addFilter("byWeek", (arr) =>
    [...(arr || [])].sort((a, b) =>
      (a.week ?? 0) - (b.week ?? 0) ||
      (a.date && b.date ? a.date.localeCompare(b.date) : 0)));

  return {
    dir: {
      input: ".",
      includes: "partials",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
