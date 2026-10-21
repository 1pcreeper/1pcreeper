import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["mesh-shop-shared/src/tests/**/*.test.ts"], environment: "node" } });
