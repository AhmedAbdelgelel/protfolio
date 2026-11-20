#!/usr/bin/env node
/**
 * Zero-dependency static server for the built site.
 *
 *   npm run build && npm run serve     → http://127.0.0.1:4173
 *   node scripts/serve.mjs dist 5000   → custom root and port
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? process.env.PORT ?? 4173);
const host = process.env.HOST ?? '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

function safe(pathname) {
  const file = normalize(join(root, pathname));
  return file.startsWith(root) ? file : null;
}

const server = createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  const file = safe(pathname);
  if (!file) {
    res.writeHead(403).end('forbidden');
    return;
  }

  for (const candidate of [file, file + '.html', join(file, 'index.html')]) {
    try {
      const info = await stat(candidate);
      if (info.isDirectory()) continue;
      const body = await readFile(candidate);
      res.writeHead(200, {
        'content-type': TYPES[extname(candidate).toLowerCase()] ?? 'application/octet-stream',
        'cache-control': 'no-store'
      });
      res.end(body);
      return;
    } catch {
      /* next candidate */
    }
  }

  try {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    res.end(await readFile(join(root, '404.html')));
  } catch {
    res.writeHead(404).end('not found');
  }
});

server.listen(port, host, () => {
  console.log('  glgl.me  →  http://' + host + ':' + port);
  console.log('  serving  ' + root);
});
