/**
 * Callout block: highlights a message with optional type and title.
 *
 * Structure (from sheet/document):
 * - Row 0, Cell 0: type (note | tip | warning | info) – optional, defaults to "note"
 * - Row 0, Cell 1: optional title
 * - Row 1+: body content (paragraphs, lists, etc.)
 *
 * If only one row: entire row content is body (no type/title).
 */

const TYPES = ['note', 'tip', 'warning', 'info'];

function normalizeType(value) {
  if (!value || typeof value !== 'string') return 'note';
  const v = value.trim().toLowerCase();
  return TYPES.includes(v) ? v : 'note';
}

function getTextContent(cell) {
  return (cell && cell.textContent && cell.textContent.trim()) || '';
}

export default function init(block) {
  const rows = [...block.querySelectorAll(':scope > div')].filter((row) => row.children.length > 0);
  if (!rows.length) return;

  const firstRow = rows[0];
  const cells = [...firstRow.children];
  const firstCellText = getTextContent(cells[0]);

  let type = 'note';
  let title = '';
  let bodyRows = [];

  if (rows.length === 1) {
    bodyRows = [firstRow];
  } else {
    const looksLikeType = TYPES.includes(firstCellText.toLowerCase());
    if (looksLikeType && cells.length >= 1) {
      type = normalizeType(firstCellText);
      if (cells.length >= 2) title = getTextContent(cells[1]);
      bodyRows = rows.slice(1);
    } else {
      bodyRows = rows;
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'callout__inner';

  if (title) {
    const header = document.createElement('div');
    header.className = 'callout__header';
    const titleEl = document.createElement('div');
    titleEl.className = 'callout__title';
    titleEl.textContent = title;
    header.appendChild(titleEl);
    wrapper.appendChild(header);
  }

  const body = document.createElement('div');
  body.className = 'callout__body';
  for (const row of bodyRows) {
    const rowWrap = document.createElement('div');
    rowWrap.className = 'callout__row';
    while (row.firstChild) rowWrap.appendChild(row.firstChild);
    body.appendChild(rowWrap);
  }
  wrapper.appendChild(body);

  /* Promote first heading in body to callout title */
  const firstHeading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (firstHeading && !title) {
    title = firstHeading.textContent.trim();
    if (title) {
      const header = document.createElement('div');
      header.className = 'callout__header';
      const titleEl = document.createElement('div');
      titleEl.className = 'callout__title';
      titleEl.textContent = title;
      header.appendChild(titleEl);
      wrapper.insertBefore(header, body);
      firstHeading.remove();
    }
  }

  block.innerHTML = '';
  block.classList.add('callout', `callout--${type}`);
  block.appendChild(wrapper);
}
