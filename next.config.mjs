/** @type {import('next').NextConfig} */
const nextConfig = {
  // The content layer authors every internal path with a trailing slash
  // (/sections/<id>/, /blog/, /signals/, /implementations/). Enforcing it here
  // keeps canonical tags, the sitemap, and internal links pointing at the final
  // URL instead of a 308 redirect — critical for clean crawling and indexing.
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
