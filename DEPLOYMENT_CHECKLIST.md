# Deployment checklist

1. Install Node.js on the hosting server.
2. Upload the site files including server.js, package.json, robots.txt, sitemap.xml, and the static assets.
3. Run `npm install` (no external dependencies required for this minimal server).
4. Start the server with `npm start` or configure a process manager such as PM2.
5. Ensure port 3000 or the configured port is open and reachable.
6. Enable HTTPS with a valid SSL certificate.
7. Configure your reverse proxy (for example Nginx or Caddy) to forward requests to the Node server.
8. Add security headers at the proxy layer if you want stronger protection than the browser meta tags.
9. Test the homepage, sitemap, robots file, and form submission endpoint.
10. Monitor logs and set up backups for the site content.
