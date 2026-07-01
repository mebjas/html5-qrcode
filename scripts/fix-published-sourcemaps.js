/**
 * Rewrites source map "sources" paths after the library build.
 *
 * TypeScript emits maps for dist/esm, dist/cjs, etc. When those folders are
 * published at package root (esm/, cjs/, ...), each source path is one "../"
 * segment too deep and bundlers resolve to node_modules/src/... instead of
 * package-root src/.
 */
const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIRS = ['dist/esm', 'dist/cjs', 'dist/es2015'];

function fixSourcePath(sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath.includes('/src/')) {
    return sourcePath;
  }
  if (!sourcePath.startsWith('../')) {
    return sourcePath;
  }
  return sourcePath.replace(/^\.\.\//, '');
}

function collectMapFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMapFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.js.map')) {
      files.push(fullPath);
    }
  }
  return files;
}

function patchSourceMapFile(mapFilePath) {
  const map = JSON.parse(fs.readFileSync(mapFilePath, 'utf8'));
  if (!Array.isArray(map.sources) || map.sources.length === 0) {
    return false;
  }

  const nextSources = map.sources.map(fixSourcePath);
  const changed = nextSources.some((source, index) => source !== map.sources[index]);
  if (!changed) {
    return false;
  }

  map.sources = nextSources;
  fs.writeFileSync(mapFilePath, `${JSON.stringify(map)}\n`, 'utf8');
  return true;
}

function main() {
  const mapFiles = OUTPUT_DIRS.flatMap((dir) => collectMapFiles(path.join(PACKAGE_ROOT, dir)));
  let patched = 0;

  for (const mapFile of mapFiles) {
    if (patchSourceMapFile(mapFile)) {
      patched += 1;
    }
  }

  console.log(`[fix-published-sourcemaps] Patched ${patched}/${mapFiles.length} source map file(s).`);
}

main();
