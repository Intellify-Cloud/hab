# Code Review & Remediation Plan — Homeloans and Bonds (Jekyll site)

Date: 2026-07-17
Reviewer: Kilo Code (planning agent)
Scope: Full static-site codebase in `C:\VS Code\hab`

> Note: You asked for this in a `docs/` folder. Plan Mode can only write to plan
> directories, so it is saved here. Copy this file to `docs/code-review-and-plan.md`
> yourself, or ask an implementation-capable agent (e.g. Code mode) to move it.

---

## 1. What this project is

A **Jekyll 4 static site** deployed via **GitHub Pages** (`CNAME` → `homeloansandbonds.co.za`)
for a South African home-loan / bond origination business. Content is data-driven from
`_data/sitetext.yml` and `_data/navigation.yml`, rendered through `_includes/` and `_layouts/`.
Front-end assets are authored in `_assets/` (SCSS + JS) and bundled with **webpack 4** into
`assets/bundle.js` / `assets/bundle.css`. The three "calculators" are `ooba.co.za` iframes.
The contact form posts to Formspree.

There is **no application/server logic** — this is a marketing brochure site. Findings are
therefore about template/config correctness, broken links, third-party integrations, dead
template code, tooling, and hygiene.

---

## 2. Findings (grouped by severity)

### Critical — likely broken in production

- **F1. Contact form uses deprecated Formspree endpoint.**
  `_includes/contact.html` line 13: `action="https://formspree.io/{{ site.email }}"`.
  Formspree removed the email-in-URL format; it now requires `https://formspree.io/f/{form_id}`.
  The contact form on `/contact` is likely **not delivering submissions** — the site's primary
  lead-capture path.

- **F2. Liquid `else if` is invalid — nav "section" links fall through.**
  `_includes/nav.html` (line 21) and `_includes/navheader.html` (line 23) use
  `{%- else if link.section -%}`. Liquid has **no `else if`**; correct keyword is `elsif`.
  Liquid treats it as a single `else`, so the intended `link.section` branch never runs as
  written. Behavior differs between the two files (`nav.html` uses `{{ site.url }}/#`,
  `navheader.html` uses `#`). Fix to `elsif` in both and verify branch order/anchor output.

### High — user-visible correctness / broken links

- **F3. Header "branches" all point to a non-existent page.**
  `_data/sitetext.yml` `header.branches[*].link` all point to `/boland-cape-winelands`
  (including Pretoria and Southern Suburbs). No such page exists → 404s. Also this `branches`
  data is not rendered by any include (dead data) — decide: wire up or remove.

- **F4. Standard Bank client link points to ABSA.**
  `_data/sitetext.yml` line 143: Standard Bank `url: https://www.absa.co.za`. Should be
  `https://www.standardbank.co.za`.

- **F5. Malformed URL in footer social data.**
  `_data/sitetext.yml` line 187: `url: https://www.facebook.com/...829809 target="_blank"`
  — `target="_blank"` is baked into the URL string, producing a broken `href`.

- **F6. Calculator card mislabeled / mislinked.**
  `_data/sitetext.yml` calculators list: card titled **"Bond Calculator"** ("Calculate the home
  loan you qualify for") links to `/affordability-calculator`, while "Repayment Calculator"
  links to `/bond-calculator`. Titles/links appear swapped vs. actual calculator pages. Verify
  intended mapping.

- **F7. Placeholder "Lorem ipsum" copy shipped in data.**
  `_data/sitetext.yml` `contact.text: "Lorem ipsum or call 123456789"`. This `contact` block's
  `section: team` also collides with the team section id.

### Medium — SEO, privacy, analytics, security hygiene

- **F8. Google Analytics loaded twice.**
  `_includes/head.html` has two full GA (gtag) blocks — one templated from
  `site.analytics.google`, one hard-coded `G-9CQQ2N9SGF`. Double-counts pageviews. Keep the
  templated one only.

- **F9. Two separate Facebook integrations, both hard-coded, no consent.**
  `head.html` has a Facebook **Pixel** (`1294367394294937`); `_layouts/default.html` injects the
  Facebook **Customer Chat** SDK (`page_id 107395807829809`, `appId 1678638095724206`). IDs are
  hard-coded, and there is **no cookie consent** gate — relevant for POPIA (SA) / GDPR.
  `legal.md` discloses only Google Analytics cookies, not Facebook.

- **F10. `_config.yml` URL vs. CNAME mismatch.**
  `_config.yml` `url: "https://www.homeloansandbonds.co.za"` (www) but `CNAME` is apex
  `homeloansandbonds.co.za`. `head.html` builds canonical/OG/Twitter URLs from `site.url`, so
  canonical tags point at a different host than served → SEO inconsistency. Pick one canonical
  host and redirect the other.

- **F11. `target="_blank"` links without `rel="noopener noreferrer"`.**
  e.g. `_includes/team.html` (line 20), `_includes/footer.html`. Reverse-tabnabbing / perf.

- **F12. Missing image `alt` text.**
  `_includes/team.html` `alt=""`, logo `<img>` in `nav.html`/`navheader.html` have no `alt`.
  Accessibility + SEO.

### Low — hygiene, tooling, dead code, metadata

- **F13. Built artifacts committed to git and currently drifted.**
  `assets/bundle.js`, `assets/bundle.css`, hashed `*.svg`, `bundle.js.LICENSE.txt` are tracked
  and show as **modified but uncommitted** (drifted from source). GitHub Pages' default Jekyll
  build does **not** run webpack, so the committed bundle is **load-bearing**. Either (a) commit
  the rebuild deterministically as a documented step, or (b) add CI to build and then gitignore.
  Do not gitignore before CI exists or the live site breaks.

- **F14. Project metadata is from another project ("Intellify").**
  `package.json` `name: "intellify"`, description/author reference Intellify; `README.md`
  describes the "Intellify" site. (Footer "Website by Intellify" credit is intentional.) Update
  repo metadata + README to describe this site and its build/serve steps.

- **F15. Dead / template leftover content.**
  - `_portfolio/example.md`, `project1.md`, `project2.md` and includes `portfolio_grid.html`,
    `modals.html`, `timeline.html` are theme leftovers not used by any layout.
  - `_posts/` has sample posts, including two literally named `... copy.md`. Posts include is
    commented out in `home.html`.
  - `contact` and `portfolio` YAML blocks partly unused.

- **F16. Outdated / potentially vulnerable dependencies.**
  webpack 4, bootstrap 4.3.1, jQuery 3.4.1, popper 1.x, older loaders. `Gemfile.lock` gitignored.
  Many are EOL with known advisories. Low urgency for a brochure site; plan a tested upgrade
  (Bootstrap 4→5 drops jQuery and changes data attributes — larger effort).

- **F17. Inline styles & magic values.**
  Inline `style="background-color:#fff"` in nav/footer; `_includes/clients.html` has an invalid
  CSS token `margin=300px`. Move to SCSS.

- **F18. Duplicated near-identical includes.**
  `nav.html` vs `navheader.html`, and `services.html` vs `calculators.html` are ~90% identical.
  DRY opportunity (shared card include; single parametrized nav).

---

## 3. Assumptions & open questions (confirm before implementation)

1. **Canonical host**: apex (`homeloansandbonds.co.za`) or `www`? (Recommend apex, matching CNAME.)
2. **Formspree**: is there an active account + form ID to use? (Blocker for F1.)
3. **Analytics/Pixel**: keep both GA and Facebook Pixel + Chat? Cookie consent required (POPIA)?
4. **Build/deploy**: confirm GitHub Pages serves the committed `assets/bundle.*` (webpack run
   locally and committed). Determines whether F13 is "keep committing" or "move to CI".
5. **Branches data (F3)**: build real branch pages, repoint links, or delete the data?

---

## 4. Remediation plan (ordered, low-risk first)

> These are source-file edits requiring an implementation-capable agent. Rebuild
> `assets/bundle.*` in any commit that touches `_assets/` until the CI decision (F13) is made.

### Phase A — Correctness fixes (highest impact, smallest change)
1. **F1** Update `_includes/contact.html` form `action` to `https://formspree.io/f/{FORM_ID}`
   (obtain ID first). Verify `_next` success redirect and delivery.
2. **F2** In `_includes/nav.html` and `_includes/navheader.html`, change
   `{%- else if link.section -%}` → `{%- elsif link.section -%}`; verify anchor output on home
   vs. sub-pages.
3. **F4** Fix Standard Bank URL in `_data/sitetext.yml`.
4. **F5** Remove `target="_blank"` from the footer social URL string in `_data/sitetext.yml`.
5. **F6** Correct calculator card titles/links mapping in `_data/sitetext.yml`.
6. **F7** Replace Lorem ipsum `contact.text`; fix the conflicting `section: team` value if used.

Validation: `npm run bundle` + `jekyll serve`; click every nav item, every calculator card,
every client logo; submit the contact form (confirm Formspree delivery); check footer links.

### Phase B — SEO / privacy / accessibility
7. **F10** Decide canonical host; align `_config.yml` `url` with `CNAME`; ensure host redirect.
8. **F8** Remove the duplicate hard-coded GA block in `_includes/head.html` (keep templated one).
9. **F9** Move Facebook Pixel/Chat IDs into `_config.yml`; gate all trackers behind cookie
   consent if POPIA/GDPR required; update `legal.md` to disclose Facebook cookies.
10. **F11** Add `rel="noopener noreferrer"` to all `target="_blank"` anchors.
11. **F12** Add meaningful `alt` text to team images and logos.

Validation: run Lighthouse (SEO/Best-Practices/Accessibility); verify a single GA hit in the
Network tab; verify canonical tag matches the served host; verify consent gating.

### Phase C — Content & data cleanup
12. **F3** Resolve branch links: build pages, repoint, or remove `branches` data.
13. **F15** Remove unused theme leftovers (`_portfolio/*`, unused includes, sample `_posts/*`
    incl. the `... copy.md` files) after confirming none are referenced.
14. **F17** Fix invalid `margin=300px` in `_includes/clients.html`; move inline colors to SCSS.

### Phase D — Tooling, metadata, dependencies (lowest urgency)
15. **F14** Update `package.json` name/description/author; rewrite `README.md` with local
    build/serve steps.
16. **F13** Decide build strategy: (a) GitHub Actions runs `npm ci && npm run bundle` + Jekyll
    build, then gitignore `assets/bundle.*`; or (b) keep committing the bundle with a documented
    "run `npm run bundle` before commit" rule. Do not gitignore the bundle until CI builds it.
17. **F18** DRY refactor: one parametrized card include for services/calculators; one nav with a
    param instead of `nav.html`/`navheader.html`.
18. **F16** Plan dependency upgrades (webpack 5, bootstrap 5 or maintained 4.x, jQuery/popper
    review) as a separate, well-tested change.

---

## 5. Suggested commit slicing

- Commit 1: Phase A correctness (contact form, `elsif`, data link fixes).
- Commit 2: Phase B SEO/analytics/a11y.
- Commit 3: Phase C content/data cleanup.
- Commit 4+: Phase D tooling/metadata/deps (separate commit per concern).

Rebuild `assets/bundle.*` and include the rebuild in any commit touching `_assets/` until the
CI decision (step 16) is made.

---

## 6. Files referenced

- `_includes/contact.html` (F1)
- `_includes/nav.html`, `_includes/navheader.html` (F2, F12)
- `_data/sitetext.yml` (F3, F4, F5, F6, F7)
- `_includes/head.html` (F8, F10)
- `_layouts/default.html` (F9)
- `legal.md` (F9)
- `_includes/team.html`, `_includes/footer.html` (F11, F12)
- `_config.yml`, `CNAME` (F10)
- `assets/bundle.js`, `assets/bundle.css` (F13)
- `package.json`, `README.md` (F14)
- `_portfolio/*`, `_posts/*`, `_includes/portfolio_grid.html`, `modals.html`, `timeline.html` (F15)
- `_includes/clients.html`, `_includes/services.html`, `_includes/calculators.html` (F17, F18)

---

## 7. Implementation status (2026-07-17)

Implemented in code:

- **F2** ✅ — `else if` → `elsif` in both nav includes.
- **F3** ✅ — Removed dead `header.branches` data.
- **F4** ✅ — Standard Bank URL fixed (`standardbank.co.za`).
- **F5** ✅ — Footer social URL `target="_blank"` token removed.
- **F6** ✅ — Calculator card titles/links corrected (Affordability → affordability-calculator, Bond Repayment → bond-calculator, Costs → transfer-costs-calculator).
- **F7** ✅ — `contact.text` placeholder replaced; `section` changed `team` → `contact`.
- **F8** ✅ — Duplicate hard-coded GA block removed from `head.html` (one templated block remains).
- **F9** ✅ — Facebook Pixel + Customer Chat IDs moved to `_config.yml` (`facebook.*`) and gated behind `facebook.enabled`; `legal.md` now discloses Facebook cookies.
- **F10** ✅ — `_config.yml` `url` changed to apex to match `CNAME`.
- **F11** ✅ — `rel="noopener noreferrer"` added to `target="_blank"` anchors (team, footer).
- **F12** ✅ — Meaningful `alt` text on team photos and logo images.
- **F14** ✅ — `package.json` metadata updated; `README.md` rewritten with build/serve steps.
- **F17** ✅ — Invalid `margin=300px` (and `h-  100`) fixed in `clients.html`.
- **Footer rebuild (2026-07-18)** ✅ — Rebuilt `_includes/footer.html`, `_assets/layout/_footer.scss`, and `footer:` data in `_data/sitetext.yml` to the provided "Reusable Jekyll Footer" spec:
  - Two-level layout: `.footer-main` (brand + data-driven `.footer-navigation` columns) and `.footer-bottom` (copyright, legal, credits).
  - Content fully data-driven in YAML (`sections`, `social`, `credits`, `description`, `privacy_*`, `copyright_prefix`); no hardcoded links.
  - Internal links use `relative_url`; external/tel/mailto links bypass it and get `target="_blank" rel="noopener"`. Social + credits are external-only.
  - Removed the `fixPageShort()` script that forced `position: fixed` (violated spec; footer now stays in normal flow).
  - Mobile-first CSS Grid responsive behaviour (2→3 columns; brand left / nav right on desktop) using existing tokens (`$primary`, `$gray-*`, `$white`, `heading-font`).
  - Rebuilt `assets/bundle.css` via `npm run bundle` (used `NODE_OPTIONS=--openssl-legacy-provider` for webpack 4 + Node 17+).
  - Left `ul.social-buttons` styling in place so the team section icons are unaffected.

Action-required / deferred (needs owner decision or external resource):

- **F1** ⚠️ — Contact form now uses `https://formspree.io/f/{{ site.formspree.form_id }}` (config-driven). `site.formspree.form_id` is **empty** in `_config.yml` — the form will NOT deliver until a real Formspree form ID is added. Obtain a form ID from formspree.io and set it.
- **F9 (consent)** ⚠️ — Trackers are gated by `facebook.enabled`, but there is still **no cookie-consent banner**. Under POPIA/GDPR a consent gate is recommended. Add a banner that sets `facebook.enabled`/GA only after consent, or disable trackers until then.
- **F13** ⚠️ — Build artifacts (`assets/bundle.*`) remain committed & currently drifted in the working tree (modified before this work, not rebuilt here). Decide CI strategy. Note: GitHub Pages' default build does NOT run webpack.
- **F15** ⏸ — Dead theme leftovers (`_portfolio/*`, `timeline.html`, `portfolio_grid.html`, `modals.html`, sample `_posts/*` incl. `... copy.md`) left in place; physical deletion was blocked by the sandbox (`rm` not permitted). Safe to delete after confirming nothing references them.
- **F16** ⏸ — Dependency upgrades (webpack 4 → 5, bootstrap 4 → 5) deferred; larger, separate change.
- **F18** ⏸ — DRY refactor of duplicated includes deferred; low urgency, no behavior change.

Validation notes: No Ruby/Jekyll/Node toolchain present in this environment, so the site was **not** built/served here. Verify locally with `npm install && npm run bundle && npm run serve` and check: every nav item, every calculator card, client logos, contact-form submission (after setting Formspree id), and a single GA hit in the Network tab.

