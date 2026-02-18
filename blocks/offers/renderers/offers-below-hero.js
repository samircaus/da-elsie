/**
 * Surface renderer for surface=offers-below-hero.
 * Renders 3 images with links (image is the link). Reserves height upfront to avoid layout shift.
 *
 * Expected JSO (event.detail / decisions): see offers-below-hero.jso.example.json
 * Each item should have at least:
 *   - imageUrl (or image): image src
 *   - ctaUrl (or url): link href
 * Optional: title (alt text / caption), ctaText, description
 */

/**
 * Call as soon as the block is decorated to reserve space.
 * Block already has class "offers-below-hero" from authoring; CSS uses that for layout.
 * @param {HTMLElement} block
 */
export function reserveHeight(block) {
  /* no-op: block already has .offers-below-hero for scoped styles */
}

/**
 * Render offers as 3 images with links (each image wraps in <a>).
 * @param {HTMLElement} block
 * @param {Array} offers - { imageUrl, ctaUrl, title?, ctaText? }
 * @param {Object} config
 */
export function render(block, offers, config) {
  const title = config.title || '';
  const maxItemsStr = config['max-items'];
  const maxItems = Math.min(parseInt(maxItemsStr || '3', 10) || 3, offers.length);
  const slicedOffers = offers.slice(0, maxItems);

  const wrapper = document.createElement('div');
  wrapper.className = 'offers-list offers-list--below-hero';

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'offers-title';
    heading.textContent = title;
    wrapper.appendChild(heading);
  }

  const list = document.createElement('div');
  list.className = 'offers-cards';

  slicedOffers.forEach((offer) => {
    const card = document.createElement('article');
    card.className = 'offers-card';

    const href = offer.ctaUrl || '#';
    const link = document.createElement('a');
    link.className = 'offers-card-link';
    link.href = href;

    if (offer.imageUrl) {
      const img = document.createElement('img');
      img.className = 'offers-card-image';
      img.src = offer.imageUrl;
      img.alt = offer.title || '';
      link.appendChild(img);
    }

    if (offer.title) {
      const span = document.createElement('span');
      span.className = 'offers-card-title';
      span.textContent = offer.title;
      link.appendChild(span);
    }

    card.appendChild(link);
    list.appendChild(card);
  });

  wrapper.appendChild(list);
  block.innerHTML = '';
  block.appendChild(wrapper);
}
