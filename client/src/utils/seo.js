import { SITE_URL } from '../config';

/**
 * Universal SEO manager: dynamically updates meta tags, canonical link, and JSON-LD structured data.
 */
export function updateSEO({
  title,
  description,
  path = window.location.pathname,
  image = '/logos/pln.svg'
}) {
  const fullTitle = title
    ? `${title} | TJSL Local Heroes PLN ES`
    : 'Penilaian TJSL Local Heroes PLN ES | PT PLN Electricity Services';

  const defaultDesc =
    'Sistem Terpadu Pendaftaran dan Penilaian Juri TJSL Local Heroes PT PLN Electricity Services untuk penggerak individu pegawai dan TAD.';
  const fullDesc = description || defaultDesc;

  // 1. Title
  document.title = fullTitle;

  // 2. Canonical URL
  const canonicalUrl = `${SITE_URL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // Helper for meta tags
  const setMeta = (selector, attr, val, content) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, val);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Meta Description & Robots
  setMeta('meta[name="description"]', 'name', 'description', fullDesc);
  setMeta('meta[name="robots"]', 'name', 'robots', 'index, follow');

  // 4. Open Graph (OG)
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', fullDesc);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'TJSL Local Heroes PLN ES');
  setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'id_ID');

  const fullImageUrl = image.startsWith('http')
    ? image
    : `${SITE_URL.replace(/\/+$/, '')}${image.startsWith('/') ? image : `/${image}`}`;
  setMeta('meta[property="og:image"]', 'property', 'og:image', fullImageUrl);

  // 5. Twitter Card
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', fullDesc);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', fullImageUrl);

  // 6. JSON-LD Structured Data
  let scriptEl = document.querySelector('script[type="application/ld+json"]#seo-schema');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.setAttribute('type', 'application/ld+json');
    scriptEl.setAttribute('id', 'seo-schema');
    document.head.appendChild(scriptEl);
  }

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: fullTitle,
    description: fullDesc,
    url: canonicalUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    creator: {
      '@type': 'Organization',
      name: 'PT PLN Electricity Services',
      url: SITE_URL
    }
  };

  scriptEl.textContent = JSON.stringify(schemaData);
}
