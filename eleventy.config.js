export default function (eleventyConfig) {
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

  // Prev/next reading order: the team publishes out of strict date order
  // (see the Week One entry), so the "newer/older" chain is a separate,
  // hand-authored sequence from the date-sorted display order above.
  eleventyConfig.addCollection("postsChain", (collectionApi) =>
    collectionApi.getFilteredByGlob("journal/posts/*.md").sort((a, b) => a.data.chainOrder - b.data.chainOrder)
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
  // Media page: hand-set "order" first, then week (both ascending).
  eleventyConfig.addFilter("byOrder", (arr) =>
    [...(arr || [])].sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (a.week ?? 0) - (b.week ?? 0)));

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
