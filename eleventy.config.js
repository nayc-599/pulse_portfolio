export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addFilter("dateDisplay", (value) => {
    const d = value instanceof Date ? value : new Date(value + "T00:00:00Z");
    return d
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
      .toUpperCase();
  });

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
