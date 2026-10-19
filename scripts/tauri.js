import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

// Find the platform PATH key case-insensitively (on Windows it is "Path", on Unix "PATH")
const pathKey =
  Object.keys(process.env).find((k) => k.toLowerCase() === "path") || "PATH";
const currentPath = process.env[pathKey] || "";

const cargoBin = path.join(os.homedir(), ".cargo", "bin");
const nodeDir = path.dirname(process.execPath);
const env = { ...process.env };

let updatedPath = currentPath;

if (fs.existsSync(cargoBin) && !updatedPath.includes(cargoBin)) {
  updatedPath = `${cargoBin}${path.delimiter}${updatedPath}`;
}
if (fs.existsSync(nodeDir) && !updatedPath.includes(nodeDir)) {
  updatedPath = `${nodeDir}${path.delimiter}${updatedPath}`;
}

env[pathKey] = updatedPath;
if (pathKey !== "PATH" && "PATH" in env) {
  delete env.PATH;
}

const args = process.argv.slice(2);

// 1. Direct JS entrypoint for @tauri-apps/cli (immune to symlink & .cmd resolution issues on VM shared folders)
const tauriCliScript = path.join(
  process.cwd(),
  "node_modules",
  "@tauri-apps",
  "cli",
  "tauri.js"
);

// 2. Local bin wrapper
const localBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tauri.cmd" : "tauri"
);

let executable;
let spawnArgs;
let useShell = false;

if (fs.existsSync(tauriCliScript)) {
  executable = process.execPath;
  spawnArgs = [tauriCliScript, ...args];
} else if (fs.existsSync(localBin)) {
  executable = localBin;
  spawnArgs = args;
  useShell = process.platform === "win32";
} else {
  executable = process.platform === "win32" ? "tauri.cmd" : "tauri";
  spawnArgs = args;
  useShell = process.platform === "win32";
}

const proc = spawn(executable, spawnArgs, {
  stdio: "inherit",
  env,
  shell: useShell,
});

proc.on("exit", (code) => {
  process.exit(code ?? 0);
});

