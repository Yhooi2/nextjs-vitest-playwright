import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      '**/.trunk/**': {
        loaders: [],
        as: '*.ignored',
      },
    },
  },
};

export default nextConfig;
