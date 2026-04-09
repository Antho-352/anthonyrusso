/**
 * WordPress REST API helpers
 * Pour le blog headless sur wp.anthonyrusso.fr
 */

const WP_API = import.meta.env.WORDPRESS_API_URL || 'https://wp.anthonyrusso.fr/wp-json/wp/v2';

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface PostsResponse {
  posts: WPPost[];
  total: number;
  totalPages: number;
}

/**
 * Récupérer la liste des articles (avec pagination)
 */
export async function getPosts(
  page = 1,
  perPage = 9,
  category?: number
): Promise<PostsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    _embed: '1', // inclut featured_media et author
    ...(category ? { categories: category.toString() } : {}),
  });

  const res = await fetch(`${WP_API}/posts?${params}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }

  const posts: WPPost[] = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '0');

  return { posts, total, totalPages };
}

/**
 * Récupérer un article par slug
 */
export async function getPost(slug: string): Promise<WPPost | null> {
  const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=1`);

  if (!res.ok) {
    return null;
  }

  const posts: WPPost[] = await res.json();
  return posts.length > 0 ? posts[0] : null;
}

/**
 * Récupérer un article par son chemin complet (ex: "seo/mon-article")
 * Utilise le champ 'link' de WordPress pour matcher le permalink complet
 */
export async function getPostByPath(path: string): Promise<WPPost | null> {
  // Récupérer tous les articles (limité à 100 pour les performances)
  // Dans un cas réel, on pourrait paginer ou utiliser un endpoint custom
  const res = await fetch(`${WP_API}/posts?per_page=100&_embed=1`);

  if (!res.ok) {
    return null;
  }

  const posts: WPPost[] = await res.json();

  // Chercher l'article dont le 'link' contient le chemin
  // Le 'link' WordPress contient l'URL complète (ex: https://wp.anthonyrusso.fr/seo/mon-article/)
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;

  for (const post of posts) {
    // Extraire le chemin depuis l'URL complète
    const url = new URL(post.link);
    const postPath = url.pathname.replace(/^\//, '').replace(/\/$/, '');
    const requestPath = normalizedPath.replace(/^\//, '').replace(/\/$/, '');

    if (postPath === requestPath) {
      return post;
    }
  }

  return null;
}

/**
 * Récupérer toutes les catégories
 */
export async function getCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API}/categories?per_page=50`);

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Récupérer tous les slugs (pour getStaticPaths)
 */
export async function getAllSlugs(): Promise<Array<{ slug: string }>> {
  const res = await fetch(`${WP_API}/posts?per_page=100&_fields=slug`);

  if (!res.ok) {
    throw new Error(`Failed to fetch slugs: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Calculer le temps de lecture estimé (en minutes)
 */
export function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
  const wordCount = text.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extraire le chemin relatif depuis l'URL WordPress complète
 * Ex: https://wp.anthonyrusso.fr/seo/mon-article/ → /seo/mon-article
 */
export function getPostPath(post: WPPost): string {
  try {
    const url = new URL(post.link);
    // Retourner le pathname sans le slash final
    return url.pathname.replace(/\/$/, '');
  } catch {
    // Fallback au slug si l'URL est invalide
    return `/${post.slug}`;
  }
}
