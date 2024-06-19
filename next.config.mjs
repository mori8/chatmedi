/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chat/:chatId',
        destination: '/chat/:chatId', // The path to your chat page
      },
    ];
  },
};

export default nextConfig;
