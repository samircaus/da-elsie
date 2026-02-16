import { loadArea, setConfig } from './ak.js';

const hostnames = ['authorkit.dev'];

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

// Widget patterns to look for
const widgets = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dimCodeComments(container) {
  const codeEl = container.querySelector('code') || container;
  const raw = codeEl.textContent || '';
  const lines = raw.split(/\n/);
  let processed = lines
    .map((line) => {
      let escaped = escapeHtml(line);
      // Only dim // when not part of :// (e.g. URLs like https://...)
      escaped = escaped.replace(/(\s*)(?<!:)(\/\/.*)$/, '$1<span class="code-comment">$2</span>');
      return escaped;
    })
    .join('\n');
  // Dim HTML comments <!-- ... --> (single or multi-line)
  processed = processed.replace(/&lt;!--[\s\S]*?--&gt;/g, '<span class="code-comment">$&</span>');
  codeEl.innerHTML = processed;
}

function decorateCodeBlocks(parent) {
  const pres = parent.querySelectorAll('pre');
  pres.forEach((pre) => {
    dimCodeComments(pre);

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.append(pre);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'code-block-copy';
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.setAttribute('title', 'Copy code');
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16V4a2 2 0 0 1 2-2h10"/></svg>`;
    wrapper.prepend(copyBtn);

    copyBtn.addEventListener('click', async () => {
      const text = pre.querySelector('code') ? pre.querySelector('code').innerText : pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 1500);
      } catch {
        // no-op
      }
    });
  });
}

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};

// Run after sections are grouped so code-block-wrapper stays inside default-content (not treated as a block)
const afterSectionsDecorate = ({ area }) => decorateCodeBlocks(area);

(async function loadPage() {
  setConfig({ hostnames, locales, widgets, components, decorateArea, afterSectionsDecorate });
  await loadArea();
}());
