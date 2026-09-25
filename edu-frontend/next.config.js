/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    domains: ['localhost', 'your-supabase-project.supabase.co'],
  },
}

module.exports = nextConfig
