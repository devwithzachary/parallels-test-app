import { renderIcon } from "../icons";
import { invoke } from "@tauri-apps/api/core";
import { open, message, ask } from "@tauri-apps/plugin-dialog";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export interface DiskIoResponse {
  success: boolean;
  resolved_dir: string;
  file_path: string;
  bytes_written: usize;
  elapsed_ms: number;
  timestamp_epoch_ms: number;
  verified: boolean;
  error?: string;
}

type usize = number;

export class NativeTestsManager {
  private container: HTMLElement;
  private logs: Array<{ time: string; type: "info" | "success" | "warn" | "error"; text: string }> = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    this.render();
    this.bindEvents();
    this.log("info", "Native System Integration test suite initialized.");
  }

  private log(type: "info" | "success" | "warn" | "error", text: string) {
    const time = new Date().toLocaleTimeString();
    this.logs.unshift({ time, type, text });
    if (this.logs.length > 50) this.logs.pop();
    this.updateLogView();
  }

  private updateLogView() {
    const logContainer = this.container.querySelector("#native-test-log-output");
    if (!logContainer) return;

    if (this.logs.length === 0) {
      logContainer.innerHTML = `<div class="log-empty">Awaiting test execution...</div>`;
      return;
    }

    logContainer.innerHTML = this.logs
      .map(
        (l) => `
        <div class="log-entry log-${l.type}">
          <span class="log-time">[${l.time}]</span>
          <span class="log-tag">${l.type.toUpperCase()}</span>
          <span class="log-text">${l.text}</span>
        </div>
      `
      )
      .join("");
  }

  private async handleOpenDialog(type: "file" | "message" | "confirm") {
    try {
      this.log("info", `Invoking native dialog: ${type.toUpperCase()}...`);
      const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

      if (!isTauri) {
        if (type === "file") {
          this.log("warn", "Browser preview: Simulating file picker via HTML5 input.");
          const input = document.createElement("input");
          input.type = "file";
          input.onchange = () => {
            const file = input.files?.[0];
            this.log("success", `Browser Mock File selected: ${file?.name || "none"} (${file?.size || 0} bytes)`);
          };
          input.click();
        } else if (type === "message") {
          window.alert("Matrix App: Cross-platform alert dialog triggered (Browser fallback).");
          this.log("success", "Alert acknowledged by user.");
        } else {
          const res = window.confirm("Matrix App: Confirm this action?");
          this.log("info", `Confirmation result: ${res ? "Confirmed (OK)" : "Cancelled"}`);
        }
        return;
      }

      if (type === "file") {
        const selected = await open({
          multiple: false,
          directory: false,
          title: "Matrix App: Select File (Native File Picker)",
        });
        if (selected) {
          this.log("success", `File selected: ${selected}`);
        } else {
          this.log("warn", "File selection cancelled by user.");
        }
      } else if (type === "message") {
        await message("Native platform dialog rendered successfully via Tauri v2 plugin-dialog.", {
          title: "Matrix App: Native Alert",
          kind: "info",
        });
        this.log("success", "Native message alert closed.");
      } else if (type === "confirm") {
        const confirmed = await ask("Verify native dialog chrome & font rendering?", {
          title: "Matrix App: Confirmation Prompt",
          kind: "warning",
        });
        this.log(confirmed ? "success" : "warn", `Native confirmation result: ${confirmed ? "Yes / Confirmed" : "No / Declined"}`);
      }
    } catch (err: any) {
      this.log("error", `Dialog error: ${err?.message || err}`);
    }
  }

  private async handleTriggerNotification() {
    try {
      this.log("info", "Checking desktop notification permissions...");
      const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

      if (!isTauri) {
        if ("Notification" in window) {
          let permission = Notification.permission;
          if (permission !== "granted") {
            permission = await Notification.requestPermission();
          }
          if (permission === "granted") {
            new Notification("Matrix App", {
              body: "Web notification fallback test across browsers!",
            });
            this.log("success", "Browser notification dispatched.");
          } else {
            this.log("warn", "Browser notification permission denied.");
          }
        } else {
          this.log("warn", "Desktop notifications not supported in this browser context.");
        }
        return;
      }

      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
      }

      if (permissionGranted) {
        sendNotification({
          title: "Matrix App: Cross-Platform Signal",
          body: `Notification triggered at ${new Date().toLocaleTimeString()}! Native platform toast verified.`,
        });
        this.log("success", "Native desktop notification dispatched via tauri-plugin-notification!");
      } else {
        this.log("warn", "Desktop notification permission was denied by system policy.");
      }
    } catch (err: any) {
      this.log("error", `Notification error: ${err?.message || err}`);
    }
  }

  private async handleDiskIoTest() {
    const outputCard = this.container.querySelector("#disk-io-result-card");
    try {
      this.log("info", "Executing Disk IO / State Test via Tauri backend...");
      const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

      if (!isTauri) {
        this.log("warn", "Browser preview mode: Simulating disk write to localStorage.");
        const key = "matrix_state_test.json";
        const val = JSON.stringify({
          test: "mock-disk-io",
          time: Date.now(),
        });
        const t0 = performance.now();
        localStorage.setItem(key, val);
        const read = localStorage.getItem(key);
        const verified = read === val;
        const elapsed = (performance.now() - t0).toFixed(2);
        this.log("success", `Mock Disk IO verified in ${elapsed} ms (localStorage match: ${verified}).`);

        if (outputCard) {
          outputCard.innerHTML = `
            <div class="disk-result-box verified">
              <div class="result-header">
                ${renderIcon("CheckCircle2", { size: 18, class: "text-emerald-400" })}
                <strong>MOCK STATE PERSISTED (Browser Preview)</strong>
              </div>
              <div class="result-detail">
                <span class="label">Storage Target:</span>
                <code class="val">localStorage::matrix_state_test.json</code>
              </div>
              <div class="result-detail">
                <span class="label">Roundtrip Latency:</span>
                <span class="val font-mono">${elapsed} ms</span>
              </div>
            </div>
          `;
        }
        return;
      }

      const result = await invoke<DiskIoResponse>("test_disk_io");

      if (result.success && result.verified) {
        this.log(
          "success",
          `Disk IO verified! Wrote ${result.bytes_written} bytes in ${result.elapsed_ms.toFixed(2)} ms to ${result.file_path}`
        );

        if (outputCard) {
          outputCard.innerHTML = `
            <div class="disk-result-box verified">
              <div class="result-header">
                ${renderIcon("CheckCircle2", { size: 18, class: "text-emerald-400" })}
                <span class="status-title">DISK PERSISTENCE VERIFIED</span>
                <span class="badge badge-emerald">${result.elapsed_ms.toFixed(2)} ms</span>
              </div>
              <div class="result-grid">
                <div class="result-detail">
                  <span class="label">Platform Config Dir:</span>
                  <code class="val font-mono break-all">${result.resolved_dir}</code>
                </div>
                <div class="result-detail">
                  <span class="label">Target Test File:</span>
                  <code class="val font-mono break-all highlight-cyan">${result.file_path}</code>
                </div>
                <div class="result-stats">
                  <span>Bytes: <strong>${result.bytes_written} B</strong></span>
                  <span class="dot-sep">•</span>
                  <span>Integrity: <strong>100% Match</strong></span>
                  <span class="dot-sep">•</span>
                  <span>Timestamp: <strong>${new Date(result.timestamp_epoch_ms).toISOString()}</strong></span>
                </div>
              </div>
            </div>
          `;
        }
      } else {
        this.log("error", `Disk IO failed: ${result.error || "Integrity mismatch"}`);
        if (outputCard) {
          outputCard.innerHTML = `
            <div class="disk-result-box failed">
              <div class="result-header">
                ${renderIcon("AlertCircle", { size: 18, class: "text-rose-400" })}
                <span class="status-title">DISK TEST FAILED</span>
              </div>
              <div class="result-detail">
                <code class="val text-rose-300">${result.error || "Unknown error"}</code>
              </div>
            </div>
          `;
        }
      }
    } catch (err: any) {
      this.log("error", `Disk IO error: ${err?.message || err}`);
      if (outputCard) {
        outputCard.innerHTML = `
          <div class="disk-result-box failed">
            <div class="result-header">
              ${renderIcon("AlertCircle", { size: 18, class: "text-rose-400" })}
              <span class="status-title">COMMAND ERROR</span>
            </div>
            <div class="result-detail">
              <code class="val text-rose-300">${err?.message || err}</code>
            </div>
          </div>
        `;
      }
    }
  }

  private bindEvents() {
    this.container.querySelector("#btn-open-file-dialog")?.addEventListener("click", () => {
      this.handleOpenDialog("file");
    });
    this.container.querySelector("#btn-open-message-dialog")?.addEventListener("click", () => {
      this.handleOpenDialog("message");
    });
    this.container.querySelector("#btn-open-confirm-dialog")?.addEventListener("click", () => {
      this.handleOpenDialog("confirm");
    });
    this.container.querySelector("#btn-trigger-notification")?.addEventListener("click", () => {
      this.handleTriggerNotification();
    });
    this.container.querySelector("#btn-test-disk-io")?.addEventListener("click", () => {
      this.handleDiskIoTest();
    });
    this.container.querySelector("#btn-clear-test-logs")?.addEventListener("click", () => {
      this.logs = [];
      this.updateLogView();
    });
  }

  public render() {
    this.container.innerHTML = `
      <section class="native-tests-section" aria-label="Native Platform Integration Tests">
        <div class="section-header">
          <div class="section-title-group">
            <div class="icon-chip chip-cyan">
              ${renderIcon("Zap", { size: 18 })}
            </div>
            <div>
              <h3>Native System Integration Tests</h3>
              <p class="section-subtitle">Directly exercise native window chrome, OS notifications, and platform disk storage.</p>
            </div>
          </div>
        </div>

        <div class="tests-grid">
          <!-- Test 1: Native Dialogs -->
          <div class="test-card">
            <div class="test-card-top">
              <div class="test-icon-wrap">
                ${renderIcon("FolderOpen", { size: 22, class: "text-cyan-400" })}
              </div>
              <div class="test-info">
                <h4>Native Dialogs & Chrome</h4>
                <p>Inspects native OS modal presentation, system buttons, and file picker dialogs.</p>
              </div>
            </div>
            <div class="test-btn-group">
              <button id="btn-open-file-dialog" class="btn btn-primary" title="Open Native File Picker">
                ${renderIcon("FolderOpen", { size: 16 })}
                <span>File Picker</span>
              </button>
              <button id="btn-open-message-dialog" class="btn btn-outline" title="Show Native Alert Box">
                ${renderIcon("Info", { size: 16 })}
                <span>Alert Box</span>
              </button>
              <button id="btn-open-confirm-dialog" class="btn btn-outline" title="Show Confirm Dialog">
                ${renderIcon("CheckSquare", { size: 16 })}
                <span>Confirm</span>
              </button>
            </div>
          </div>

          <!-- Test 2: System Notifications -->
          <div class="test-card">
            <div class="test-card-top">
              <div class="test-icon-wrap">
                ${renderIcon("Bell", { size: 22, class: "text-sky-400" })}
              </div>
              <div class="test-info">
                <h4>Desktop Notifications</h4>
                <p>Verifies OS notification service permissions, banner display, and action routing.</p>
              </div>
            </div>
            <div class="test-btn-group">
              <button id="btn-trigger-notification" class="btn btn-primary btn-glow-sky" title="Trigger System Notification">
                ${renderIcon("Bell", { size: 16 })}
                <span>Trigger Notification</span>
              </button>
            </div>
          </div>

          <!-- Test 3: Disk IO & State -->
          <div class="test-card">
            <div class="test-card-top">
              <div class="test-icon-wrap">
                ${renderIcon("HardDrive", { size: 22, class: "text-emerald-400" })}
              </div>
              <div class="test-info">
                <h4>Platform Disk IO & State</h4>
                <p>Resolves OS AppData/Config paths, executes round-trip atomic write, read, and checksum.</p>
              </div>
            </div>
            <div class="test-btn-group">
              <button id="btn-test-disk-io" class="btn btn-primary btn-glow-emerald" title="Run Disk IO Benchmark">
                ${renderIcon("Database", { size: 16 })}
                <span>Disk IO / State Test</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Disk IO Detailed Probe Result Card -->
        <div id="disk-io-result-card" class="disk-io-container">
          <div class="disk-result-box placeholder">
            <div class="result-header">
              ${renderIcon("HardDrive", { size: 18, class: "text-slate-400" })}
              <span>Platform Config / AppData Directory Resolver: Awaiting "Disk IO / State Test" trigger...</span>
            </div>
          </div>
        </div>

        <!-- System Action Log Console -->
        <div class="system-log-card">
          <div class="log-header">
            <div class="log-title">
              ${renderIcon("Terminal", { size: 16, class: "text-cyan-400" })}
              <span>Platform Inspector Event Log</span>
            </div>
            <button id="btn-clear-test-logs" class="btn btn-subtle btn-xs">Clear Log</button>
          </div>
          <div id="native-test-log-output" class="log-body font-mono">
            <!-- Dynamically populated -->
          </div>
        </div>
      </section>
    `;
  }
}
