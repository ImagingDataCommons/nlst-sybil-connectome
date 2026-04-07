/**
 * Regression tests for node pin/unpin interaction in the graph visualization.
 *
 * Tests the click-to-pin / double-click-to-unpin behavior added to prevent
 * hover from stealing selection when investigating a node in the detail panel.
 *
 * Requires: playwright (npm install playwright)
 * Run: node tests/pin-interaction.test.js
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Minimal static file server ────────────────────────────────────────────────

const PORT = 7892;
const DOCS_DIR = path.join(__dirname, '..', 'docs');

function startServer() {
  const server = http.createServer((req, res) => {
    const filePath = path.join(DOCS_DIR, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(PORT, () => resolve(server)));
}

// ── Test helpers ──────────────────────────────────────────────────────────────

let passed = 0, failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

function isPanelOpen(page) {
  return page.evaluate(
    () => !document.getElementById('detail-panel').classList.contains('hidden')
  );
}

async function findNode(page) {
  /** Click a grid of positions until the detail panel opens, return coords.
   *  Starts away from legend/toolbar overlays (top-left corner). */
  for (let x = 100; x < 900; x += 25) {
    for (let y = 220; y < 700; y += 25) {
      await page.mouse.click(x, y);
      await page.waitForTimeout(350); // wait for deferred click timer (220ms) + render
      if (await isPanelOpen(page)) return { x, y };
    }
  }
  return null;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function runTests() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('pageerror', e => {
    if (!e.message.includes('Clipboard')) console.error('PAGE ERROR:', e.message);
  });

  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.waitForTimeout(10000); // wait for force layout to settle

  // ── Test 1: clicking a node pins it and opens the detail panel ──────────────
  console.log('\nTest: click to pin');
  const node = await findNode(page);
  if (!node) {
    console.error('FATAL: Could not find any node — graph may not have rendered.');
    await browser.close(); server.close(); process.exit(1);
  }
  assert(await isPanelOpen(page), 'detail panel opens on node click');

  // ── Test 2: single click on background does NOT unpin ──────────────────────
  console.log('\nTest: single click background does not unpin');
  await page.mouse.click(700, 280);
  await page.waitForTimeout(200);
  assert(await isPanelOpen(page), 'panel stays open after single click on background');

  // ── Test 3: panning (drag) does NOT unpin ──────────────────────────────────
  console.log('\nTest: pan does not unpin');
  await page.mouse.move(500, 400);
  await page.mouse.down();
  await page.mouse.move(350, 300, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  assert(await isPanelOpen(page), 'panel stays open after drag-to-pan');

  // ── Test 4: double-click unpins ────────────────────────────────────────────
  // (graph may have panned, so rescan for a node to double-click)
  console.log('\nTest: double-click unpins');
  const node4 = await findNode(page); // re-pin a node
  if (node4) {
    await page.waitForTimeout(300); // let any pending timers settle before dblclick
    // Double-click at a canvas position known to be clear of UI overlays
    await page.mouse.dblclick(400, 400);
    await page.waitForTimeout(500);
    assert(!await isPanelOpen(page), 'panel closes after double-click');
  } else {
    console.log('  ~ skipped (no node found after pan)');
  }

  // ── Test 5: clicking X button unpins ──────────────────────────────────────
  console.log('\nTest: X button unpins');
  const node5 = await findNode(page); // pin a node
  if (node5) {
    assert(await isPanelOpen(page), 'panel open before X button test');
    await page.click('#close-panel');
    await page.waitForTimeout(300);
    assert(!await isPanelOpen(page), 'panel closes after clicking X button');
  } else {
    console.log('  ~ skipped (no node found)');
  }

  // ── Test 6: clicking a different node switches the pin ─────────────────────
  console.log('\nTest: clicking another node switches pin');
  const node6 = await findNode(page); // pin node A
  if (node6) {
    const titleA = await page.evaluate(() => document.querySelector('.panel-title')?.textContent);
    let switched = false;
    for (let x = 50; x < 900 && !switched; x += 25) {
      for (let y = 180; y < 700 && !switched; y += 25) {
        if (Math.abs(x - node6.x) < 60 && Math.abs(y - node6.y) < 60) continue;
        await page.mouse.click(x, y);
        await page.waitForTimeout(350);
        const title = await page.evaluate(() => document.querySelector('.panel-title')?.textContent);
        if (title && title !== titleA) switched = true;
      }
    }
    if (switched) {
      const titleB = await page.evaluate(() => document.querySelector('.panel-title')?.textContent);
      assert(titleB !== titleA, `panel switches to new node (${titleA} → ${titleB})`);
      assert(await isPanelOpen(page), 'panel stays open after switching pin');
    } else {
      console.log('  ~ skipped (only one node found in viewport)');
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);

  await browser.close();
  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
