// Local-only B1 component QA harness. No Next.js route or production integration.
// Run from the repository root: node docs/qa/beta/kym/preview.mjs
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
const root = fileURLToPath(new URL("../../../../", import.meta.url));
const server = await createServer({
  root, configFile: false,
  resolve: { alias: { "@": `${root}src` } },
  server: { host: "127.0.0.1", port: 3421, strictPort: true },
  optimizeDeps: { entries: ["docs/qa/beta/kym/preview.html"] },
});
await server.listen();
console.log("FICTIONAL B1 COMPONENT PREVIEW: http://127.0.0.1:3421/docs/qa/beta/kym/preview.html");
