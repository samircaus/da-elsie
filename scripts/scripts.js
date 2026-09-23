import { loadArea, setConfig } from './ak.js';
import injectPageJsonLd from './utils/jsonld.js';
import { isMermaidSource, extractMermaidSource } from './utils/mermaid-diagrams.js';

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
  const diagrams = [];

  pres.forEach((pre) => {
    const codeEl = pre.querySelector('code');
    const raw = codeEl ? codeEl.textContent : pre.textContent;

    if (isMermaidSource(raw)) {
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-diagram-wrapper';
      const container = document.createElement('div');
      container.className = 'mermaid-diagram';
      wrapper.append(container);
      pre.parentNode.insertBefore(wrapper, pre);
      pre.remove();
      diagrams.push({ container, source: extractMermaidSource(raw) });
      return;
    }

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

  if (diagrams.length) {
    import('./utils/mermaid-diagrams.js').then(({ default: renderMermaidDiagrams }) => {
      renderMermaidDiagrams(diagrams);
    });
  }
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

function decorateArticleNavigation(articles) {
  const headings = articles.flatMap((article) => [...article.querySelectorAll('h2')]);
  if (!headings.length) return;

  const navigation = document.createElement('nav');
  navigation.className = 'on-this-page';
  navigation.setAttribute('aria-label', 'On this page');
  const title = document.createElement('strong');
  title.textContent = 'On this page';
  navigation.append(title);

  const list = document.createElement('ul');
  for (const heading of headings) {
    if (!heading.id) {
      heading.id = heading.textContent.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.append(link);
    list.append(item);
  }
  navigation.append(list);
  articles[0].querySelector('h1, h2, h3')?.after(navigation);
}

(async function loadPage() {
  setConfig({ hostnames, locales, widgets, components, decorateArea, afterSectionsDecorate });
  injectPageJsonLd();
  const articlePath = /^\/(architecture|labs|martech|personalization|tools)\/[^/]+\/?$/;
  const isArticlePage = articlePath.test(window.location.pathname);
  if (isArticlePage) {
    document.body.classList.add('article-page');
  }
  await loadArea();
  if (!isArticlePage) return;
  const articles = [...document.querySelectorAll('main .section > .default-content')]
    .filter((content) => !content.querySelector('.hero')
      && content.querySelector('h1, h2, h3'));
  if (articles.length) {
    const article = articles[0];
    const articleSection = article.closest('.section');
    const previousSection = articleSection?.previousElementSibling;
    if (previousSection?.querySelector('.hero')) {
      article.querySelector(':scope > h1')?.remove();
    }
    for (const articleSectionContent of articles) {
      articleSectionContent.classList.add('article-content');
    }
    decorateArticleNavigation(articles);
  }
}());

(() => {
  const hasQE = new URL(window.location.href).searchParams.has('quick-edit');
  // eslint-disable-next-line import/no-cycle
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
})();
