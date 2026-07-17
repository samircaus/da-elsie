import { getConfig, getMetadata } from '../ak.js';

function getAllMetadata(name) {
  const attr = name.includes(':') ? 'property' : 'name';
  return [...document.head.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((meta) => meta.content)
    .filter(Boolean);
}

export function parsePublicationDate(dateStr) {
  if (!dateStr) return undefined;

  const usMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = Date.parse(dateStr);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }

  return dateStr;
}

export function toAbsoluteUrl(url) {
  if (!url) return undefined;
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return undefined;
  }
}

export function isHomePage(pathname, locales = { '': {} }) {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/') return true;
  return Object.keys(locales).some((prefix) => prefix && path === prefix);
}

export function buildArticleSchema({
  title,
  description,
  author,
  datePublished,
  image,
  url,
  tags = [],
}) {
  if (!title) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  if (description) schema.description = description;
  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author,
    };
  }
  if (datePublished) schema.datePublished = datePublished;
  if (image) schema.image = [image];
  if (tags.length) schema.keywords = tags.join(', ');

  return schema;
}

export function buildWebSiteSchema({
  name,
  url,
  description,
  logo,
}) {
  if (!name || !url) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    publisher: {
      '@type': 'Organization',
      name,
    },
  };

  if (description) schema.description = description;
  if (logo) schema.publisher.logo = logo;

  return schema;
}

// Required/recommended properties per Google's Article structured data guidelines:
// https://developers.google.com/search/docs/appearance/structured-data/article
export function getArticleSchemaIssues(schema) {
  const issues = [];
  if (!schema?.headline) issues.push('missing required property: headline');
  if (!Array.isArray(schema?.image) || !schema.image.length) issues.push('missing required property: image');
  if (!schema?.datePublished) issues.push('missing recommended property: datePublished');
  if (!schema?.author?.name) issues.push('missing recommended property: author');
  return issues;
}

// WebSite has no dedicated Google rich result on its own, so these only check
// Schema.org-required shape, not Rich Results eligibility.
export function getWebSiteSchemaIssues(schema) {
  const issues = [];
  if (!schema?.name) issues.push('missing required property: name');
  if (!schema?.url) issues.push('missing required property: url');
  if (!schema?.publisher?.name) issues.push('missing required property: publisher.name');
  return issues;
}

function injectJsonLd(data) {
  if (!data) return;
  if (document.querySelector('script[type="application/ld+json"][data-generated]')) return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.generated = 'true';
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

export default function injectPageJsonLd() {
  const pageUrl = window.location.href.split('#')[0];
  const template = getMetadata('template');

  if (template === 'blog') {
    const schema = buildArticleSchema({
      title: getMetadata('og:title') || document.title,
      description: getMetadata('description'),
      author: getMetadata('author'),
      datePublished: parsePublicationDate(getMetadata('publication-date')),
      image: toAbsoluteUrl(getMetadata('og:image')),
      url: pageUrl,
      tags: getAllMetadata('article:tag'),
    });
    injectJsonLd(schema);
    return;
  }

  const { locales } = getConfig();
  if (!isHomePage(window.location.pathname, locales)) return;

  const origin = window.location.origin;
  const siteName = getMetadata('og:site_name')
    || getMetadata('og:title')
    || document.title;

  const schema = buildWebSiteSchema({
    name: siteName,
    url: origin,
    description: getMetadata('description'),
    logo: toAbsoluteUrl(getMetadata('og:image')),
  });
  injectJsonLd(schema);
}
