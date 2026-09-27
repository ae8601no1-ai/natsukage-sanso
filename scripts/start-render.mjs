import { spawn } from "node:child_process";

const port = process.env.PORT || "10000";
const wrangler = new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url);

const server = spawn(process.execPath, [
  "--import", new URL("./sites-env.mjs", import.meta.url).pathname,
  wrangler.pathname,
  "dev",
  "--config", "dist/server/wrangler.json",
  "--local",
  "--ip", "0.0.0.0",
  "--port", port,
  "--inspector-port", "0",
], { stdio: "inherit", env: process.env });

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
