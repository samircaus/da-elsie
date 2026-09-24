import observe from '../../scripts/utils/observer.js';

export function getYouTubeVideoId(url) {
  const host = url.hostname.replace(/^www\./, '');
  const segments = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') return segments[0] || null;
  if (!host.endsWith('youtube.com') && host !== 'youtube-nocookie.com') return null;

  if (url.pathname === '/watch') return url.searchParams.get('v');

  const videoPathPrefixes = ['embed', 'shorts', 'live'];
  if (videoPathPrefixes.includes(segments[0])) return segments[1] || null;

  return null;
}

function getYouTubeUrl(el) {
  if (el.href) return new URL(el.href, window.location.href);

  const link = el.querySelector?.('a[href]');
  if (link) return new URL(link.href, window.location.href);

  const text = el.textContent?.trim();
  if (!text) return null;

  try {
    return new URL(text, window.location.href);
  } catch {
    return null;
  }
}

function getEmbedSrc(el) {
  const url = getYouTubeUrl(el);
  if (!url) return null;

  const id = getYouTubeVideoId(url);
  if (!id) return null;

  const params = new URLSearchParams(url.search);
  params.delete('v');
  params.set('rel', '0');

  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
}

function decorate(el) {
  const iframe = document.createElement('iframe');
  iframe.src = el.dataset.src;
  iframe.className = 'youtube';
  iframe.title = el.dataset.title || 'YouTube video';
  iframe.allow = 'encrypted-media; accelerometer; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('webkitallowfullscreen', '');
  iframe.setAttribute('mozallowfullscreen', '');
  el.replaceChildren(iframe);
}

export default function init(a) {
  const src = getEmbedSrc(a);
  if (!src) return;

  const div = document.createElement('div');
  div.className = 'video';
  div.dataset.src = src;
  div.dataset.title = a.title || a.textContent.trim() || 'YouTube video';
  if (a.classList.contains('auto-block')) {
    a.parentElement.replaceChild(div, a);
  } else {
    a.replaceChildren(div);
  }
  observe(div, decorate);
}
