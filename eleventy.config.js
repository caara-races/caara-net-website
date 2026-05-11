import fs from "node:fs";
import path from "node:path";
import { escape as url_escape } from "node:querystring";

import { HtmlBasePlugin } from "@11ty/eleventy";
import { DateTime } from "luxon";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import markdownItContainer from "markdown-it-container";
import markdownItImageFigures from "markdown-it-image-figures";
import YAML from "yaml";

import { readCache, writeCache } from "./lib/cache.js";

const HAMDB_CACHE_DIR = ".cache/hamdb";
const HAMDB_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const LICENSE_CLASSES = {
  T: "Technician",
  G: "General",
  E: "Extra",
  A: "Advanced",
};

function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function lookupCallsign(callsign) {
  const key = callsign.toUpperCase();
  const cached = await readCache(HAMDB_CACHE_DIR, key, HAMDB_CACHE_TTL_MS);
  if (cached !== null) return cached;

  const response = await fetch(`http://api.hamdb.org/${key}/json/caara-net`);
  if (!response.ok) return null;

  const json = await response.json();
  const data = json?.hamdb?.callsign;
  const status = json?.hamdb?.messages?.status;
  if (!data || status !== "OK") return null;

  await writeCache(HAMDB_CACHE_DIR, key, data);
  return data;
}

// Helper function for configuring passthrough copy by extension
function passthroughCopyExtension(eleventyConfig, ext) {
  [ext, ext.toUpperCase()].forEach((item, _) => {
    eleventyConfig.addPassthroughCopy(`content/**/*.${item}`);
  });
}

// Define files that should be copied into the rendered content directory.
function setupPassthroughCopy(eleventyConfig) {
  ["kmz", "kml", "png", "jpg", "pdf", "txt", "gpx", "css", "js"].forEach(
    (item, _) => {
      passthroughCopyExtension(eleventyConfig, item);
    },
  );
}

// Expose current run mode as global runMode variable
function exposeRunMode(eleventyConfig) {
  let currentRunMode = "build";

  eleventyConfig.on("eleventy.before", ({ runMode }) => {
    currentRunMode = runMode;
  });

  // Make runMode available to templates
  eleventyConfig.addGlobalData("runMode", () => currentRunMode);
}

function linkCallsign(callsign) {
  return `<a href="https://hamdb.org/${callsign}">${callsign}</a>`;
}

async function renderCallsign(callsign) {
  let attrs = "";
  try {
    const data = await lookupCallsign(callsign);
    if (data) {
      const cls = LICENSE_CLASSES[data.class] ?? data.class;
      const name = `${data.fname} ${data.name}`.trim();
      const city = [data.addr2, data.state].filter(Boolean).join(", ");
      attrs = ` data-call="${escapeAttr(callsign)}"`;
      attrs += ` data-name="${escapeAttr(name)}"`;
      attrs += ` data-class="${escapeAttr(cls)}"`;
      attrs += ` data-city="${escapeAttr(city)}"`;
      if (data.grid) attrs += ` data-grid="${escapeAttr(data.grid)}"`;
    }
  } catch {
    // Graceful degradation: render without popup data
  }
  return `<span class="callsign"${attrs}>${linkCallsign(callsign)}</span>`;
}

// Configure filters
function setupFilters(eleventyConfig) {
  eleventyConfig.addAsyncFilter("formatAuthor", async (author) => {
    if (author.callsign) {
      let name = author.name;
      if (!name) {
        const data = await lookupCallsign(author.callsign);
        if (data) {
          name = `${data.fname} ${data.name}`.trim();
        }
      }
      const rendered = await renderCallsign(author.callsign);
      return name ? `${name}, ${rendered}` : rendered;
    }
    return `${author.name}`;
  });

  eleventyConfig.addAsyncFilter("formatAuthorPlain", async (author) => {
    if (author.callsign) {
      const callsign = author.callsign.toUpperCase();
      let name = author.name;
      if (!name) {
        const data = await lookupCallsign(callsign);
        if (data) {
          name = `${data.fname} ${data.name}`.trim();
        }
      }
      return name ? `${name}, ${callsign}` : callsign;
    }
    return `${author.name}`;
  });

  eleventyConfig.addFilter(
    "replaceNewlines",
    (value, replacement = "<br/>") => {
      return value.replace(/(\r\n|\n|\r)/g, replacement);
    },
  );

  eleventyConfig.addFilter("lastModified", (filePath) => {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  });

  // URL-escape the given string.
  eleventyConfig.addFilter("urlEscape", (url) => {
    return url_escape(url);
  });

  // Transform the given input into a URL for a google map search.
  eleventyConfig.addFilter("googleMapSearch", (s) => {
    return `https://www.google.com/maps/search/?api=1&amp;query=${url_escape(s)}`;
  });

  // Return true if the given path is a directory. The path is relative to
  // the input directory.
  eleventyConfig.addFilter("dirExists", (relpath) => {
    // Resolve the path relative to the project root (or input dir, as needed)
    const absolutePath = path.join(eleventyConfig.dir.input, relpath);

    try {
      const stats = fs.statSync(absolutePath);
      return stats.isDirectory(); // Returns true if it is a directory
    } catch (_error) {
      return false; // If an error occurs (e.g., directory doesn't exist), return false
    }
  });

  // Return true if the given path is a regular file. The path is relative to
  // the input directory.
  eleventyConfig.addFilter("fileExists", (relpath) => {
    // Resolve the path relative to the project root (or input dir, as needed)
    const absolutePath = path.join(eleventyConfig.dir.input, relpath);

    try {
      const stats = fs.statSync(absolutePath);
      return stats.isFile(); // Returns true if it is a directory
    } catch (_error) {
      return false; // If an error occurs (e.g., directory doesn't exist), return false
    }
  });

  eleventyConfig.addFilter("qrz", (callsign) => {
    return `<a href="https://www.qrz.com/db/${callsign}">${callsign}</a>`;
  });

  eleventyConfig.addFilter("pluralize", (count, singular, plural) => {
    return count === 1 ? singular : plural;
  });
}

export default function (eleventyConfig) {
  eleventyConfig.amendLibrary("md", (mdLib) =>
    mdLib
      .use(markdownItAttrs)
      .use(markdownItContainer, "dynamic", {
        validate: () => true,
        render(tokens, idx) {
          if (tokens[idx].nesting === 1) {
            const cls = mdLib.utils.escapeHtml(tokens[idx].info.trim());
            return `<div class="${cls}">\n`;
          }
          return "</div>\n";
        },
      })
      .use(markdownItImageFigures, {
        figcaption: true,
      })
      .use(markdownItAnchor, {
        slugify: (s) =>
          s
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[/]/g, "-")
            .replace(/[^a-z0-9_-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, ""),
      }),
  );

  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: false,
  });

  // This code is solving two problems:
  //
  // 1. Eleventy interprets a bare date as midnight UTC. Since we are in UTC-4,
  //    this makes all displayed dates one day early (2025-12-19 gets displayed
  //    as 2025-12-18).
  //
  // 2. Eleventy parses dates from filenames at a different point than it
  //    parses the `date` frontmatter values, which means that `dateValue` is
  //    undefined for pages with dates in filenames.
  //
  // See https://github.com/11ty/eleventy/issues/3649 for some related
  // discussion.
  eleventyConfig.addDateParsing(function (dateValue) {
    let isoString = typeof dateValue === "string" ? dateValue : undefined;
    if (!isoString && this.page?.inputPath) {
      const match = path
        .basename(this.page.inputPath)
        .match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) isoString = match[1];
    }
    if (isoString) {
      return DateTime.fromISO(isoString, { zone: "America/New_York" });
    }
  });

  exposeRunMode(eleventyConfig);
  setupPassthroughCopy(eleventyConfig);
  setupFilters(eleventyConfig);

  eleventyConfig.addCollection("aliases", (collectionApi) => {
    const aliases = [];
    for (const item of collectionApi.getAll()) {
      if (item.data.aliases) {
        for (const alias of item.data.aliases) {
          const from = alias.endsWith("/")
            ? `${alias}index.html`
            : `${alias}/index.html`;
          aliases.push({ from, to: item.url });
        }
      }
    }
    return aliases;
  });

  eleventyConfig.setDataFileBaseName("_data");

  // Setting a watch target on a file means that changes to that file will
  // trigger a site rebuild. This happens by default for files that
  // eleventy normally processes (.md, .liquid, etc), but needs explicit
  // configuration for other file types.
  eleventyConfig.addWatchTarget("content/css/reset.css");

  // Permit setting base url from the environment.
  eleventyConfig.addPlugin(HtmlBasePlugin, {
    baseHref: process.env.ELEVENTY_HTML_BASE || "",
  });

  // This shortcode is used in the copyright notice to ensure it always shows
  // the current year.
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addAsyncShortcode("callsign", renderCallsign);

  // Allow the use of YAML for data files
  eleventyConfig.addDataExtension("yaml", (contents) => YAML.parse(contents));

  return {
    dir: {
      input: "content",
    },
  };
}
