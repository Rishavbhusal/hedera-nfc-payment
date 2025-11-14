import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ["@rainbow-me/rainbowkit", "viem", "@arx-research/libhalo"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lucide.dev",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@swc/core-linux-x64-gnu",
      "node_modules/@swc/core-linux-x64-musl",
      "node_modules/@esbuild",
      "node_modules/webpack",
      "node_modules/rollup",
      "node_modules/terser",
      ".next/cache",
      "**/foundry/out/**",
      "**/foundry/node_modules/**",
      "**/foundry/cache/**",
    ],
  },
  webpack: (config, { isServer }) => {
    const workspaceRoot = path.resolve(__dirname, "../..");

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser"),
        crypto: false, // viem uses @noble/hashes for browser crypto
        child_process: false,
        os: false,
        path: false,
        stream: false,
        util: false,
        assert: false,
        constants: false,
        events: false,
        http: false,
        https: false,
        http2: false,
        url: false,
        zlib: path.join(__dirname, "polyfills/zlib.js"),
        module: path.join(__dirname, "polyfills/module.js"),
      };

      // Handle node: protocol imports in browser
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const webpack = require("webpack");
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          // Replace node:module and node:zlib with our polyfills
          if (resource.request === "node:module") {
            resource.request = path.join(__dirname, "polyfills/module.js");
          } else if (resource.request === "node:zlib") {
            resource.request = path.join(__dirname, "polyfills/zlib.js");
          } else {
            resource.request = resource.request.replace(/^node:/, "");
          }
        }),
        // Ignore Node.js-only packages that can't work in browser
        new webpack.IgnorePlugin({
          resourceRegExp: /^(detect-libc|node-gyp-build-optional-packages|msgpackr-extract)$/,
        }),
        // Replace axios Node.js version with browser version (catch all patterns including relative paths)
        new webpack.NormalModuleReplacementPlugin(/.*axios[\/\\]dist[\/\\]node.*/, (resource: { request: string }) => {
          // Always replace with browser version - use absolute path
          const browserPath = path.join(workspaceRoot, "node_modules/axios/dist/browser/axios.cjs");
          resource.request = browserPath;
        }),
        // Replace msgpackr Node.js version with browser version
        new webpack.NormalModuleReplacementPlugin(/msgpackr\/dist\/node\.cjs$/, (resource: { request: string }) => {
          // Browser entry point is index.js according to package.json exports
          resource.request = path.join(__dirname, "node_modules/msgpackr/index.js");
        }),
        // Replace @arx-research/libhalo CommonJS version with ESM version
        new webpack.NormalModuleReplacementPlugin(
          /@arx-research\/libhalo\/lib\.commonjs/,
          (resource: { request: string }) => {
            // Replace CommonJS path with ESM path
            resource.request = resource.request.replace(/lib\.commonjs/, "lib.esm");
          },
        ),
        // Replace @arx-research/libhalo/api/web to use ESM version
        new webpack.NormalModuleReplacementPlugin(
          /^@arx-research\/libhalo\/api\/web$/,
          (resource: { request: string }) => {
            // Replace with direct ESM path
            resource.request = path.join(__dirname, "node_modules/@arx-research/libhalo/lib.esm/api/web.js");
          },
        ),
      );

      // Handle server-side imports too (for SSR)
      if (isServer) {
        config.plugins.push(
          // Replace @arx-research/libhalo CommonJS version with ESM version on server too
          new webpack.NormalModuleReplacementPlugin(
            /@arx-research\/libhalo\/lib\.commonjs/,
            (resource: { request: string }) => {
              resource.request = resource.request.replace(/lib\.commonjs/, "lib.esm");
            },
          ),
          // Replace @arx-research/libhalo/api/web on server
          new webpack.NormalModuleReplacementPlugin(
            /^@arx-research\/libhalo\/api\/web$/,
            (resource: { request: string }) => {
              resource.request = path.join(__dirname, "node_modules/@arx-research/libhalo/lib.esm/api/web.js");
            },
          ),
        );
      }

      // Force axios and msgpackr to use browser versions (via alias as fallback)
      const axiosBrowserPath = path.join(workspaceRoot, "node_modules/axios/dist/browser/axios.cjs");
      // Browser entry point is index.js according to package.json exports
      // msgpackr is installed in nextjs package's node_modules
      const msgpackrPackagePath = path.join(__dirname, "node_modules/msgpackr");
      const msgpackrBrowserPath = path.join(msgpackrPackagePath, "index.js");
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        // Ensure axios Node.js paths use browser version
        "axios/dist/node/axios.cjs": axiosBrowserPath,
        "axios/dist/node": path.join(workspaceRoot, "node_modules/axios/dist/browser"),
        // Ensure msgpackr always uses browser version - alias both the package and specific paths
        "msgpackr/dist/node.cjs": msgpackrBrowserPath,
        msgpackr: msgpackrPackagePath, // Alias to package directory so webpack can resolve it properly
        // Force @arx-research/libhalo to use ESM version instead of CommonJS
        "@arx-research/libhalo/lib.commonjs": "@arx-research/libhalo/lib.esm",
        // Also alias the specific API path - point directly to ESM version
        "@arx-research/libhalo/api/web": path.join(__dirname, "node_modules/@arx-research/libhalo/lib.esm/api/web.js"),
      };
    }

    // Ensure proper module resolution for viem and its subpaths
    // Include workspace root node_modules for monorepo support
    config.resolve.modules = [
      "node_modules",
      path.join(workspaceRoot, "node_modules"),
      ...(config.resolve.modules || []),
    ];
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".js", ".ts", ".tsx"],
    };

    // Ensure webpack respects package.json exports
    // For browser builds, prioritize "browser" and "import" conditions to get ESM versions
    if (!isServer) {
      // Force "import" condition first to get ESM versions, then browser
      config.resolve.conditionNames = ["import", "browser", "require", "default"];
    } else {
      // For server, also prioritize import to get ESM versions
      config.resolve.conditionNames = ["import", "require", "node", "default"];
      // Add alias for server-side too
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@arx-research/libhalo/api/web": path.join(__dirname, "node_modules/@arx-research/libhalo/lib.esm/api/web.js"),
        "@arx-research/libhalo/lib.commonjs": "@arx-research/libhalo/lib.esm",
      };
    }

    // Explicitly alias viem to ensure @arcana/ca-common can resolve it
    // Use the package directory so webpack can handle both ESM and CJS
    // Preserve any aliases set above (browser or server)
    const viemPackagePath = path.dirname(require.resolve("viem/package.json"));
    const existingAliases = config.resolve.alias || {};
    config.resolve.alias = {
      ...existingAliases,
      viem: viemPackagePath,
    };

    config.externals.push("pino-pretty", "lokijs", "encoding");

    return config;
  },
  experimental: {
    swcTraceProfiling: false,
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

export default nextConfig;
