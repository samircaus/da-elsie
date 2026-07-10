import { expect } from '@esm-bundle/chai';
import {
  buildArticleSchema,
  buildWebSiteSchema,
  isHomePage,
  parsePublicationDate,
  toAbsoluteUrl,
} from '../../scripts/utils/jsonld.js';

describe('JSON-LD utilities', () => {
  describe('parsePublicationDate', () => {
    it('parses MM-DD-YYYY dates', () => {
      expect(parsePublicationDate('07-10-2026')).to.equal('2026-07-10');
    });

    it('parses ISO dates', () => {
      expect(parsePublicationDate('2026-07-10')).to.equal('2026-07-10');
    });

    it('returns undefined for empty values', () => {
      expect(parsePublicationDate()).to.be.undefined;
    });
  });

  describe('toAbsoluteUrl', () => {
    it('resolves relative URLs against the current origin', () => {
      expect(toAbsoluteUrl('/blog/image.jpg')).to.equal(`${window.location.origin}/blog/image.jpg`);
    });

    it('returns absolute URLs unchanged', () => {
      expect(toAbsoluteUrl('https://example.com/image.jpg')).to.equal('https://example.com/image.jpg');
    });
  });

  describe('isHomePage', () => {
    const locales = {
      '': { lang: 'en' },
      '/de': { lang: 'de' },
    };

    it('detects the root homepage', () => {
      expect(isHomePage('/', locales)).to.be.true;
      expect(isHomePage('/blog/post', locales)).to.be.false;
    });

    it('detects localized homepages', () => {
      expect(isHomePage('/de', locales)).to.be.true;
      expect(isHomePage('/de/', locales)).to.be.true;
      expect(isHomePage('/de/blog/post', locales)).to.be.false;
    });
  });

  describe('buildArticleSchema', () => {
    it('builds article schema from metadata', () => {
      const schema = buildArticleSchema({
        title: 'Sample Post',
        description: 'A short summary',
        author: 'Samir',
        datePublished: '2026-07-10',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/blog/sample-post',
        tags: ['aem', 'eds'],
      });

      expect(schema['@type']).to.equal('Article');
      expect(schema.headline).to.equal('Sample Post');
      expect(schema.author.name).to.equal('Samir');
      expect(schema.image).to.deep.equal(['https://example.com/image.jpg']);
      expect(schema.keywords).to.equal('aem, eds');
    });

    it('returns null without a title', () => {
      expect(buildArticleSchema({ url: 'https://example.com' })).to.be.null;
    });
  });

  describe('buildWebSiteSchema', () => {
    it('builds website schema from metadata', () => {
      const schema = buildWebSiteSchema({
        name: 'DA Elsie',
        url: 'https://example.com',
        description: 'Personal site',
        logo: 'https://example.com/logo.png',
      });

      expect(schema['@type']).to.equal('WebSite');
      expect(schema.name).to.equal('DA Elsie');
      expect(schema.publisher.logo).to.equal('https://example.com/logo.png');
    });

    it('returns null without required fields', () => {
      expect(buildWebSiteSchema({ name: 'DA Elsie' })).to.be.null;
    });
  });
});
