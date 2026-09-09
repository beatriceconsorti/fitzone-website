const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveUrl } = require('../js/resolve-url.js');

describe('resolveUrl', () => {
  it('mappa la root a index.html', () => {
    assert.deepEqual(resolveUrl('/'), { status: 200, relative: '/index.html' });
  });

  it('ignora la query', () => {
    assert.equal(resolveUrl('/studio.html?x=1').relative, '/studio.html');
  });

  it('rifiuta path traversal', () => {
    assert.equal(resolveUrl('/../secret').status, 403);
  });
});
