/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['cloudflare-ipfs.com'], // Add the external hostname(s) here
  },
}

module.exports = nextConfig
