# TwinStone Constructions — PRD

## Original Problem Statement
Ultra-premium 3D luxury construction company website for TwinStone Constructions ("Building With Purpose. Built To Last."). Awwwards-level cinematic architectural experience: kinetic hero with masked line-by-line reveal, WebGL 3D (hybrid: desktop WebGL + mobile/reduced-motion fallback), editorial marquee, numbered manifesto chapters, framer-motion reveals, lenis smooth scroll. Mandatory palette: charcoal #171A1C, graphite #252A2D, warm white #F7F5F0, stone #E9E4DA, copper #B77A45 (accent only). Fonts: Manrope headings, Inter body, Cormorant Garamond editorial serif. 14 pages incl. secure admin login + dashboard (JWT + TOTP MFA), Emergent object storage for uploads, sample placeholder projects (admin replaces), GA4 via env var later.

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis + three/@react-three/fiber/drei (lazy-loaded) + react-helmet-async + @tanstack/react-query. `/app/frontend/src`
- Backend: FastAPI, modular: config.py, security.py (bcrypt+JWT+lockout+rate limit+audit), storage.py (Emergent object storage), seed.py, routes_auth.py, routes_public.py, routes_admin.py, server.py (security headers, exception shield, indexes, startup seed)
- DB: MongoDB via MONGO_URL/DB_NAME env. Collections: admin_users, projects, media, brochures, settings, inquiries, audit_logs, login_attempts, rate_limits
- Media: Emergent object storage, served via GET /api/files/{path} with DB lookup + cache headers

## User Personas
- Prospective client (browses projects, downloads brochure, requests consultation)
- Site administrator (manages projects/media/brochures/settings, MFA-protected)
- Search engine/crawler (sitemap.xml, robots.txt, canonical + OG meta, Organization JSON-LD)

## Core Requirements (static)
Public: Home (3D hero, marquee, manifesto, featured, services, ongoing, completed, process, why, brochure CTA, contact CTA), About, Services, Ongoing/Completed Projects (filters), Project Detail (gallery+lightbox, video, 360°, GLB 3D viewer, specs, brochure), Process, Download, Contact (rate-limited form), Privacy/Terms/Cookies, 404. Admin: login (bcrypt+JWT, lockout, rate limit, optional TOTP MFA with QR setup), projects CRUD w/ media manager, media library, brochures, inquiries, settings (company/hero/SEO/branding uploads), audit log. Security headers (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy), dynamic sitemap.xml + robots.txt, upload validation (ext+magic bytes+size), noindex on admin.

## Implemented (2026-07)
- Full public site, all 14 routes, hybrid WebGL hero (device/GPU/reduced-motion detection, static parallax fallback)
- Admin auth: JWT + bcrypt + lockout + rate limits + TOTP MFA (setup QR, verify) + audit logging
- Admin dashboard: 6 modules (projects, media, brochures, inquiries, settings, audit)
- Object storage uploads with validation; seeded 6 sample projects + 2 PDF brochures (generated, stored)
- GA4 hooks via REACT_APP_GA_ID (not set yet); dynamic sitemap/robots; SEO component per page
- Image optimizer: Pillow pipeline auto-generates AVIF + WebP derivatives (480/960/1600w) on every image/pano upload; served via /api/files/{path}?w=&fmt= with fallback to original; frontend <picture> srcset via ResponsiveImage across cards, featured, gallery, hero covers, brochure thumbs, admin thumbs (2.1MB JPEG → 33KB at 480w WebP)
- 360° + 3D showcase live: equirectangular pano (4096×2048, CC BY-SA Diliff demo, Christ Church Cathedral) on The Meridian Residence with drag-look sphere viewer; trimesh-generated GLB massing model (9KB, vertex-colored) on The Copperhouse with OrbitControls rotate/zoom + fullscreen + camera reset (Draco-compressed GLBs decode by default)
- Video showcase live: 37s aerial drone footage (Pexels demo) on Northgate Exchange — transcoded VP9 WebM 1280w (26MB MP4 → 8.4MB), poster frame auto-extracted; /api/files supports HTTP Range (206) streaming so MP4/WebM play natively in browsers
- 3D upload QC: GLB uploads >15MB return an optimization_hint (gltf-transform draco command) surfaced as an admin toast
- Auto video transcode: every video upload is synchronously converted to web-optimized WebM (VP9, 1280w) + poster frame via bundled ffmpeg (imageio-ffmpeg, run in threadpool); project player prefers webm_path + poster; failed transcodes fall back to original with admin hint (26MB MP4 → 8.4MB WebM in ~17s)
- Hero Video Mode: admin Settings → Homepage Hero → mode select (3D Monolith Scene / Cinematic Video Background) + hero video upload; homepage plays the film muted/looping behind the kinetic headline, honoring prefers-reduced-motion (static fallback); enabled live with the drone footage demo
- Brochure Project Link: project editor has brochure PDF upload (attach/replace/remove); project pages auto-render a "Download Project Brochure" CTA when brochure_path set; live on The Meridian Residence (serves 200 application/pdf, GA4 brochure_download event)
- Before-After Slider: interactive renovation comparison — admin picks Before/After images + caption in project editor (image-filtered media picker); public page renders full-width draggable divider with clip-path, pointer + touch + keyboard (Arrow keys, role=slider, aria-valuenow); live on Stonebridge Pavilion with demo imagery
- Multiple Comparisons: projects support unlimited before/after pairs (comparisons list, add/remove/reorder captions in editor); Stonebridge Pavilion demos 2 room-by-room sliders; legacy single before_after migrated to comparisons
- Multi-Panorama 360: projects support multiple 360° scenes with a scene switcher; Villa Serena has a second true-equirect demo pano (Newman University Church, CC BY-SA Diliff); Meridian retains cathedral demo pano — all replaceable via admin
- Comparison Reveal: before/after sliders auto-sweep once (50% → 76% → 50%) when scrolled into view via framer-motion animate + useInView; skipped for prefers-reduced-motion and cancelled if the user has already interacted
- MFA flow verified end-to-end via API (setup QR → enable with real TOTP → login demands code → wrong code 401 → correct code 200 → /me 200); account reverted to password-only so the owner pairs their own authenticator (Dashboard → Settings → Set Up Authenticator)
- Admin password rotation: POST /api/auth/change-password (verifies current, min 12 chars, 5 attempts/15min rate limit, audit-logged, rejects same-as-current); Settings → Change Password card; seed no longer reverts rotated passwords on restart (ADMIN_PASSWORD env = initial seed only)
- Launch checklist sweep (2026-08): all public + admin endpoints 200, ghost project 404, contact validation 422, all storage files stream (206 range), zero broken images, zero horizontal overflow desktop+mobile, About leadership imagery re-curated (removed off-brand stock), 404/legal/services pages confirmed
- HEAD support on /api/files (GET+HEAD via api_route): monitors/crawlers get 200 + content-type + content-length without body transfer; brochure files default to application/pdf; verified HEAD/GET/range across GLB, WebM, JPG, derivatives, PDF, and 404 for missing paths
- Real contact details (client-provided 2026-08): phones +91 96421 85000 / +91 96421 75000, email twinstoneconstructions@gmail.com, WhatsApp 919642185000; consultation form budget ranges switched to INR (₹50L/₹2Cr/₹10Cr), project types match site categories; floating WhatsApp chat button (wa.me link, GA4 whatsapp_click event) site-wide; footer social icons render when URLs set in Settings; address/hours still PLACEHOLDER ("Stonegate Business District", Mon–Sat 8–18) pending client input
- Brand identity (2026-08, CLIENT-PROVIDED): client uploaded final emblem-only gold TS logo (473×538, dark textured bg) and instructed "upload as is" — stored unchanged in object storage and set as logo_dark + logo_light + favicon; favicon.png rebuilt by padding to square (no distortion); tagline switched to client's logo tagline: "Building Excellence. Creating Landmarks." (hero lines, footer editorial, mobile menu, SEO defaults). Socials live: instagram.com/twinstoneconstructions + facebook profile 61593435220979 (footer icons; LinkedIn empty)
- Mobile polish pass (390×844): verified zero horizontal overflow on Home, project detail, Contact, Download, admin login; mobile drawer menu, hero with video background + wrapping service line (item-safe flex-wrap), specs grid, comparison sliders, brochure cards, contact form all confirmed clean; menu tagline tracking tightened for small screens
- Verified: login (401 on bad creds), dashboard, projects table, lightbox nav, contact submit, brochure PDF serve (200), upload (201), bad ext rejected (400), unauthorized 401, sitemap/robots, derivative serving (webp/avif/200s), pano drag, model rotate

## Backlog
- P0: Enable MFA for admin (Settings → MFA); set REACT_APP_GA_ID for analytics; client uploads REAL TwinStone photography/video/3D via admin (pipeline proven; sample media remains until replaced)
- P1: Draco/Meshopt compression guidance for large GLB uploads; video poster images; breadcrumb JSON-LD; attribution note for demo pano removable when real pano uploaded
- P2: Passkeys/WebAuthn; admin IP allowlist; login email alerts; automated backups + restore drill docs; CSP for frontend HTML; GTM container; staging/prod separation

## Next Tasks
1. Admin enables TOTP MFA via dashboard
2. Client uploads real project media through admin dashboard (replaces samples; optimizer auto-generates AVIF/WebP)
3. Provide GA4 Measurement ID → set env, validate events (brochure_download, contact_submit tracked)
4. Submit sitemap.xml to Google Search Console after go-live
