import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactCompiler: true,
    output: "export",
    distDir: isDev ? ".next" : "dist",
  };
};

export default nextConfig;
