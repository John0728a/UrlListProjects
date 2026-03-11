import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

interface OgData {
  title: string;
  description: string;
  image: string;
}

// Try Firebase function first, then fall back to client-side proxy
export async function fetchOgData(url: string): Promise<OgData> {
  const empty: OgData = { title: '', description: '', image: '' };

  // Attempt 1: Firebase Cloud Function
  try {
    const fetchOg = httpsCallable<{ url: string }, OgData>(functions, 'fetchOgData');
    const result = await fetchOg({ url });
    if (result.data.title || result.data.description || result.data.image) {
      return result.data;
    }
  } catch {
    // Cloud Function not deployed or unavailable — fall through to proxy
  }

  // Attempt 2: Client-side via allorigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return empty;

    const html = await response.text();
    return parseOgFromHtml(html, url);
  } catch {
    // Proxy failed too
  }

  // Attempt 3: Extract domain name as title fallback
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return { title: hostname, description: '', image: '' };
  } catch {
    return empty;
  }
}

function parseOgFromHtml(html: string, baseUrl: string): OgData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const ogTitle =
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.querySelector('title')?.textContent ||
    '';

  const ogDescription =
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    '';

  let ogImage =
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

  // Resolve relative URLs
  if (ogImage && !ogImage.startsWith('http')) {
    try {
      ogImage = new URL(ogImage, baseUrl).href;
    } catch {
      ogImage = '';
    }
  }

  return {
    title: ogTitle.substring(0, 300),
    description: ogDescription.substring(0, 500),
    image: ogImage.substring(0, 2000),
  };
}
