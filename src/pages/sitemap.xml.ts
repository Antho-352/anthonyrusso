import type { APIRoute } from 'astro';
import { getPosts } from '../lib/wordpress';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://anthonyrusso.fr';

  // Static pages (prerendered)
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/blog/', changefreq: 'daily', priority: 0.9 },
    { url: '/audit-netlinking/', changefreq: 'monthly', priority: 0.8 },
    { url: '/audit-netlinking/lire-profil-backlinks/', changefreq: 'monthly', priority: 0.7 },
    { url: '/audit-netlinking/analyser-concurrents/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/', changefreq: 'monthly', priority: 0.8 },
    { url: '/netlinking-sur-mesure/pagerank/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/backlink/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/texte-ancre/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/trust-flow-citation-flow/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/dofollow-nofollow/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/domain-rating-domain-authority/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/evaluer-un-spot/', changefreq: 'monthly', priority: 0.7 },
    { url: '/netlinking-sur-mesure/erreurs-netlinking/', changefreq: 'monthly', priority: 0.7 },
    { url: '/mon-reseau/', changefreq: 'monthly', priority: 0.6 },
    { url: '/resultats/', changefreq: 'monthly', priority: 0.6 },
    { url: '/mentions-legales/', changefreq: 'yearly', priority: 0.3 },
  ];

  // Fetch all blog posts from WordPress
  let blogPosts: Array<{ url: string; lastmod: string }> = [];

  try {
    // Fetch all posts (increase per_page if you have more than 100 posts)
    const { posts } = await getPosts(1, 100);

    blogPosts = posts.map(post => ({
      url: `/blog/${post.slug}/`,
      lastmod: new Date(post.date).toISOString().split('T')[0], // YYYY-MM-DD format
    }));
  } catch (error) {
    console.error('Error fetching WordPress posts for sitemap:', error);
    // Continue with static pages only if WordPress fetch fails
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${blogPosts.map(post => `  <url>
    <loc>${baseUrl}${post.url}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
