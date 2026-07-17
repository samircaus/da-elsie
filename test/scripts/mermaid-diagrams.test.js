import { expect } from '@esm-bundle/chai';
import { isMermaidSource, extractMermaidSource } from '../../scripts/utils/mermaid-diagrams.js';

describe('Mermaid diagram utilities', () => {
  describe('isMermaidSource', () => {
    it('matches a plain "mermaid" first line', () => {
      expect(isMermaidSource('mermaid\ngraph TD\n  A --> B')).to.be.true;
    });

    it('matches case-insensitively and ignores stray backticks', () => {
      expect(isMermaidSource('```Mermaid\ngraph TD\n  A --> B\n```')).to.be.true;
    });

    it('does not match ordinary code', () => {
      expect(isMermaidSource('const a = 1;\nconsole.log(a);')).to.be.false;
    });

    it('handles empty input', () => {
      expect(isMermaidSource('')).to.be.false;
    });
  });

  describe('extractMermaidSource', () => {
    it('strips the marker line', () => {
      expect(extractMermaidSource('mermaid\ngraph TD\n  A --> B')).to.equal('graph TD\n  A --> B');
    });

    it('strips a trailing closing fence pasted from markdown', () => {
      expect(extractMermaidSource('```mermaid\ngraph TD\n  A --> B\n```')).to.equal('graph TD\n  A --> B');
    });

    it('trims trailing blank lines', () => {
      expect(extractMermaidSource('mermaid\ngraph TD\n  A --> B\n\n\n')).to.equal('graph TD\n  A --> B');
    });
  });
});
