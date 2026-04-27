# Slade Technologies — static site scaffold

Static, multi-page marketing site (Home / Services / About / Contact).
No build step — open `index.html` in a browser, or serve with any static
file server (e.g. `python3 -m http.server`).

## Structure

- `index.html` — home
- `services.html` — services overview with anchored sections
- `about.html` — company, principles, stats
- `contact.html` — contact details and form (client-side stub)
- `assets/css/styles.css` — single shared stylesheet, design tokens at top
- `assets/js/main.js` — nav toggle, form handler, footer year

## Notes

The original `sladetechnologies.com` returned 403 to automated fetches when
this scaffold was generated, so the copy and visual design are original
placeholders rather than a 1:1 reproduction. Swap in real branding,
colors (in `:root`), copy, and imagery as needed.
