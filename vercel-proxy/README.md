# Vercel Proxy

This subproject exposes a serverless endpoint for the Youdao text translation API:

- `GET /api/youdao/dict?q=hello world`

## Required environment variables

- `YOUDAO_APP_KEY`
- `YOUDAO_APP_SECRET`

## Local dev

```bash
cd vercel-proxy
npx vercel dev
```

## Deploy

Deploy this folder as a separate Vercel project. After deployment, use the public URL in the main app:

```env
VITE_YOUDAO_PROXY_URL=https://your-project.vercel.app/api/youdao/dict
```
