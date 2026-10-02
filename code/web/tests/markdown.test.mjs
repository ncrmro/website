import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, markdownImageReferences } from '../src/writing/markdown.ts';

test('renders extended Markdown and inert Apollo markers without losing code or tables', () => {
 const body = '# Notes\n\n| A | B |\n| - | - |\n| one | two |\n\n```tsx\nimport React from "react";\n<ApolloReplayMap />\n```\n\n<ApolloReplayMap />\n\n![Animation](animation.gif)\n';
 const parts = renderMarkdown(body, name => `/media/id/${name}`);
 const html = parts.filter(part => part.kind === 'html').map(part => part.html).join('');
 assert.equal(parts.filter(part => part.kind === 'apollo').length, 1);
 assert.match(html, /<table>/);
 assert.match(html, /import React/);
 assert.match(html, /&lt;ApolloReplayMap/);
 assert.match(html, /src="\/media\/id\/animation.gif"/);
 assert.deepEqual(markdownImageReferences(body), ['animation.gif']);
});

test('preserves safe SVG/details and strips executable HTML while retaining image references', () => {
 const body = '<details><summary>Sources</summary><svg viewBox="0 0 10 10" aria-labelledby="caption"><title id="caption">Chart</title><text x="1" y="2">Value</text></svg><img src="chart.png" onerror="alert(1)"><script>alert(1)</script></details>';
 const html = renderMarkdown(body, name => `/media/id/${name}`).map(part => part.html ?? '').join('');
 assert.match(html, /<details>/); assert.match(html, /viewBox="0 0 10 10"/);
 assert.match(html, /<text x="1" y="2">Value<\/text>/);
 assert.ok(!html.includes('<script') && !html.includes('onerror'));
 assert.deepEqual(markdownImageReferences(body), ['chart.png']);
});


test('only app-resolved image URLs and dimensions survive raw HTML, including GIFs', () => {
 const body = '<img src="animation.gif" srcset="https://external.invalid/a.gif 2x" sizes="100vw" width="999" height="999" alt="Animation">';
 const html = renderMarkdown(body, () => ({src: '/media/id/animation.gif', width: 300, height: 200})).map(part => part.html ?? '').join('');
 assert.ok(!html.includes('external.invalid') && !html.includes('srcset=') && !html.includes('sizes='));
 assert.match(html, /width="300"/); assert.match(html, /height="200"/); assert.match(html, /alt="Animation"/);
 const invalid = renderMarkdown('<img src="https://external.invalid/image.png" srcset="https://external.invalid/other.png 2x">', () => '/unused').map(part => part.html ?? '').join('');
 assert.ok(!invalid.includes('external.invalid'));
});
