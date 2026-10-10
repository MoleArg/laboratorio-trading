import type { NextConfig } from 'next';

// Export estático (GitHub Pages). En Pages de proyecto el sitio vive bajo /laboratorio-trading:
// el workflow define NEXT_PUBLIC_BASE_PATH; en local queda vacío.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: false,
  turbopack: { root: import.meta.dirname }
};

export default config;
