# Homeloans and Bonds

Static marketing website for [Homeloans and Bonds](https://homeloansandbonds.co.za), a South African home-loan / bond origination business. Built with [Jekyll](https://jekyllrb.com/) and deployed to GitHub Pages.

## How it works

- Content is data-driven from `_data/sitetext.yml` and `_data/navigation.yml`, rendered through includes in `_includes/` and layouts in `_layouts/`.
- Front-end assets (SCSS + JS) are authored in `_assets/` and bundled with webpack into `assets/bundle.js` / `assets/bundle.css`.
- The bond/affordability/transfer calculators are embedded `ooba.co.za` iframes (see `bond-calculator.md`, `affordability-calculator.md`, `transfer-costs-calculator.md`).
- The contact form posts to Formspree (`_includes/contact.html`).

## Local development

1. Install Ruby/Jekyll and Node.js.
2. Install JS dependencies: `npm install`
3. Build front-end assets: `npm run bundle`
4. Serve the site: `npm run serve` (opens a Jekyll dev server at `http://localhost:4000`)

> Note: GitHub Pages' default Jekyll build does **not** run webpack. The bundled `assets/bundle.js` / `assets/bundle.css` are committed to the repo, so you must run `npm run bundle` and commit the rebuilt assets after changing `_assets/`.
