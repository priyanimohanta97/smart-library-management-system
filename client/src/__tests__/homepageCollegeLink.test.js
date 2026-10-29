import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Homepage Official College Website Link Suite', () => {
  const homePagePath = path.resolve(__dirname, '../components/HomePage.jsx');
  const homePageSource = fs.readFileSync(homePagePath, 'utf8');

  it('contains a semantic anchor element pointing to https://www.vssut.ac.in/', () => {
    assert.match(
      homePageSource,
      /<a[\s\S]*?href=["']https:\/\/www\.vssut\.ac\.in\/["']/,
      'HomePage must contain an <a> tag linking to https://www.vssut.ac.in/'
    );
  });

  it('opens in a new tab with target="_blank"', () => {
    assert.match(
      homePageSource,
      /<a[\s\S]*?href=["']https:\/\/www\.vssut\.ac\.in\/["'][\s\S]*?target=["']_blank["']/,
      'The VSSUT link must have target="_blank"'
    );
  });

  it('secures new-tab navigation with rel="noopener noreferrer"', () => {
    assert.match(
      homePageSource,
      /<a[\s\S]*?href=["']https:\/\/www\.vssut\.ac\.in\/["'][\s\S]*?rel=["']noopener noreferrer["']/,
      'The VSSUT link must include rel="noopener noreferrer"'
    );
  });

  it('wraps the exact college name "Veer Surendra Sai University of Technology"', () => {
    assert.match(
      homePageSource,
      /<a[\s\S]*?href=["']https:\/\/www\.vssut\.ac\.in\/["'][\s\S]*?>\s*Veer Surendra Sai University of Technology\s*<\/a>/,
      'The anchor element must wrap the exact college name'
    );
  });

  it('includes subtle hover styling and accessible keyboard focus-visible styling', () => {
    const linkMatch = homePageSource.match(/<a[\s\S]*?href=["']https:\/\/www\.vssut\.ac\.in\/["'][\s\S]*?>/);
    assert.ok(linkMatch, 'College link tag must exist');
    const linkTag = linkMatch[0];

    assert.ok(linkTag.includes('hover:text-') || linkTag.includes('hover:underline'), 'Must have hover styling');
    assert.ok(linkTag.includes('focus-visible:ring-'), 'Must have visible keyboard focus-visible styling');
    assert.ok(linkTag.includes('cursor-pointer'), 'Must have cursor-pointer affordance');
  });

  it('preserves the college establishment text below the college link', () => {
    assert.match(
      homePageSource,
      /<\/a>\s*<p className=["'][^"']*["']>Established 1956 · Premier Engineering & Scientific Stacks<\/p>/,
      'Establishment description must remain intact immediately below the college name link'
    );
  });
});

