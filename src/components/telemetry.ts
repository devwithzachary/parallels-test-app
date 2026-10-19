import { renderIcon } from "../icons";
import { invoke } from "@tauri-apps/api/core";

export interface SystemTelemetryData {
  os: string;
  arch: string;
  family: string;
  app_version: string;
  hostname: string;
}

export interface WindowMetrics {
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  colorScheme: "dark" | "light";
  isTauri: boolean;
}

export class TelemetryManager {
  private container: HTMLElement;
  private telemetry: SystemTelemetryData = {
    os: "detecting...",
    arch: "detecting...",
    family: "detecting...",
    app_version: "0.1.0",
    hostname: "detecting...",
  };
  private metrics: WindowMetrics = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
    colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
    isTauri: false,
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private async init() {
    this.checkEnvironment();
    this.setupListeners();
    this.render();
    try {
      await this.fetchBackendTelemetry();
      this.render();
    } catch (e) {
      console.warn("Backend telemetry fetch error:", e);
    }
  }

  private checkEnvironment() {
    this.metrics.isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  }

  private setupListeners() {
    // Dynamic update on window resize
    window.addEventListener("resize", () => {
      this.updateMetrics();
    });

    // Dynamic update on color scheme change
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", (e) => {
      this.metrics.colorScheme = e.matches ? "dark" : "light";
      this.updateMetrics();
    });

    // Observe document theme change attribute
    const observer = new MutationObserver(() => {
      const activeTheme = document.documentElement.getAttribute("data-theme");
      if (activeTheme === "dark" || activeTheme === "light") {
        this.metrics.colorScheme = activeTheme;
      } else {
        this.metrics.colorScheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      }
      this.updateMetrics();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  private async fetchBackendTelemetry() {
    try {
      if (this.metrics.isTauri) {
        const data = await invoke<SystemTelemetryData>("get_system_telemetry");
        this.telemetry = data;
      } else {
        // Web fallback heuristics
        const ua = navigator.userAgent.toLowerCase();
        let os = "linux";
        if (ua.includes("mac")) os = "macos";
        else if (ua.includes("win")) os = "windows";

        let arch = "arm64 / aarch64";
        if (ua.includes("x86_64") || ua.includes("win64") || ua.includes("wow64")) {
          arch = "x86_64";
        }

        this.telemetry = {
          os,
          arch,
          family: os === "windows" ? "windows" : "unix",
          app_version: "0.1.0 (web-preview)",
          hostname: window.location.hostname || "local-web-host",
        };
      }
    } catch (err) {
      console.warn("Failed to fetch backend telemetry:", err);
    }
  }

  private updateMetrics() {
    this.metrics.innerWidth = window.innerWidth;
    this.metrics.innerHeight = window.innerHeight;
    this.metrics.outerWidth = window.outerWidth;
    this.metrics.outerHeight = window.outerHeight;
    this.metrics.screenWidth = window.screen.width;
    this.metrics.screenHeight = window.screen.height;
    this.metrics.devicePixelRatio = window.devicePixelRatio || 1;

    const activeTheme = document.documentElement.getAttribute("data-theme");
    if (activeTheme === "dark" || activeTheme === "light") {
      this.metrics.colorScheme = activeTheme;
    } else {
      this.metrics.colorScheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
    }

    this.render();
  }

  public getPlatformIcon(os: string): string {
    const norm = os.toLowerCase();
    if (norm.includes("mac") || norm.includes("darwin")) {
      return renderIcon("Apple", { size: 24, class: "text-cyan-400" });
    }
    if (norm.includes("win")) {
      return renderIcon("LayoutGrid", { size: 24, class: "text-blue-400" });
    }
    return renderIcon("Terminal", { size: 24, class: "text-emerald-400" });
  }

  public getPlatformBadgeClass(os: string): string {
    const norm = os.toLowerCase();
    if (norm.includes("mac") || norm.includes("darwin")) return "badge-macos";
    if (norm.includes("win")) return "badge-windows";
    return "badge-linux";
  }

  public render() {
    const { os, arch, family, app_version, hostname } = this.telemetry;
    const {
      innerWidth,
      innerHeight,
      outerWidth,
      outerHeight,
      screenWidth,
      screenHeight,
      devicePixelRatio,
      colorScheme,
      isTauri,
    } = this.metrics;

    const dpiEquivalent = Math.round(devicePixelRatio * 96);
    const osBadgeClass = this.getPlatformBadgeClass(os);
    const platformIcon = this.getPlatformIcon(os);

    this.container.innerHTML = `
      <section class="telemetry-hero" aria-label="System Telemetry">
        <div class="telemetry-header">
          <div class="telemetry-title-group">
            <span class="live-dot-pulse" title="Telemetry Live Stream Active"></span>
            <h2>System Telemetry & Platform Diagnostics</h2>
            <span class="runtime-badge ${isTauri ? "badge-native" : "badge-web"}">
              ${isTauri ? renderIcon("Cpu", { size: 14 }) + " Tauri v2 IPC" : renderIcon("Globe", { size: 14 }) + " Browser Preview"}
            </span>
          </div>
          <div class="telemetry-actions">
            <button id="refresh-telemetry-btn" class="btn btn-subtle btn-sm" title="Refresh Telemetry">
              ${renderIcon("RefreshCw", { size: 14 })}
              <span>Poll Refresh</span>
            </button>
          </div>
        </div>

        <div class="telemetry-grid">
          <!-- Card 1: OS & Architecture -->
          <div class="telemetry-card card-glow-cyan">
            <div class="card-icon-header">
              <div class="card-icon-wrap">
                ${platformIcon}
              </div>
              <span class="card-tag ${osBadgeClass}">${os.toUpperCase()}</span>
            </div>
            <div class="card-body">
              <div class="metric-label">Target OS & Architecture</div>
              <div class="metric-value font-mono">
                <span class="highlight-cyan">${os}</span>
                <span class="divider">/</span>
                <span class="highlight-purple">${arch}</span>
              </div>
              <div class="metric-subtext">
                <span>Family: <strong>${family}</strong></span>
                <span class="dot-sep">•</span>
                <span>Host: <strong>${hostname}</strong></span>
              </div>
            </div>
          </div>

          <!-- Card 2: Resolution & Viewport -->
          <div class="telemetry-card card-glow-blue">
            <div class="card-icon-header">
              <div class="card-icon-wrap">
                ${renderIcon("Maximize2", { size: 24, class: "text-sky-400" })}
              </div>
              <span class="card-tag badge-metric">LIVE RES</span>
            </div>
            <div class="card-body">
              <div class="metric-label">Viewport & Window Geometry</div>
              <div class="metric-value font-mono">
                <span class="highlight-blue">${innerWidth}</span>
                <span class="metric-unit">×</span>
                <span class="highlight-blue">${innerHeight}</span>
                <span class="metric-unit">px</span>
              </div>
              <div class="metric-subtext">
                <span>Outer: <strong>${outerWidth}×${outerHeight}</strong></span>
                <span class="dot-sep">•</span>
                <span>Screen: <strong>${screenWidth}×${screenHeight}</strong></span>
              </div>
            </div>
          </div>

          <!-- Card 3: Display Scale Factor (DPI) -->
          <div class="telemetry-card card-glow-emerald">
            <div class="card-icon-header">
              <div class="card-icon-wrap">
                ${renderIcon("Sliders", { size: 24, class: "text-emerald-400" })}
              </div>
              <span class="card-tag badge-scale">${devicePixelRatio.toFixed(2)}x DPR</span>
            </div>
            <div class="card-body">
              <div class="metric-label">Display Scale Factor & DPI</div>
              <div class="metric-value font-mono">
                <span class="highlight-emerald">${devicePixelRatio.toFixed(3)}</span>
                <span class="metric-unit">scale</span>
              </div>
              <div class="metric-subtext">
                <span>Density: <strong>~${dpiEquivalent} DPI</strong></span>
                <span class="dot-sep">•</span>
                <span>Subpixel: <strong>${devicePixelRatio % 1 === 0 ? "Integer (1:1)" : "Fractional"}</strong></span>
              </div>
            </div>
          </div>

          <!-- Card 4: Color Scheme & Theme -->
          <div class="telemetry-card card-glow-amber">
            <div class="card-icon-header">
              <div class="card-icon-wrap">
                ${
                  colorScheme === "dark"
                    ? renderIcon("Moon", { size: 24, class: "text-amber-400" })
                    : renderIcon("Sun", { size: 24, class: "text-amber-500" })
                }
              </div>
              <span class="card-tag badge-theme">${colorScheme.toUpperCase()}</span>
            </div>
            <div class="card-body">
              <div class="metric-label">Active Color Theme</div>
              <div class="metric-value font-mono">
                <span class="highlight-amber">${colorScheme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <div class="metric-subtext">
                <span>System CSS: <strong>prefers-${colorScheme}</strong></span>
                <span class="dot-sep">•</span>
                <span>Ver: <strong>v${app_version}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Attach refresh button listener
    const refreshBtn = this.container.querySelector("#refresh-telemetry-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        refreshBtn.classList.add("spin");
        await this.fetchBackendTelemetry();
        this.updateMetrics();
        setTimeout(() => refreshBtn.classList.remove("spin"), 500);
      });
    }
  }
}
