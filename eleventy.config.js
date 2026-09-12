export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addFilter("dateDisplay", (isoDate) => {
    const d = new Date(isoDate + "T00:00:00Z");
    return d
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
      .replace(/ /g, " ")
      .toUpperCase();
  });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("journal/posts/*.md").sort((a, b) => b.date - a.date)
  );

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
