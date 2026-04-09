/**
 * Décode les entités HTML (WordPress les encode)
 */
export function decodeHtml(html: string): string {
  const entities: Record<string, string> = {
    '&rsquo;': '\u2019',
    '&lsquo;': '\u2018',
    '&quot;': '"',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&agrave;': '\u00E0',
    '&aacute;': '\u00E1',
    '&eacute;': '\u00E9',
    '&egrave;': '\u00E8',
    '&ecirc;': '\u00EA',
    '&icirc;': '\u00EE',
    '&ocirc;': '\u00F4',
    '&ugrave;': '\u00F9',
    '&ucirc;': '\u00FB',
    '&ccedil;': '\u00E7',
    '&amp;': '&',
    '&#8217;': '\u2019',
    '&#8216;': '\u2018',
    '&#8220;': '\u201C',
    '&#8221;': '\u201D',
  };
  
  let decoded = html;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  return decoded;
}
