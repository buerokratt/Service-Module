import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return defineConfig({
    envPrefix: "REACT_APP_",
    plugins: [react(), tsconfigPaths(), svgr()],
    base: "/services/",
    define: {
      "process.env": process.env,
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: parseInt(process.env.REACT_APP_APP_PORT),
      headers: {
        "Content-Security-Policy":
          "upgrade-insecure-requests; default-src 'self'; font-src 'self' data:; img-src 'self' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; connect-src 'self' http://localhost:8086 http://localhost:8085 https://admin.dev.buerokratt.ee/chat/menu.json;",
      },
    },
    build: {
      outDir: "./build",
      target: "es2015",
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "~@fontsource": path.resolve(__dirname, "node_modules/@fontsource"),
        "@": `${path.resolve(__dirname, "./src")}`,
      },
    },
  });
};
