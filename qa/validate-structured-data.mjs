#!/usr/bin/env node
/* eslint-env node */
// Renders live pages in headless Chrome (so client-side-injected JSON-LD is
// actually present, same as what Google's tools see) and checks the output
// against scripts/utils/jsonld.js's own required-field rules — the exact code
// that ships to production, not a reimplementation of it.
//
// Usage:
//   npm run qa:structured-data
//   npm run qa:structured-data -- https://main--da-elsie--samircaus.aem.page/blog/some-post

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Launcher } from 'chrome-launcher';
import puppeteer from 'puppeteer-core';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(rootDir, '..', 'package.json'), 'utf-8'));

async function resolveDefaultTargets() {
  const { origin } = new URL(pkg.homepage);
  const targets = [{ label: 'homepage', url: pkg.homepage }];

  try {
    const res = await fetch(`${origin}/blog/query-index.json`);
    if (res.ok) {
      const { data } = await res.json();
      const first = data?.[0];
      if (first?.path) targets.push({ label: 'blog post', url: new URL(first.path, origin).href });
    }
  } catch {
    // no blog index reachable; homepage check still runs
  }

  return targets;
}

async function validateUrl(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    return await page.evaluate(async () => {
      // Resolved by the live page's own origin, not by Node.
      // eslint-disable-next-line import/no-absolute-path
      const mod = await import('/scripts/utils/jsonld.js');
      const scriptTag = document.querySelector('script[type="application/ld+json"][data-generated]');
      if (!scriptTag) return { found: false };

      let schema;
      try {
        schema = JSON.parse(scriptTag.textContent);
      } catch (err) {
        return { found: true, parseError: err.message };
      }

      let issues;
      if (schema['@type'] === 'Article') issues = mod.getArticleSchemaIssues(schema);
      else if (schema['@type'] === 'WebSite') issues = mod.getWebSiteSchemaIssues(schema);
      else issues = [`unrecognized @type: ${schema['@type']}`];

      return { found: true, schema, issues };
    });
  } finally {
    await page.close();
  }
}

async function main() {
  const cliTargets = process.argv.slice(2).map((url) => ({ label: url, url }));
  const targets = cliTargets.length ? cliTargets : await resolveDefaultTargets();

  const executablePath = Launcher.getInstallations()[0];
  if (!executablePath) {
    console.error('No local Chrome installation found. Set CHROME_PATH or install Chrome.');
    process.exitCode = 1;
    return;
  }

  const browser = await puppeteer.launch({ executablePath, headless: true });
  let hasFailure = false;

  try {
    for (const { label, url } of targets) {
      console.log(`\n--- ${label}: ${url} ---`);
      const result = await validateUrl(browser, url).catch((err) => ({ loadError: err }));

      if (result.loadError) {
        hasFailure = true;
        console.error(`FAIL  ${result.loadError.message}`);
      } else if (!result.found) {
        hasFailure = true;
        console.error('FAIL  no <script type="application/ld+json" data-generated> found on page');
      } else if (result.parseError) {
        hasFailure = true;
        console.error(`FAIL  injected JSON-LD is not valid JSON: ${result.parseError}`);
      } else if (result.issues.length) {
        hasFailure = true;
        console.error(`FAIL  ${result.schema['@type']} schema has issues:`);
        result.issues.forEach((issue) => console.error(`      - ${issue}`));
      } else {
        console.log(`PASS  ${result.schema['@type']} schema has all required properties`);
      }

      console.log('Confirm rich-result eligibility and full Schema.org compliance manually:');
      console.log(`  https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`);
      console.log(`  https://validator.schema.org/#url=${encodeURIComponent(url)}`);
    }
  } finally {
    await browser.close();
  }

  if (hasFailure) {
    console.error('\nStructured data QA failed.');
    process.exitCode = 1;
  } else {
    console.log('\nStructured data QA passed.');
  }
}

main();
