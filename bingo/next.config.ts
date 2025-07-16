import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */



    env: {
        VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,

    },
};

export default nextConfig;
