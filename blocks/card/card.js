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

  // Find a dedicated CTA paragraph (one containing nothing but a link) and make the
  // whole card clickable. Inline links inside body copy must be left alone.
  const ctaPara = [...inner.querySelectorAll('p')].find((p) => {
    const a = p.querySelector(':scope > a');
    return a && [...p.childNodes].every((node) => node === a || !node.textContent.trim());
  });
  if (!ctaPara) return;
  const cta = ctaPara.querySelector(':scope > a');
  let href = cta.getAttribute('href');
  if (!href) return;
  const hashAware = el.classList.contains('hash-aware');
  if (hashAware) {
    href = `${href}${window.location.hash}`;
  }
  // Remove the paragraph that contains the link so it is not rendered
  ctaPara.remove();

  // Wrap entire card inner in the link
  const link = document.createElement('a');
  link.href = href;
  link.classList.add('card-link');
  inner.parentNode.insertBefore(link, inner);
  link.appendChild(inner);
}
