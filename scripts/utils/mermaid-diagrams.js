const MERMAID_PATH = '/deps/mermaid/dist/mermaid.esm.min.mjs';
const FONT_FAMILY = 'montserrat, "Trebuchet MS", sans-serif';

// Rounds node blocks and edge labels, and bolds edge label text; colors come from THEME_VARIABLES.
const THEME_CSS = `
  .node rect, .node polygon, .node circle, .node ellipse { rx: 8px; ry: 8px; }
  .edgeLabel .label rect { rx: 4px; ry: 4px; }
  .edgeLabel, .edgeLabel p { font-weight: 600; font-size: 12px; }
`;

// Mirrors the site's brand palette (styles/styles.css --color-brand/--color-accent/--color-beige).
const THEME_VARIABLES = {
  default: {
    fontFamily: FONT_FAMILY,
    primaryColor: '#fefdfb',
    primaryTextColor: '#2a2420',
    primaryBorderColor: '#c1423f',
    lineColor: '#6c757d',
    secondaryColor: '#f5e6d3',
    tertiaryColor: '#fde8e6',
    mainBkg: '#fefdfb',
    textColor: '#2a2420',
    edgeLabelBackground: '#f9f6f0',
    clusterBkg: '#f5e6d3',
    clusterBorder: '#d4ba94',
    titleColor: '#2a2420',
    nodeBorder: '#c1423f',
    background: 'transparent',
  },
  dark: {
    fontFamily: FONT_FAMILY,
    primaryColor: '#495057',
    primaryTextColor: '#f5e6d3',
    primaryBorderColor: '#e8685c',
    lineColor: '#adb5bd',
    secondaryColor: '#2a2420',
    tertiaryColor: '#6f2320',
    mainBkg: '#495057',
    textColor: '#f5e6d3',
    edgeLabelBackground: '#343a40',
    clusterBkg: '#2a2420',
    clusterBorder: '#6f2320',
    titleColor: '#f5e6d3',
    nodeBorder: '#e8685c',
    background: 'transparent',
  },
};

/**
 * A code block is treated as a Mermaid diagram when its first line is the
 * word "mermaid" (optionally fenced with backticks, e.g. pasted from a
 * markdown ```mermaid block).
 */
export function isMermaidSource(raw) {
  const firstLine = (raw || '').split('\n', 1)[0].trim().replace(/`/g, '');
  return firstLine.toLowerCase() === 'mermaid';
}

/** Strips the "mermaid" marker line (and a stray trailing ``` fence) from the raw code text. */
export function extractMermaidSource(raw) {
  const lines = (raw || '').replace(/\r\n/g, '\n').split('\n');
  lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  if (lines.length && /^`{3,}$/.test(lines[lines.length - 1].trim())) lines.pop();
  return lines.join('\n').trim();
}

function currentTheme() {
  const { body } = document;
  if (body.classList.contains('dark-scheme')) return 'dark';
  if (body.classList.contains('light-scheme')) return 'default';
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default';
}

let mermaidPromise;
function loadMermaid() {
  if (!mermaidPromise) mermaidPromise = import(MERMAID_PATH).then((mod) => mod.default);
  return mermaidPromise;
}

let renderId = 0;
async function renderEntry(mermaid, entry) {
  const { container, source } = entry;
  renderId += 1;
  try {
    const { svg, bindFunctions } = await mermaid.render(`mermaid-diagram-${renderId}`, source);
    container.classList.remove('mermaid-diagram-error');
    container.innerHTML = svg;
    bindFunctions?.(container);
  } catch {
    container.classList.add('mermaid-diagram-error');
    container.textContent = 'Unable to render this diagram.';
  }
}

// Diagrams rendered so far, kept around so they can be re-themed after a scheme change.
const rendered = [];

async function renderAll(entries) {
  const mermaid = await loadMermaid();
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    look: 'neo',
    themeVariables: THEME_VARIABLES[currentTheme()],
    themeCSS: THEME_CSS,
  });
  await Promise.all(entries.map((entry) => renderEntry(mermaid, entry)));
}

export default async function renderMermaidDiagrams(entries) {
  if (!entries.length) return;
  rendered.push(...entries);
  await renderAll(entries);
}

document.addEventListener('ak:scheme-change', () => {
  if (rendered.length) renderAll(rendered);
});
