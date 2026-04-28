import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'path';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const baseFromEnv = process.env.VITE_BASE || '/';
const normalizedBase = baseFromEnv.endsWith('/') ? baseFromEnv : `${baseFromEnv}/`;

const YOUDAO_ENDPOINT = 'https://openapi.youdao.com/api';
const HAPPY_CHICKEN_FARM_PAGE = 'happy_chicken_farm.html';

const buildInput = (query: string) => {
  if (query.length <= 20) {
    return query;
  }

  return `${query.slice(0, 10)}${query.length}${query.slice(-10)}`;
};

const createYoudaoMiddleware = (appKey?: string, appSecret?: string): Connect.NextHandleFunction => {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/youdao/dict')) {
      next();
      return;
    }

    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ message: 'Method not allowed.' }));
      return;
    }

    const url = new URL(req.url, 'http://localhost');
    const query = url.searchParams.get('q')?.trim();

    if (!query) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ message: 'Missing query parameter q.' }));
      return;
    }

    if (!appKey || !appSecret) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          message: 'Missing YOUDAO_APP_KEY or YOUDAO_APP_SECRET in the server environment.'
        })
      );
      return;
    }

    const salt = randomUUID();
    const curtime = `${Math.floor(Date.now() / 1000)}`;
    const sign = createHash('sha256')
      .update(`${appKey}${buildInput(query)}${salt}${curtime}${appSecret}`)
      .digest('hex');

    const upstreamParams = new URLSearchParams({
      q: query,
      from: 'auto',
      to: 'zh-CHS',
      appKey,
      salt,
      sign,
      signType: 'v3',
      curtime,
      ext: 'mp3',
      voice: '0'
    });

    try {
      const upstreamResponse = await fetch(YOUDAO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: upstreamParams.toString()
      });
      const body = await upstreamResponse.text();
      res.statusCode = upstreamResponse.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(body);
    } catch (error) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          message: error instanceof Error ? error.message : 'Failed to reach Youdao service.'
        })
      );
    }
  };
};

const youdaoProxyPlugin = (appKey?: string, appSecret?: string): Plugin => ({
  name: 'youdao-dictionary-proxy',
  configureServer(server) {
    server.middlewares.use(createYoudaoMiddleware(appKey, appSecret));
  },
  configurePreviewServer(server) {
    server.middlewares.use(createYoudaoMiddleware(appKey, appSecret));
  }
});

const createRootHtmlPageMiddleware = (pageName: string): Connect.NextHandleFunction => {
  const pagePath = path.resolve(__dirname, pageName);
  const pageRoute = `/${pageName}`;

  return async (req, res, next) => {
    const requestPath = req.url?.split('?')[0];
    if (!requestPath?.endsWith(pageRoute)) {
      next();
      return;
    }

    try {
      const html = await fs.readFile(pagePath, 'utf8');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
    } catch {
      next();
    }
  };
};

const rootHtmlPagePlugin = (pageName: string): Plugin => {
  let outputDir = '';

  return {
    name: 'root-html-page',
    configResolved(config) {
      outputDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use(createRootHtmlPageMiddleware(pageName));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createRootHtmlPageMiddleware(pageName));
    },
    async writeBundle() {
      const sourcePath = path.resolve(__dirname, pageName);
      const outputPath = path.resolve(outputDir, pageName);

      if (sourcePath === outputPath) {
        return;
      }

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.copyFile(sourcePath, outputPath);
    }
  };
};

export default defineConfig(({ mode }) => {
  const isOffline = mode === 'offline';
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: 'src',
    envDir: __dirname,
    base: isOffline ? './' : (mode === 'production' ? normalizedBase : '/'),
    build: {
      outDir: isOffline ? '../offline-dist' : '..',
      emptyOutDir: isOffline ? true : false,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      youdaoProxyPlugin(env.YOUDAO_APP_KEY, env.YOUDAO_APP_SECRET),
      rootHtmlPagePlugin(HAPPY_CHICKEN_FARM_PAGE)
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    }
  };
});
