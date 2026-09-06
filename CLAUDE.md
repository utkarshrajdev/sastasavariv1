# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static local-business marketing site for SastaSavari (bike rentals/services in Motihari, Bettiah, Sheohar, East & West Champaran, Bihar). Plain HTML/CSS/vanilla JS — no framework, no build system, no bundler. Each page is self-contained with inline `<style>`/`<script>`. Only external dependency is Google Fonts via CDN `<link>`.

## Linting

`npm run lint` (or `lint:js` / `lint:css` separately) lints the inline `<script>`/`<style>` blocks in `index.html` and `get-price.html` via ESLint (`eslint-plugin-html`) and Stylelint (`postcss-html`, `stylelint-config-recommended`). Run `npm install` once first. The Stylelint config intentionally uses `recommended`, not `standard` — this codebase's CSS is hand-authored with single-line declarations, legacy color notation, etc., so only correctness rules (duplicate selectors, descending specificity) are enabled, not stylistic ones.

Two pages:
- `index.html` — main landing page, indexed (`content="index, follow"`).
- `get-price.html` — ad-landing page, deliberately `noindex` (not in `sitemap.xml`).

## Deployment

GitHub Pages, driven by the `CNAME` file (`www.sastasavari.com`). Pushing to `main` deploys directly — there is no CI. Canonical domain is `https://www.sastasavari.com` (with `www`) — keep `<link rel="canonical">`, `og:url`, `sitemap.xml`, and `robots.txt` consistent with this if touching URLs.

## Git workflow

Use feature branches and let the user review before merging to `main` — do not commit directly to `main`.

## Lead-capture architecture

There is no application server. The flow is:
1. Form JS builds a client-side `SS-XXXXXX` reference code (excludes ambiguous chars `0/O/1/I`) so it can be shown immediately, before the no-cors fetch response (which is unreadable) returns.
2. Form does a no-cors POST to the Google Apps Script Web App at `SHEETS_URL` (hardcoded identically in both `index.html` and `get-price.html`).
3. `apps-script/Code.gs` appends the row to the "Leads" Google Sheet and emails `NOTIFY_EMAIL` from `FROM_EMAIL`.
4. Client-side JS separately opens a pre-filled `wa.me/{WHATSAPP_NUMBER}` deep link so the customer can message the business directly. There is intentionally no email field on the customer-facing form — confirmation is via WhatsApp, not email.

`apps-script/Code.gs` in this repo is **not auto-deployed**. Committing/pushing changes to it does nothing to the live script — it must be manually pasted into the Apps Script editor and redeployed (Deploy > Manage deployments > Edit > New version > Deploy). The Web App URL stays stable across redeploys.

## Duplicated config — keep in sync

There's no templating, so these values are hardcoded in multiple places and must be changed together:
- `SHEETS_URL` — identical in `index.html` and `get-price.html`.
- `WHATSAPP_NUMBER` (`919523619389`) — same two files.
- Contact info (`+91 89865 87089`, `sastasavari@gmail.com`) — repeated in markup across both pages.
- `NOTIFY_EMAIL` / `FROM_EMAIL` / `FROM_NAME` — top of `apps-script/Code.gs`, and the `genRefCode()` reference-code generator is duplicated there as a fallback for cached pages (must match the client-side version).
- Place-name SEO copy ("Motihari", "Bettiah", "Sheohar", "East & West Champaran") — repeated dozens of times across both HTML files' titles, meta tags, `geo.placename`, and body copy (including Hindi keyphrases). Keep new copy consistent with existing branding.

Promotional copy (e.g. "₹1,100 launch offer") is time-sensitive marketing content — expect it to need manual removal/updates after the offer period ends.
