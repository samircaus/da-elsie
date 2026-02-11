export default function init(el) {
  const inner = el.querySelector(':scope > div');
  inner.classList.add('card-inner');
  const pic = el.querySelector('picture');
  if (pic) {
    const picPara = pic.closest('p');
    if (picPara) {
      const picDiv = document.createElement('div');
      picDiv.className = 'card-picture-container';
      picDiv.append(pic);
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
