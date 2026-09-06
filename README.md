# SastaSavari

Static marketing site for **SastaSavari** — two-wheeler showroom deals, price comparison, and
bike services in Motihari, Bettiah, Sheohar and the East & West Champaran districts of Bihar.

Live at **https://www.sastasavari.com**.

## Stack

Plain HTML, CSS and vanilla JS. No framework, no bundler, no build step. Each page is
self-contained, with its `<style>` and `<script>` inline. The only external runtime dependency
is Google Fonts, loaded via a CDN `<link>`.

## Pages

| File | Purpose | Indexing |
| --- | --- | --- |
| `index.html` | Main landing page | `index, follow` — listed in `sitemap.xml` |
| `get-price.html` | Paid-ad landing page | `noindex` — deliberately kept out of `sitemap.xml` |

Supporting files: `favicon.ico`, `logo.svg`, `og-image.png`, `robots.txt`, `sitemap.xml`,
`CNAME`.

## Local development

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

There is nothing to compile.

## Linting

Lint the inline `<script>` / `<style>` blocks in `index.html` and `get-price.html`:

```sh
npm install        # once
npm run lint       # ESLint + Stylelint
npm run lint:js    # ESLint only  (eslint-plugin-html)
npm run lint:css   # Stylelint only (postcss-html)
```

Stylelint intentionally extends `stylelint-config-recommended`, not `-standard`: the CSS here is
hand-authored with single-line declarations and legacy color notation, so only correctness rules
(duplicate selectors, descending specificity) are enforced — not stylistic ones.

## Lead-capture flow

There is no application server. When a visitor submits the enquiry form:

1. The form JS builds a client-side reference code (`SS-XXXXXX`, ambiguous characters
   `0/O/1/I` excluded) so it can be shown to the visitor immediately — before the opaque
   `no-cors` response returns.
2. The form does a `no-cors` POST to a Google Apps Script Web App (`SHEETS_URL`, hardcoded
   identically in both HTML files).
3. `apps-script/Code.gs` appends the row to the "Leads" Google Sheet and emails
   `NOTIFY_EMAIL` from `FROM_EMAIL`.
4. Separately, the client opens a pre-filled `wa.me/<number>` deep link so the customer can
   message the business on WhatsApp. There is intentionally **no email field** on the
   customer-facing form — confirmation happens over WhatsApp, not email.

### `apps-script/Code.gs` is not auto-deployed

Committing changes to `apps-script/Code.gs` does nothing to the live script. To deploy it,
paste the file into the Apps Script editor attached to the Sheet, then
**Deploy → Manage deployments → Edit → New version → Deploy**. The Web App URL stays stable
across redeploys. See the header comment in `Code.gs` for the sender-address / "Send mail as"
alias requirements, and run `testEmail()` from the editor to verify.

## Duplicated config — keep in sync

There is no templating, so these values live in more than one place and must be changed
together:

- `SHEETS_URL` — identical in `index.html` and `get-price.html`.
- `WHATSAPP_NUMBER` (`919523619389`) — same two files.
- Contact info (`+91 89865 87089`, `sastasavari@gmail.com`) — repeated in markup across both
  pages.
- `NOTIFY_EMAIL` / `FROM_EMAIL` / `FROM_NAME` — top of `apps-script/Code.gs`. The
  `genRefCode()` generator is duplicated there as a fallback for cached pages and must match
  the client-side version.
- Place-name SEO copy ("Motihari", "Bettiah", "Sheohar", "East & West Champaran", plus Hindi
  keyphrases) — repeated across titles, meta tags, `geo.placename`, structured data and body
  copy in both files.

Promotional copy (e.g. a "₹1,100 launch offer") is time-sensitive and expected to need manual
removal once the offer ends.

## Deployment

GitHub Pages, driven by the `CNAME` file (`www.sastasavari.com`). **Pushing to `main` deploys
directly — there is no CI.** The canonical domain is `https://www.sastasavari.com` (with
`www`); keep `<link rel="canonical">`, `og:url`, `sitemap.xml` and `robots.txt` consistent
with it when touching URLs.

## Contributing

Work on a feature branch and let the site owner review before merging. Do not commit directly
to `main`.
