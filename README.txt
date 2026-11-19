Najah Madani — Portfolio (optimized update)
===========================================

Deployment:
- Upload the entire contents of this 'portfolio' folder to Netlify or Vercel as a static site.
- No Node.js backend, framework build, database, or environment variables are required.
- Entry page: index.html. The Show More / Show Less Projects button expands the full project list on this same page. (more-projects.html remains for backwards compatibility with old links.)

Updates included:
- Updated CV (cv/Najah_CV.pdf) with the newly provided PDF.
- Six featured projects initially visible on the homepage; seven more reveal inline (13 total).
- Added Barn's Coffee voice interface as project 11, with its own detail page.
- Sourced screenshots and project diagrams from the user-provided PDFs; images were exported as lightweight WebP files.
- Re-cropped and re-framed Jahez storyboard, Event Hub screens, Digital Menu UI, STC study evidence, Barn’s voice interaction diagram, and Hajj wireframes. Editorial framing is distinct from actual app screenshots; no fabricated screenshots.
- CareBot image comes from the supplied screenshot.
- Ehsan/Tabaru image is a clearly labeled editorial cover; no source screenshot or report for it was supplied.
- Images have explicit paths, reserved dimensions and lazy loading. No runtime image-extension probes.
- Show More Projects below featured cards toggles all seven additional project cards inline, switching to Show Less Projects when expanded. No navigation to another page.
- Hero View Projects scrolls to the Projects section; fixed navigation offset accounted for.
- Removed orphaned Loading Portfolio HTML text that was visibly stuck at the top of the previous revision.
- English/Arabic switch on every page, preserved across navigation using browser localStorage.
- Removed the artificial initial loading screen, made external fonts non-blocking and simplified mobile animation work.
- LinkedIn points to linkedin.com/in/najah-madani-389909407.

Optimization note:
Only the new CV and optimized web assets are included, not the large source PDF reports; original project reports are not needed to view or deploy the site.

Third-party resources: Font Awesome, Google Fonts and desktop GSAP animations use public CDNs. If visitors block these CDNs, the core portfolio content and navigation remain visible.
