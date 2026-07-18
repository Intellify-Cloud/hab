# Site Structure & Architecture — Homeloans and Bonds

> Audience: an AI coding agent (or reviewer) who needs a complete map of this Jekyll site
> before making changes. This document describes the folder structure, centralization of
> content/config, SEO, optimization, typography, Sass/mixins, `config.yml`, navigation data,
> `sitetext.yml`, Liquid/Sass/Bootstrap usage, asset placement, the `Gemfile`, and how the
> layouts (`default.html`, `home.html`, `page.html`) and `_includes` fit together.
>
> Generated: 2026-07-18. State reflects the working tree at that time.

---

## 1. TL;DR mental model

This is a **Jekyll 4 static site** (GitHub Pages) for a South African home-loan / bond
origination business. There is **no application logic** — it is a brochure site.

- **Content** lives in `_data/sitetext.yml` and `_data/navigation.yml` (data-driven).
- **Markup** is assembled from `_layouts/*` + `_includes/*` (Liquid templates).
- **Styles/scripts** are authored in `_assets/*`, bundled by **webpack 4** into
  `assets/bundle.css` + `assets/bundle.js`.
- **Pages** are `.md` files at the repo root (`index.md`, `contact.md`, calculators, `legal.md`).
- The "calculators" are just `ooba.co.za` iframes embedded in three `.md` pages.

**Golden rule for AI agents:** Do **not** hardcode copy, links, or labels in templates.
Put editable content in `_data/sitetext.yml`; put navigation in `_data/navigation.yml`.
Keep presentation in `_assets/**/*.scss`. Keep JavaScript behaviour minimal in
`_assets/site.js`.

---

## 2. Directory structure (annotated)

```
hab/
├── _config.yml            # Jekyll + site config (URL, title, GA, FB, collections)
├── Gemfile                # Ruby/Jekyll dependencies (jekyll ~> 4.0)
├── Gemfile.lock           # (gitignored) — pinned ruby gem versions
├── package.json           # Node deps + build scripts (webpack)
├── package-lock.json      # (committed) pinned node deps
├── webpack.config.js      # webpack 4 build (SCSS/JS -> assets/bundle.*)
├── CNAME                  # "homeloansandbonds.co.za" (apex; matches _config url)
├── README.md              # Project + build/serve instructions
│
├── _data/
│   ├── navigation.yml     # Top nav items (title + section/url)  <-- ONLY nav source
│   └── sitetext.yml       # ALL page copy, section lists, footer, team, clients, etc.
│                          #     <-- ONLY content source (very large, ~219 lines)
│
├── _layouts/
│   ├── default.html       # Base skeleton: <head> + body + footer + FB chat script
│   ├── home.html          # Extends default; composes the homepage sections
│   └── page.html          # Extends default; simple container wrapper for sub-pages
│
├── _includes/
│   ├── head.html          # <head>: GA, FB Pixel, meta/OG/Twitter, fonts, bundle links
│   ├── nav.html            # Top nav (parametrized). Called with `hero=true` on home,
│   │                      #   without on sub-pages. Also renders the hero masthead when hero=true.
│   ├── footer.html        # Site footer (data-driven; see §9)
│   ├── textblock.html     # "Why us" section
│   ├── services.html      # Services cards (data-driven)
│   ├── clients.html       # Bank-partner logos (data-driven)
│   ├── calculators.html   # Calculator cards linking to the iframe pages (data-driven)
│   ├── team.html          # Team members (data-driven; also included on calc/contact pages)
│   ├── about.html         # About section (data-driven)
│   ├── contact.html       # Contact form (mailto-based)
│   ├── modals.html        # Portfolio modals (UNUSED / dead)
│   ├── portfolio_grid.html# Portfolio grid (UNUSED / dead)
│   ├── posts.html         # Blog post list (UNUSED; commented out in home.html)
│   └── timeline.html      # Buying-process timeline (UNUSED / dead)
│
├── _assets/               # SOURCE for styles/scripts (compiled away by webpack)
│   ├── bundle.js          # webpack entry: imports jquery, bootstrap, fa, scss, site.js
│   ├── site.js            # jQuery behaviours (smooth scroll, scrollspy, nav shrink)
│   ├── site.scss          # Sass entry: imports bootstrap + all partials
│   ├── img/               # header.jpg, contact.png (referenced by scss)
│   ├── base/              # Design tokens + global styles
│   │   ├── _variables.scss# Gray scale + design tokens
│   │   ├── _mixins.scss    # Font mixins (serif/script/body/heading)
│   │   ├── _page.scss      # body, a, headings, iframe sizing, selection
│   │   └── _calculators.scss # .calculators card styling
│   ├── components/        # Reusable component pieces
│   │   ├── _buttons.scss
│   │   ├── _navbar.scss
│   │   └── _client-scroll.scss
│   └── layout/            # One partial per page section
│       ├── _masthead.scss
│       ├── _services.scss
│       ├── _portfolio.scss
│       ├── _timeline.scss
│       ├── _team.scss
│       ├── _contact.scss
│       ├── _footer.scss   # Footer presentation (rewritten to spec 2026-07-18)
│       ├── _clients.scss
│       └── _textblock.scss
│
├── _portfolio/            # Portfolio collection (UNUSED — theme leftover)
│   ├── example.md, project1.md, project2.md
├── _posts/                # Blog posts (UNUSED — sample "New Years Eve" posts, 2 have " copy")
│   ├── 2020-10-31-...md, 2019-... copy.md, 2011-... copy.md
│
├── assets/                # BUILD OUTPUT (committed). Generated by `npm run bundle`.
│   ├── bundle.css         # Compiled from _assets/site.scss
│   ├── bundle.js          # Compiled from _assets/bundle.js
│   ├── bundle.js.LICENSE.txt
│   └── (hashed font/image assets)
│
├── index.md               # Home page (front matter: layout: home)
├── contact.md             # Contact page (layout: page)
├── legal.md               # Privacy Policy (layout: page)
├── affordability-calculator.md  # iframe page (layout: page)
├── bond-calculator.md            # iframe page (layout: page)
├── transfer-costs-calculator.md  # iframe page (layout: page)
├── 404.html               # Custom 404 (layout: page)
└── social.jpg, Social.png, favicon.png, evo_up_homeloan_experts.gif  # root-level images
```

> Note: `_assets/components/dist/*` and `_assets/layout/dist/*` contain pre-built CSS
> that is **not** consumed by the webpack entry — leftover artifacts. The real pipeline
> is `_assets/site.scss` → `assets/bundle.css`.

---

## 3. Centralization (where things live, single source of truth)

| Concern | Single source | Consumed by |
|---|---|---|
| Site title/url/email/logo | `_config.yml` | `head.html`, `nav*.html`, `footer.html`, `legal.md` |
| Navigation menu | `_data/navigation.yml` | `nav.html` (single include, `hero` param) |
| All page copy & section lists | `_data/sitetext.yml` | every `_includes/*` via `site.data.sitetext.*` |
| Footer content | `footer:` block in `_data/sitetext.yml` | `_includes/footer.html` |
| Team members | `team:` block in `sitetext.yml` | `team.html` |
| Client logos | `clients:` block | `clients.html` |
| Analytics/Pixel | `_config.yml` (`analytics`, `facebook`) | `head.html`, `default.html` |
| Styles/tokens | `_assets/base/_variables.scss`, `_mixins.scss` | imported by `site.scss` |
| Build config | `webpack.config.js` + `package.json` scripts | `npm run bundle` |
| Ruby/Jekyll | `Gemfile` (`jekyll ~> 4.0`) | `jekyll build`/`serve` |

**Centralization strengths:** Almost all editable text is in `sitetext.yml`; nav is in one
file; design tokens are in one `_variables.scss`. This is good.

**Centralization gaps (flag for review):**
- The nav was consolidated: `nav.html` + `navheader.html` are now a single
  `_includes/nav.html` parametrized by `hero` (home passes `hero=true`, sub-pages omit it).
  `navheader.html` is retired (renamed `navheader.html.unused`).
- `services.html` and `calculators.html` now delegate to a shared `_includes/card-grid.html`
  (`source`, `deck_class` params) instead of duplicating the card markup.
- Root-level images (`social.jpg`, `Social.png`, `evo_up_homeloan_experts.gif`) are loose;
  consider moving under `assets/img/`.

---

## 4. `_config.yml` (config)

Current relevant keys:

```yaml
url: "https://homeloansandbonds.co.za"   # apex — MUST match CNAME
baseurl: ""
title: Homeloans and Bonds
email: info@homeloansandbonds.co.za
description: "..."                       # used in meta/OG/Twitter
author: ""                               # empty -> renders empty <meta author>
analytics:
  google: G-9CQQ2N9SGF                    # GA4 id (templated into head.html)
facebook:
  pixel_id: "1294367394294937"
  page_id: "107395807829809"
  app_id: "1678638095724206"
  enabled: true                          # gates FB Pixel + Customer Chat
plugins:
  - jekyll-sitemap
collections:
  portfolio:                             # empty-ish; portfolio feature unused
markdown: kramdown
webserver_headers:                       # CORS headers (informational; not enforced by GH Pages)
logo:
  path: /assets/img/logo.png
```

**Notes for agents:**
- `url` must stay consistent with `CNAME` (both apex). Changing one without the other breaks
  canonical/OG URLs.
- `author` is empty — either set it or the `<meta name="author">` is blank.
- `facebook.enabled: false` will remove all FB tracking (useful for a consent gate).
- `plugins: [jekyll-sitemap]` generates `sitemap.xml`; `robots.txt` advertises it to crawlers.

---

## 5. Navigation (`_data/navigation.yml`)

```yaml
nav:
  - title: "Why Us?"      section: textblock
  - title: "Services"     section: services
  - title: "Team"         section: team
  - title: "About"        section: about
  - title: "Calculators"  section: calculators
  - title: "Contact"      url: /contact
```

Rendered by the single `_includes/nav.html` (parametrized by `hero`) with this logic:

```liquid
{%- if link.url -%}      <a href="{{ link.url }}">…</a>
{%- elsif link.section -%}
    {%- if include.hero -%} <a href="#{{ link.section }}">…</a>            (home)
    {%- else -%}           <a href="{{ site.url }}/#{{ link.section }}">…</a>  (sub-page)
    {%- endif -%}
{%- else -%}             <a href="#">…</a>
{%- endif -%}
```

> History: the original used invalid `{% else if %}` (not valid Liquid). It is now `elsif`.
> `nav.html` renders `#section` on the home page (`hero=true`) and `{{ site.url }}/#section`
> on sub-pages, preserving the original distinction via the `hero` parameter rather than a
> separate file.

---

## 6. `sitetext.yml` usage

Top-level keys currently: `header`, `calculators`, `services`, `textblock`, `portfolio`,
`timeline`, `about`, `clients`, `team`, `contact`, `footer`.

Common patterns inside:
- `title` / `text` / `subtext` — section headings & copy.
- `list:` — arrays of cards/items, each with `title`, `desc`, `icon`, optional `link: {url, text}`.
- `link.url` values are relative (`/contact`) or protocol (`mailto:`, `tel:`).
- Markdown is supported via the `| markdownify` filter in templates (e.g. `{{ x | markdownify }}`).
- Safe fallbacks use `| default: "…"`.

**Editing rule:** Add/remove a section's content by editing `sitetext.yml` + the matching
include. Do not bake copy into HTML.

---

## 7. Liquid usage conventions

- Data access: `site.data.sitetext.<key>.<subkey>` (note `site.data.sitetext`, not `site.sitetext`).
- Loops: `{% for x in site.data.sitetext.foo.list %}`.
- Conditionals use `elsif` (NOT `else if`).
- Whitespace control: `{%- -%}` used heavily to keep output tidy.
- Filters: `relative_url`, `markdownify`, `default`, `date: "%Y"`.
- External links get `target="_blank" rel="noopener"` (and `rel="noopener noreferrer"` on some).
  Internal links (and `tel:`/`mailto:`) should NOT open new tabs.
- `head.html` wraps analytics in `<!-- {% if … %} -->` HTML comments — effectively always on;
  the `site.facebook.enabled` flag is a real `{% if %}` gate (works), while GA is wrapped in a
  *commented* `{% if %}` (cosmetic). Don't rely on the commented wrappers to disable GA.

---

## 8. Sass / Bootstrap / typography

### Entry & imports (`_assets/site.scss`)
1. Imports Bootstrap functions/variables/mixins.
2. Overrides design tokens: `$primary: #ca00ca`, `$border-radius: 0`, `$enable-rounded: false`,
   `$enable-shadows: false`, `$enable-gradients: false`, `$border-width: 3px`, `$spacer: 1rem`.
3. `@import "bootstrap/scss/bootstrap"` then `@import "bootstrap"`.
4. Imports all partials in `base/`, `components/`, `layout/`.

### Typography (fonts)
Loaded via Google Fonts `<link>`s in `head.html` (Montserrat, Kaushan Script, Droid Serif,
Roboto Slab). Font-family stacks are centralized as **mixins** in `_assets/base/_mixins.scss`:
- `serif-font` (Droid Serif), `script-font` (Kaushan), `body-font` (system/Roboto),
  `heading-font` (Montserrat).
Used via `@include heading-font;` etc. The footer uses `heading-font`. `body` uses Roboto Slab
(see `_assets/base/_page.scss`).

### Design tokens (`_assets/base/_variables.scss`)
Holds a restated Bootstrap gray scale (`$gray-100`…`$gray-900`). `$primary` etc. are set in
`site.scss` (step 2 above), NOT here. Keep new tokens in `site.scss` overrides or `_variables.scss`.

### Component vs layout partials
- `base/` = global tokens + global element styles (`_page.scss`, `_calculators.scss`, `_variables`, `_mixins`).
- `components/` = standalone reusable widgets (`_buttons`, `_navbar`, `_client-scroll`).
- `layout/` = one partial per page section (`_masthead`, `_services`, `_footer`, …).

> The `_navbar.scss` is under `components/` but styles the global nav; `_footer.scss` is under
> `layout/`. Minor inconsistency — fine, but be aware both are global.

### Bootstrap usage
Bootstrap 4.3.1 is imported whole via Sass. Markup uses Bootstrap grid/utility classes
(`container`, `row`, `col-md-*`, `list-inline`, `card`, `text-muted`, `bg-light`, `fixed-top`).
jQuery + Popper + Bootstrap JS are bundled in `bundle.js` and initialized in `site.js`
(`scrollspy`, `collapse`, smooth scroll). No custom Bootstrap JS components beyond that.

---

## 9. Layouts & include placement

### `default.html` (base skeleton)
```
<!DOCTYPE html>
<html>
  {% include head.html %}          # <head>: meta, fonts, GA, FB Pixel, bundle links
  <body id="page-top">
    {{ content }}                  # page or home layout content injected here
    {% if site.facebook.enabled %} … FB Customer Chat script … {% endif %}
    {% include footer.html %}      # footer (normal document flow, no fixed positioning)
  </body>
</html>
```
Every page renders through `default` (directly or via inheritance).

### `home.html` (layout: default)
Composes the one-page homepage by sequencing includes **in order**:
```
{% include nav.html hero=true %} # nav + hero masthead
{% include textblock.html %}   # "Why us"
{% include services.html %}    # services cards
{% include clients.html %}     # bank logos
{% include calculators.html %} # calculator cards
{% include team.html %}        # team
{% include about.html %}       # about
<!-- {% include posts.html %} -->  # (commented out — posts unused)
```

### `page.html` (layout: default)
```
{% include nav.html %}         # sub-page top nav (no hero)
{% if background == "grey"/"gray" %}<script>…add bg-light…</script>{% endif %}
<div class="container" id="pagecontainer">{{ content }}</div>
```
Used by `contact.md`, `legal.md`, the three calculator `.md` pages, and `404.html`.
Those `.md` pages additionally `{% include team.html %}` at the end of their own body.

### Include dependency map
```
default.html ── head.html
            ── (facebook chat)
            ── footer.html
home.html   ── nav.html (hero=true), textblock, services, clients, calculators, team, about
page.html   ── nav.html
*.md pages  ── team.html (appended)
portfolio_grid.html ── modals.html   (both UNUSED)
```

> Dead includes (do not edit expecting visible effect): `modals.html`, `portfolio_grid.html`,
> `timeline.html`, `posts.html`. They are not referenced by any active layout.

---

## 10. SEO & optimization

### Present (good)
- `head.html` emits: `<title>` (page-aware), `description`, canonical
  (`rel="canonical"` via `page.url | relative_url | prepend site.url`), Open Graph
  (og:type/url/title/description/image), Twitter card, `favicon.png`, and JSON-LD business
  schema.
- `CNAME` + `url` are aligned to the apex host.
- `robots.txt` and `sitemap.xml` are generated/served for crawl discovery.
- Semantic landmarks: `<footer>`, `<nav>` (footer), `<header class="masthead">`.
- `alt` text added to team/logo images (2026-07-17 cleanup).
- `<html lang="en-ZA">` is present.

### Gaps (flag for review)
- **Canonical/OG built from `site.url`** — if `url` and the served host disagree, canonical is
  wrong. They currently agree (apex), good.
- **Some root images still lack explicit `width`/`height`**. Calculator iframes now have explicit dimensions in the page markup, so their CLS risk is lower.
- **Large committed binaries**: `social.jpg`, `.gif`, and several SVG/font assets in `assets/`.
  GitHub Pages serves them; not optimized but acceptable for a small site.
- **Double GA was removed** (was loading twice); now single templated block.
- **Facebook consent** is now gated by the banner and localStorage, but you should still verify the flow in a browser before shipping. `facebook.enabled` defaults to `false` as a safe fallback.
- **`author` meta is blank** (`_config.yml author: ""`).
- **Lighthouse**: run it after changes; the fixed-footer bug is gone (was a past overlap risk).
- **Social links are present but minimal and not centrally consistent** — see §10b.
- **Contact form is mailto-based** — it depends on the visitor's email client, so it is not a
  reliable server-side submission flow. See §10b.

---

## 10b. Social elements & contact form (status vs. best practice)

### Where social links live today
Social links are now split by **concept**, each with a single source of truth:

1. **Brand social (footer + JSON-LD)** — a single `_data/social.yml` list of brand channels
   (`title`/`url`/`icon`). Consumed by `_includes/footer.html` (footer row) and
   `_includes/head.html` (`sameAs` in the `FinancialService` JSON-LD). To add a channel, edit
   **one** file: `_data/social.yml`.
   ```liquid
   <ul class="footer-social list-inline social-buttons" aria-label="Follow us">
     {% for link in site.data.social %}
       <li class="list-inline-item">
         <a href="{{ link.url }}" target="_blank" rel="noopener noreferrer" aria-label="{{ link.title }}">
           <i class="{{ link.icon }}"></i>
         </a>
       </li>
     {% endfor %}
   </ul>
   ```
   Currently configured with **only one** active entry: Facebook
   (`https://www.facebook.com/Homeloans-and-Mortgage-Bonds-107395807829809`, icon
   `fab fa-facebook-f`). LinkedIn/others are present but commented out.

2. **Per-person team social** — `_includes/team.html` (lines 17–25) renders
   `site.data.sitetext.team.people[].social`. These are **personal contact links**
   (`tel:`, `mailto:`, per-person Facebook) and are inherently per-person, so they stay defined
   on each team member (not in the shared brand list). They use the same canonical
   `title`/`url`/`icon` shape.

3. **Facebook Customer Chat widget** — `_layouts/default.html` injects the FB Messenger
   `fb-customerchat` SDK (gated by `site.facebook.enabled`).

### How this deviates from known best practices
- **Single network only.** Only Facebook is active. Best practice for a local business is to
  surface the channels customers actually use (Google Business Profile, Facebook, LinkedIn,
  WhatsApp). LinkedIn etc. are commented out in `_data/social.yml`. The brand social is now a
  single source (`_data/social.yml`), so adding a channel is one edit.
- **`rel` attribute now consistent.** Both footer and team social links use
  `rel="noopener noreferrer"`.
- **Icon-only links are labelled.** Footer social anchors carry `aria-label="{{ link.title }}"`
  (good). Team anchors carry `aria-label`/`title` via
  `aria-label="{{ network.title | default: network.icon }}"` (good). Keep both labelled.
- **No `hreflang`/localization** and no share buttons / Open Graph validation, lower priority
  for a single-locale (en-ZA) site.
- **Facebook consent flow should be regression-tested.** The chat widget + Pixel are now loaded only after explicit opt-in, which addresses the POPIA/GDPR concern, but this is a behavior-sensitive path that should be checked in-browser after future edits.

### Contact form — no external backend
- `_includes/contact.html` uses a `mailto:` action to `site.email` instead of a hosted form
  service.
- There is no external form-service config in `_config.yml`.
- Consequence: sending depends on the visitor's local mail client, so it is not a server-side
  submission flow.
- Best practice: if you need reliable submissions, replace the mailto form with a backend or
  hosted form service; otherwise keep the email/phone links prominent so users can contact you
  directly.

---



## 11. Build & tooling

### Node / webpack
- `package.json` scripts: `bundle` (webpack), `serve` (`jekyll serve --baseurl ''`), `trace`.
- `webpack.config.js`: entry `_assets/bundle.js` → output `assets/bundle.js` + `bundle.css`
  (MiniCssExtractPlugin). Loaders for css, scss (sass-loader), fonts (url/file-loader).
- **Important:** GitHub Pages' default Jekyll build does **NOT** run webpack. The compiled
  `assets/bundle.*` are **committed** and must be rebuilt locally after editing `_assets/`.
- webpack 4 + Node 17+ needs `NODE_OPTIONS=--openssl-legacy-provider` for the build to succeed
  (known OpenSSL error otherwise).

### Ruby / Jekyll
- `Gemfile`: `gem "jekyll", "~> 4.0"`. `Gemfile.lock` is gitignored.
- Local serve: `bundle exec jekyll serve --host 127.0.0.1 --port 4000`.

### Rebuild checklist (when editing styles)
1. `npm run bundle` (with the legacy OpenSSL flag if needed).
2. Verify `assets/bundle.css` changed and contains your new rules.
3. `bundle exec jekyll serve` and inspect a normal page + the 404 short page.

---

## 12. Quick reference for agents making changes

- **Change copy/links** → edit `_data/sitetext.yml` (and `_data/navigation.yml` for menu).
- **Change footer** → `_data/sitetext.yml` `footer:` + `_includes/footer.html` + `_assets/layout/_footer.scss`.
- **Change nav** → `_data/navigation.yml` (+ the `elsif` logic in `nav.html`, branched on `include.hero`).
- **Change styles/tokens** → `_assets/base/_variables.scss` or `site.scss` overrides; section styles in `_assets/layout/_*.scss`. Rebuild bundle.
- **Change scripts** → `_assets/site.js` (jQuery) or `bundle.js` imports. Rebuild bundle.
- **Add a page** → create `<name>.md` at root with `layout: page` (or `home`). Append
  `{% include team.html %}` if you want the team block, like the existing pages do.
- **Config** → `_config.yml` (`url` must match `CNAME`; toggle `facebook.enabled`).
- **Do NOT** edit `assets/bundle.*` by hand — regenerate via `npm run bundle`.
- **Do NOT** introduce React/Tailwind/TS — the project standard is Liquid + Sass + Bootstrap 4.

---

## 13. Known dead/unused code (safe to delete after confirming)
- `_includes/modals.html`, `_includes/portfolio_grid.html`, `_includes/timeline.html`, `_includes/posts.html`
- `_portfolio/*` (example.md, project1.md, project2.md)
- `_posts/*` (incl. the two `… copy.md` files)
- `_assets/components/dist/*`, `_assets/layout/dist/*` (stale prebuilt CSS not in the webpack entry)
- Root images `social.jpg`, `Social.png`, `evo_up_homeloan_experts.gif` could move under `assets/img/`.

