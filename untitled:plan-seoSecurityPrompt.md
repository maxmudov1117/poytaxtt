## Plan: SEO and security hardening

TL;DR: The site has already been improved across three areas: SEO basics, security hardening, and a more reliable form submission path. The remaining work is mainly deployment and production hardening.

### Phase 1 — SEO foundation
Status: Completed
1. Added unique title and meta description tags to the main pages: [index.html](index.html), [about.html](about.html), [service.html](service.html), [news.html](news.html), and [contact.html](contact.html).
2. Added social metadata (Open Graph and Twitter tags) and canonical URLs to the shared head markup.
3. Added a sitemap and robots file for search engines.
4. Improved page structure with clearer heading hierarchy and descriptive alt text for key images.
5. Improved the main navigation paths to the service, news, and contact sections.

### Phase 2 — Security hardening
Status: Completed for the current static-site scope
1. Added basic browser-side protections such as CSP, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
2. Hardened the form handling by validating and sanitizing input, and by avoiding false success states on network errors.
3. Made external links safer by adding rel attributes for links that open in a new tab.
4. Added a lightweight server-side endpoint for safer production form handling via [server.js](server.js).

### Phase 3 — Quality and verification
Status: Mostly completed; deployment remains
1. Checked the main pages and verified the updated markup, metadata, and form behavior in the browser.
2. Verified the form-related logic with automated tests in [tests/booking-datetime.test.js](tests/booking-datetime.test.js).
3. Verified the local server and form endpoint respond correctly.
4. Remaining production items: real hosting deployment, HTTPS, reverse-proxy headers, and monitoring.

### Relevant files
- [index.html](index.html)
- [about.html](about.html)
- [service.html](service.html)
- [news.html](news.html)
- [contact.html](contact.html)
- [css/style.css](css/style.css)
- [js/i18n.js](js/i18n.js)
- [server.js](server.js)
- [package.json](package.json)
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

### Verification
1. Confirmed the main pages expose the expected meta tags.
2. Confirmed the site serves a robots file and sitemap.
3. Confirmed the forms validate input and show the correct success/error behavior.
4. Confirmed the local server serves the homepage and the form endpoint responds successfully.

### Scope note
- The static-site hardening work is now implemented. The remaining work is deployment-level hardening: real hosting, HTTPS, proxy headers, and true backend integration if stronger server-side processing is needed.