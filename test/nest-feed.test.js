'use strict';

/*
 * Reproducible check for the nest feed window bug.
 *
 * The old room loaded the newest 80 posts for the site, then filtered by
 * nest in the browser. A nest whose posts are all older than that window
 * rendered "No posts in <nest> yet". The nest query below selects that
 * nest's own posts, newest first. The scan fold is the pre-index fallback:
 * it keeps reading the existing siteId + createdAt pages until the nest
 * page fills.
 *
 * Run: node test/nest-feed.test.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const src = fs.readFileSync(path.join(__dirname, '..', 'factory.js'), 'utf8');
const start = src.indexOf('/* @popechat-nest-feed */');
const end = src.indexOf('/* @popechat-nest-feed-end */');
assert.ok(start >= 0 && end > start, 'nest feed helpers missing from factory.js');
const api = new Function(
  src.slice(start, end) +
  '\nreturn { FEED_PAGE: FEED_PAGE, NEST_SCAN_CAP: NEST_SCAN_CAP, feedQuerySpec: feedQuerySpec, isMissingIndexError: isMissingIndexError, applyFeedQuery: applyFeedQuery, foldScanPage: foldScanPage };'
)();

const SITE = 'popechat';

function doc(id, createdAt, nestSlug, parentId) {
  return {
    id: id,
    siteId: SITE,
    nestSlug: nestSlug || '',
    createdAt: createdAt,
    parentId: parentId || null,
    text: id
  };
}

function ids(rows) {
  return rows.map(function (row) { return row.id; });
}

function topLevel(rows) {
  return rows.filter(function (row) { return !row.parentId; });
}

function renderedIds(rows) {
  var posts = topLevel(rows);
  if (!posts.length) return 'EMPTY';
  return ids(posts).join(',');
}

function windowThenFilter(docs, nestSlug) {
  var windowed = api.applyFeedQuery(docs, api.feedQuerySpec(SITE, null));
  return topLevel(windowed.filter(function (row) { return row.nestSlug === nestSlug; }));
}

function pagesOf(docs, size) {
  var ordered = docs.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  var pages = [];
  var i;
  for (i = 0; i < ordered.length; i += size) pages.push(ordered.slice(i, i + size));
  return pages;
}

function scanNest(docs, nestSlug) {
  var pages = pagesOf(docs, api.FEED_PAGE);
  var found = [];
  var scanned = 0;
  var cursor = 0;
  var guard = 0;
  while (guard < 100) {
    guard += 1;
    var page = pages[cursor] || [];
    var folded = api.foldScanPage(page, nestSlug, scanned, found.length, api.FEED_PAGE, api.NEST_SCAN_CAP, api.FEED_PAGE);
    found = found.concat(folded.take);
    scanned = folded.scanned;
    if (folded.exhausted || folded.capped || !folded.hasMore || found.length >= api.FEED_PAGE) {
      return { posts: found, scanned: scanned, hasMore: folded.hasMore, capped: folded.capped, exhausted: folded.exhausted };
    }
    cursor += 1;
    if (cursor >= pages.length) {
      return { posts: found, scanned: scanned, hasMore: false, capped: false, exhausted: true };
    }
  }
  throw new Error('scan did not finish');
}

const mainSpec = api.feedQuerySpec(SITE, null);
assert.strictEqual(mainSpec.collection, 'posts');
assert.strictEqual(mainSpec.limit, 80);
assert.deepStrictEqual(mainSpec.orderBy, { field: 'createdAt', dir: 'desc' });
assert.deepStrictEqual(mainSpec.where, [{ field: 'siteId', op: '==', value: SITE }]);

const nestSpec = api.feedQuerySpec(SITE, 'intentions');
assert.deepStrictEqual(nestSpec.where, [
  { field: 'siteId', op: '==', value: SITE },
  { field: 'nestSlug', op: '==', value: 'intentions' }
]);
assert.strictEqual(nestSpec.limit, 80);
assert.deepStrictEqual(nestSpec.orderBy, { field: 'createdAt', dir: 'desc' });

const docs = [];
var n;
for (n = 0; n < 80; n++) {
  docs.push(doc('busy-' + n, 10000 - n, n % 2 ? 'vespers' : 'hymns'));
}
docs.push(doc('intentions-new', 300, 'intentions'));
docs.push(doc('intentions-reply', 290, 'intentions', 'intentions-new'));
docs.push(doc('mass-reflection-1', 200, 'mass-reflection'));
docs.push(doc('meditation-1', 100, 'meditation'));
docs.push(doc('intentions-old', 50, 'intentions'));

assert.strictEqual(renderedIds(windowThenFilter(docs, 'intentions')), 'EMPTY', 'old window hid intentions');
assert.strictEqual(renderedIds(windowThenFilter(docs, 'mass-reflection')), 'EMPTY', 'old window hid mass-reflection');
assert.strictEqual(renderedIds(windowThenFilter(docs, 'meditation')), 'EMPTY', 'old window hid meditation');
assert.ok(renderedIds(windowThenFilter(docs, 'vespers')) !== 'EMPTY', 'vespers stayed inside the window');
assert.ok(renderedIds(windowThenFilter(docs, 'hymns')) !== 'EMPTY', 'hymns stayed inside the window');

assert.strictEqual(
  renderedIds(api.applyFeedQuery(docs, api.feedQuerySpec(SITE, 'intentions'))),
  'intentions-new,intentions-old'
);
assert.strictEqual(
  renderedIds(api.applyFeedQuery(docs, api.feedQuerySpec(SITE, 'mass-reflection'))),
  'mass-reflection-1'
);
assert.strictEqual(
  renderedIds(api.applyFeedQuery(docs, api.feedQuerySpec(SITE, 'meditation'))),
  'meditation-1'
);
assert.deepStrictEqual(
  ids(api.applyFeedQuery(docs, api.feedQuerySpec(SITE, 'intentions'))),
  ['intentions-new', 'intentions-reply', 'intentions-old']
);

const scannedIntentions = scanNest(docs, 'intentions');
assert.strictEqual(renderedIds(scannedIntentions.posts), 'intentions-new,intentions-old');
assert.strictEqual(scannedIntentions.exhausted, true);
assert.ok(scannedIntentions.scanned > 80, 'fallback reads past the first site page');

const mainIds = ids(api.applyFeedQuery(docs, mainSpec));
assert.strictEqual(mainIds.length, 80);
assert.ok(mainIds.indexOf('intentions-new') === -1);
assert.ok(mainIds.indexOf('mass-reflection-1') === -1);
assert.ok(mainIds.indexOf('meditation-1') === -1);
assert.ok(mainIds.indexOf('busy-0') === 0);

const many = [];
for (n = 0; n < 100; n++) many.push(doc('square-' + n, 50000 - n, ''));
for (n = 0; n < 81; n++) many.push(doc('med-' + n, 1000 - n, 'meditation'));
const medPage = api.applyFeedQuery(many, api.feedQuerySpec(SITE, 'meditation'));
assert.strictEqual(medPage.length, 80);
assert.strictEqual(medPage[0].id, 'med-0');
assert.strictEqual(medPage[79].id, 'med-79');
assert.ok(ids(medPage).indexOf('med-80') === -1);
assert.strictEqual(renderedIds(windowThenFilter(many, 'meditation')), 'EMPTY');
const medScan = scanNest(many, 'meditation');
assert.strictEqual(medScan.posts.length, 80);
assert.strictEqual(medScan.posts[0].id, 'med-0');
assert.strictEqual(medScan.hasMore, true, 'older meditation posts stay available on the next page');

const cappedPage = [];
for (n = 0; n < 10; n++) cappedPage.push(doc('cap-' + n, 100 - n, n === 9 ? 'intentions' : ''));
const capped = api.foldScanPage(cappedPage, 'intentions', 0, 0, 80, 4, 80);
assert.strictEqual(capped.take.length, 0);
assert.strictEqual(capped.capped, true);
assert.strictEqual(capped.hasMore, false);
assert.strictEqual(capped.scanned, 4);

assert.strictEqual(api.isMissingIndexError({ code: 'failed-precondition', message: 'The query requires an index.' }), true);
assert.strictEqual(api.isMissingIndexError({ code: 'permission-denied', message: 'Missing or insufficient permissions.' }), false);
assert.strictEqual(api.isMissingIndexError(null), false);

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(html.indexOf('factory.js?v=37') !== -1, 'cache-bust version was not bumped');
assert.ok(html.indexOf('factory.js?v=36') === -1);

console.log('nest-feed: older intentions, mass-reflection, and meditation posts render; main feed stays the newest 80');
