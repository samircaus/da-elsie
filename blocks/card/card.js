import { createPicture } from '../../scripts/utils/picture.js';

// Cards never render wider than ~1 grid column, so the platform's default
// 750/2000px breakpoints are far larger than the thumbnail is ever displayed at.
const CARD_BREAKPOINTS = [
  { media: '(min-width: 1200px)', width: '450' },
  { media: '(min-width: 900px)', width: '600' },
  { width: '900' },
];

export default function init(el) {
  const inner = el.querySelector(':scope > div');
  inner.classList.add('card-inner');
  const pic = el.querySelector('picture');
  if (pic) {
    const picPara = pic.closest('p');
    if (picPara) {
      const img = pic.querySelector('img');
      const picture = img
        ? createPicture({ src: img.src, alt: img.alt, breakpoints: CARD_BREAKPOINTS, optimize: 'high' })
        : pic;
      const picDiv = document.createElement('div');
      picDiv.className = 'card-picture-container';
      picDiv.append(picture);
      inner.insertAdjacentElement('afterbegin', picDiv);
      picPara.remove();
    }
  }
  // Decorate content
  const con = inner.querySelector(':scope > div:not([class])');
  if (!con) return;
  con.classList.add('card-content-container');

  // Find link in content and make whole card clickable (link is not displayed)
  const cta = inner.querySelector('a');
  if (!cta) return;
  let href = cta.getAttribute('href');
  if (!href) return;
  const hashAware = el.classList.contains('hash-aware');
  if (hashAware) {
    href = `${href}${window.location.hash}`;
  }
  // Remove the paragraph that contains the link so it is not rendered
  const ctaPara = cta.closest('p');
  if (ctaPara) ctaPara.remove();

  // Wrap entire card inner in the link
  const link = document.createElement('a');
  link.href = href;
  link.classList.add('card-link');
  inner.parentNode.insertBefore(link, inner);
  link.appendChild(inner);
}
