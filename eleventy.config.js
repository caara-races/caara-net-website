import fs from "node:fs";
import path from "node:path";
import { escape as url_escape } from "node:querystring";

import { HtmlBasePlugin } from "@11ty/eleventy";
import markdownItAnchor from "markdown-it-anchor";
import YAML from "yaml";

// Helper function for configuring passthrough copy by extension
function passthroughCopyExtension(eleventyConfig, ext) {
	[ext, ext.toUpperCase()].forEach((item, _) => {
		eleventyConfig.addPassthroughCopy(`content/**/*.${item}`);
	});
}

// Define files that should be copied into the rendered content directory.
function setupPassthroughCopy(eleventyConfig) {
	["kmz", "kml", "png", "jpg", "pdf", "txt", "gpx", "css"].forEach(
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

// Configure filters
function setupFilters(eleventyConfig) {
	eleventyConfig.addFilter("formatAuthor", (author) => {
		if (author.callsign) {
			return `${author.name}, ${linkCallsign(author.callsign)}`;
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
		mdLib.use(markdownItAnchor, {
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

	exposeRunMode(eleventyConfig);
	setupPassthroughCopy(eleventyConfig);
	setupFilters(eleventyConfig);

	eleventyConfig.setDataFileBaseName("_data");

	// Setting a watch target on a file means that changes to that file will
	// trigger a site rebuild. This happens by default for files that
	// eleventy normally processes (.md, .liquid, etc), but needs explicit
	// configuration for other file types.
	eleventyConfig.addWatchTarget("content/css/reset.css");

	// Permit setting base url from the environment.
	eleventyConfig.addPlugin(HtmlBasePlugin, {
		baseHref: process.env.ELEVENTY_BASEURL || "",
	});

	// This shortcode is used in the copyright notice to ensure it always shows
	// the current year.
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
	eleventyConfig.addShortcode(
		"callsign",
		(callsign) => `<span class="callsign">${linkCallsign(callsign)}</span>`,
	);

	// Allow the use of YAML for data files
	eleventyConfig.addDataExtension("yaml", (contents) => YAML.parse(contents));

	return {
		dir: {
			input: "content",
		},
	};
}
