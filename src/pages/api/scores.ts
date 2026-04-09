import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

const SCORES_FILE = path.join(process.cwd(), 'data', 'scores.json');
const MAX_SCORES = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

interface Score {
  username: string;
  score: number;
  date: string;
  ip?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// Read scores from file
async function readScores(): Promise<Score[]> {
  try {
    await fs.mkdir(path.dirname(SCORES_FILE), { recursive: true });
    const data = await fs.readFile(SCORES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

// Write scores to file
async function writeScores(scores: Score[]): Promise<void> {
  await fs.mkdir(path.dirname(SCORES_FILE), { recursive: true });
  await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf-8');
}

// Sanitize username
function sanitizeUsername(username: string): string {
  // Remove any character that's not alphanumeric, hyphen, or underscore
  return username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
}

// Validate score
function validateScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 99999;
}

// GET: Retrieve leaderboard
export const GET: APIRoute = async () => {
  try {
    const scores = await readScores();

    // Sort by score descending and take top 10
    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES)
      .map(({ username, score, date }) => ({ username, score, date })); // Remove IP

    return new Response(
      JSON.stringify({ scores: topScores }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error reading scores:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST: Submit new score
export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Get client IP
    const ip = clientAddress || 'unknown';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Trop de requêtes. Réessayez dans 1 minute.' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, score } = body;

    // Validate username
    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Pseudo requis' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const sanitizedUsername = sanitizeUsername(username);

    if (sanitizedUsername.length === 0 || sanitizedUsername.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Pseudo invalide (1-20 caractères, lettres/chiffres/-/_ uniquement)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate score
    if (!validateScore(score)) {
      return new Response(
        JSON.stringify({ error: 'Score invalide' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Read existing scores
    const scores = await readScores();

    // Add new score
    const newScore: Score = {
      username: sanitizedUsername,
      score,
      date: new Date().toISOString(),
      ip, // Store for duplicate detection, not shown publicly
    };

    scores.push(newScore);

    // Sort and keep only top scores
    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES * 2); // Keep more for IP duplicate detection

    // Write back to file
    await writeScores(topScores);

    return new Response(
      JSON.stringify({ success: true, score: newScore }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error saving score:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'enregistrement' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
