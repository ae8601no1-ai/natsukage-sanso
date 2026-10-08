import { fileURLToPath } from "node:url";

// Bind only Render's HTTP port. Wrangler's development worker ports can be
// misidentified as the primary service port during deployment.
const cli = new URL("../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), "start",
  "--port", process.env.PORT || "10000", "--hostname", "0.0.0.0"];
await import(cli.href);
