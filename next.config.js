/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: '**',
    //     port: '',
    //     pathname: ''
    //   }
    // ]
  },
  async rewrites() {
    return [
      {
        source: `/api/:path*`,
        destination: `/api/:path*`,
      },
      {
        source: "/fastapi/:path*",
        destination: "http://143.248.159.158:8000/:path*",
      },
    ];
  },
}

module.exports = nextConfig
