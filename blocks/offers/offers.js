/**
 * EDS offers block
 *
 * Surface name = second class on the block (first class is "offers"). No config table.
 * Example: <div class="offers offers-below-hero"><div><div></div></div></div>
 * Listens for "aep:personalization" and delegates to the surface-specific renderer.
 */

import { getConfig, loadStyle } from '../../scripts/ak.js';

const { log } = getConfig();

/** Resolve renderer CSS URL (same origin as this script). */
function getRendererCssUrl(surfaceName) {
  return new URL(`./renderers/${surfaceName}.css`, import.meta.url).href;
}

/** Map surface name to renderer module path (dynamic import). */
const RENDERERS = {
  'offers-below-hero': () => import('./renderers/offers-below-hero.js'),
};

/** Surface name is the first class after "offers" (and "block" if present). */
function getSurfaceNameFromBlock(block) {
  return [...block.classList].find(
    (cls) => cls !== 'offers' && cls !== 'block'
  ) || null;
}

function getDecisionsForSurface(detail, surface) {
  const { decisions = [], propositions = [] } = detail || {};
  const surfaceDecisions = decisions.filter((d) => d.scope === surface);
  if (surfaceDecisions.length) return surfaceDecisions;
  return propositions.filter((p) => p.scope === surface);
}

function mapDecisionItemsToOffers(surfaceDecision) {
  const items = surfaceDecision.items || [];
  return items.map((item) => {
    const data = item.data || item;
    return {
      id: data.id || item.id,
      title: data.title || data.name || '',
      description: data.description || '',
      imageUrl: data.imageUrl || data.image || '',
      ctaText: data.ctaText || data.ctaLabel || '',
      ctaUrl: data.ctaUrl || data.url || '#',
    };
  });
}

/**
 * Main decorate. Loads surface-specific renderer, reserves height immediately, then listens for personalization.
 */
export default async function decorate(block) {
  const parent = block.parentElement;
  if (parent?.classList?.contains('block-content')) {
    parent.classList.remove('block-content');
    parent.classList.add('default-content');
  }

  const surfaceName = getSurfaceNameFromBlock(block);
  if (!surfaceName) {
    log('offers: no surface class (expected e.g. class="offers offers-below-hero")');
    return;
  }
  log(`offers: surface =  ${surfaceName}`);

  const loadRenderer = RENDERERS[surfaceName];
  if (!loadRenderer) {
    log(`offers: no renderer for surface "${surfaceName}"`);
    return;
  }

  let renderer;
  try {
    await loadStyle(getRendererCssUrl(surfaceName));
    const mod = await loadRenderer();
    renderer = mod;
  } catch (e) {
    log(`offers: failed to load renderer for "${surfaceName}"`);
    return;
  }

  block.innerHTML = '';
  if (renderer.reserveHeight) {
    renderer.reserveHeight(block);
  }
  block.classList.add('offers--ready');

  const base = 'web://edgepatterns.dev';
  const path = window.location.pathname;
  const surfaceUri = `${base}${path}#${surfaceName}`;

  const onPersonalization = (event) => {
    log(`offers: onPersonalization - ${JSON.stringify(event)}`);
    const surfaceDecisions = getDecisionsForSurface(event.detail, surfaceUri);
    if (!surfaceDecisions.length) return;

    const offers = mapDecisionItemsToOffers(surfaceDecisions[0]);
    if (!offers.length) return;

    log(`offers block: received ${offers.length} offers, rendering (${surfaceName})`);
    renderer.render(block, offers, {});
  };

  window.addEventListener('aep:personalization', onPersonalization, { once: true });
}
