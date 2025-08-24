module.exports = {
  env: {
    NEXT_PUBLIC_BINANCE_API_KEY: process.env.NEXT_PUBLIC_BINANCE_API_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  webpack: (config) => {
    // Custom Webpack configurations can be added here
    return config;
  },
};