const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', '.git', 'dist']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (full.endsWith('.js')) files.push(full);
  }
}
walk(root);
let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed += 1;
    process.stderr.write(`\n${path.relative(root, file)}\n${result.stderr}`);
  }
}
console.log(`Checked ${files.length} JavaScript files; ${failed} syntax errors.`);
process.exitCode = failed ? 1 : 0;
