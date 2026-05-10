# caara.net website sources

## Environment variables

- `ELEVENTY_HTML_BASE` -- set this if the site is being hosted at a path other than `/`.
- `ELEVENTY_SITE_URL` -- used to generate fully qualified urls (e.g. in the atom feed). Default
  value comes from `content/_data/site.js`, but environment variable has precedence.
- `ELEVENTY_SITE_DEBUG` -- enables some debug content, such as showing the `weight` attribute of nav links.
