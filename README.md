# caara.net website sources

## Requirements

You will need [node.js].

[node.js]: https://nodejs.org/en

## Building the website

1. Install dependencies:

    ```sh
    npm install
    ```

2. Build the content:

    ```sh
    npm run build
    ```

If you want to access the site locally in your browser, you can run:

```sh
npm run serve
```

This will make the rendered content available at <http://localhost:8080> (unless you already have something listening on port `8080`, in which case it will use `8081`, ...).

## Environment variables

- `ELEVENTY_HTML_BASE` -- set this if the site is being hosted at a path other than `/`.
- `ELEVENTY_SITE_URL` -- used to generate fully qualified urls (e.g. in the atom feed). Default
  value comes from `content/_data/site.js`, but environment variable has precedence.
- `ELEVENTY_SITE_DEBUG` -- enables some debug content, such as showing the `weight` attribute of nav links.
