# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SEO consulting website (anthonyrusso.fr) built with Astro 6 in SSR mode with WordPress headless CMS for blog content. All blog pages render server-side in real-time while evergreen content pages are prerendered.

**Stack:**
- Astro 6 (SSR mode with @astrojs/node standalone adapter)
- WordPress REST API (headless CMS at wp.anthonyrusso.fr)
- PM2 process manager
- Node.js 22+
- No frontend framework (vanilla TypeScript/JavaScript for interactivity)

## Commands

```bash
# Development
npm install                # Install dependencies
npm run dev               # Start dev server (http://localhost:4321)
npm run build             # Build for production
npm run preview           # Preview production build locally

# Deployment (production server)
./deploy.sh               # Automated deployment via script
pm2 restart anthonyrusso  # Restart app after manual deployment
pm2 logs anthonyrusso     # View production logs
```

## Architecture

### Rendering Strategy

**SSR (Server-Side Rendered):**
- `/` - Homepage (fetches latest 3 blog posts from WordPress)
- `/blog` - Blog index (paginated posts from WordPress)
- `/blog/[slug]` - Individual blog posts (WordPress content)
- `/[...path]` - Catch-all route for WordPress permalinks with category structure

**Prerendered (Static at build time):**
- All pages under `/netlinking-sur-mesure/` (evergreen SEO content)
- All pages under `/audit-netlinking/` (evergreen audit content)
- `/mon-reseau`, `/resultats`, `/mentions-legales`
- `/404` (game page)

**Important:** Pages are prerendered by adding `export const prerender = true;` in the frontmatter. Without this, pages default to SSR mode.

### WordPress Integration

WordPress acts as headless CMS via REST API. Integration is in `src/lib/wordpress.ts`:

- `getPosts(page, perPage, category)` - Paginated post list with embedded media
- `getPost(slug)` - Single post by slug
- `getPostByPath(path)` - Match full WordPress permalink path (handles category structure)
- `getCategories()` - All categories
- Posts include `_embed` parameter to get featured images and categories in single request

**API URL:** Configured in `.env` as `WORDPRESS_API_URL=https://wp.anthonyrusso.fr/wp-json/wp/v2`

**Content processing:** WordPress HTML is sanitized in `src/lib/html.ts` before rendering.

### Page Layouts

Three layout hierarchy:

1. **BaseLayout** (`src/layouts/BaseLayout.astro`) - Root layout with `<head>`, SEO, theme toggle, navigation
2. **PageLayout** (`src/layouts/PageLayout.astro`) - Extends BaseLayout, adds CalendlyWidget sidebar
3. **BlogPostLayout** (`src/layouts/BlogPostLayout.astro`) - Extends BaseLayout, blog-specific structure

Layouts use `<slot />` for content and `<slot name="head" />` for page-specific `<head>` elements (JSON-LD schemas, canonical URLs).

### Interactive Components Pattern

Client-side interactivity uses vanilla JavaScript in `<script>` tags within `.astro` files:

- **404 Game** (`src/pages/404.astro`) - Canvas-based catching game with localStorage leaderboard
- **API endpoint** (`src/pages/api/scores.ts`) - Rate-limited score submission with JSON file storage
- **Interactive checklists** (A1, E8 pages) - Vanilla JS for checkboxes, conditional CTAs
- **Link Gap table** (A2 page) - Editable table with CSV export, no frameworks needed

**Pattern:** Keep interactivity scoped to individual pages. Use `<script>` tags with TypeScript for type safety. Avoid global state.

### Navigation Structure

Navigation in `src/components/Nav.astro` supports dropdown submenus:

```typescript
const navItems = [
  {
    name: 'Menu Name',
    href: '/path',
    submenu: [
      { name: 'Submenu Item', href: '/path/item' }
    ]
  }
]
```

Dropdown behavior: hover on desktop (≥1024px), click/touch on mobile. Mobile menu displays submenus inline.

### Structured Data

Evergreen pages include JSON-LD schemas in `<Fragment slot="head">`:
- Article schema (headline, author, publisher)
- FAQPage schema (questions and answers)
- BreadcrumbList schema (navigation hierarchy)

**Pattern:** Define schemas in frontmatter as objects, stringify in `<script type="application/ld+json">`.

## Development Patterns

### Creating New Evergreen Pages

1. Create `.astro` file in appropriate directory (`/netlinking-sur-mesure/` or `/audit-netlinking/`)
2. Import BaseLayout, define metadata in frontmatter
3. Add `export const prerender = true;` for static generation
4. Add JSON-LD schemas in `<Fragment slot="head">`
5. Update `src/components/Nav.astro` to add page to navigation submenu
6. Build to verify page appears in prerendered routes list

### Adding Blog Content

WordPress admin handles all blog content. No code changes needed. Blog posts appear immediately on site (SSR - no rebuild required).

### Styling Conventions

- CSS custom properties in `src/styles/global.css` (colors, spacing, typography)
- Component-scoped styles in `<style>` blocks
- Dark mode via `[data-theme="dark"]` selector (theme toggle in Nav component)
- Mobile-first responsive design (breakpoints: 640px, 768px, 1024px)

## Deployment

### Production Environment

- **Server:** cPanel shared hosting with SSH access
- **Path:** `/home/anth543/anthonyrusso-fr/`
- **Process Manager:** PM2 running `dist/server/entry.mjs`
- **Port:** 3006 (configured in .env: `PORT=3006`, `HOST=0.0.0.0`)
- **Proxy:** Apache reverse proxy (HTTP and HTTPS) to Node.js on `[::1]:3006`

### Deployment Workflow

**Via GitHub (recommended):**
1. Commit changes locally: `git add . && git commit -m "message" && git push`
2. SSH to server: `cd /home/anth543/anthonyrusso-fr && git pull origin main`
3. Build: `npm run build`
4. Restart: `npx pm2 restart anthonyrusso`

**Via deploy.sh script:**
- Builds locally, creates tar.gz, uploads via SCP, extracts and restarts PM2 on server

### Build Output

Astro SSR build creates:
- `dist/server/entry.mjs` - Node.js server entry point (PM2 runs this)
- `dist/client/` - Static assets (CSS, JS, images, prerendered HTML)

**Critical:** PM2 must run `dist/server/entry.mjs`, not `astro preview`. The standalone adapter creates a production-ready Node.js server.

## File Structure

```
src/
├── components/         # Reusable Astro components (Nav, Footer, CalendlyWidget)
├── layouts/           # Page layouts (BaseLayout, PageLayout, BlogPostLayout)
├── lib/               # Utilities (wordpress.ts, html.ts)
├── pages/             # Routes (file-based routing)
│   ├── api/          # API endpoints (scores.ts)
│   ├── blog/         # Blog routes ([slug].astro for SSR)
│   ├── audit-netlinking/        # Audit evergreen pages
│   ├── netlinking-sur-mesure/   # Netlinking evergreen pages
│   ├── index.astro   # Homepage (SSR)
│   ├── 404.astro     # 404 game page
│   └── [...path].astro  # WordPress permalink catch-all
└── styles/            # Global CSS

data/                  # JSON data storage (scores.json for game)
```

## Critical Configuration

### Environment Variables (.env)

```bash
WORDPRESS_API_URL=https://wp.anthonyrusso.fr/wp-json/wp/v2
HOST=0.0.0.0
PORT=3006
```

**Important:**
- `HOST=0.0.0.0` allows external connections (required for Apache proxy)
- WordPress API URL must end with `/wp/v2` (REST API base)

### Apache Proxy Configuration

Production uses Apache reverse proxy on both HTTP and HTTPS:
- **Standard:** `/etc/apache2/conf.d/userdata/std/2_4/anth543/anthonyrusso.fr/proxy.conf`
- **SSL:** `/etc/apache2/conf.d/userdata/ssl/2_4/anth543/anthonyrusso.fr/proxy.conf`

Both must use IPv6 address `[::1]:3006` because Node.js binds to IPv6 by default.

After changes: `/scripts/ensure_vhost_includes && /scripts/rebuildhttpdconf && /scripts/restartsrv_httpd`

### PM2 Process

Start: `pm2 start dist/server/entry.mjs --name anthonyrusso`
Save: `pm2 save` (persist across reboots)
Logs: `pm2 logs anthonyrusso`

PM2 auto-restarts on crashes. For env var changes, delete and recreate process (pm2 restart doesn't reload env).

## Common Issues

**403 on WordPress API:** Check CORS headers on wp.anthonyrusso.fr or API accessibility.

**503 on production:** Apache proxy misconfigured or PM2 not running. Check `pm2 status` and Apache error logs.

**Prerendered pages not updating:** Must rebuild (`npm run build`) and restart PM2 for static content changes.

**Blog posts not appearing:** SSR pages render on each request - check WordPress API accessibility from server. Test: `curl https://wp.anthonyrusso.fr/wp-json/wp/v2/posts?per_page=1`

**Game scores not saving:** Check `data/scores.json` exists and is writable. API endpoint has rate limiting (5 requests/minute per IP).
