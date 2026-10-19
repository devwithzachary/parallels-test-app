import { renderIcon } from "../icons";

export type SandboxMode = "borders" | "typography" | "icons" | "contrast";

export class StressSandboxManager {
  private container: HTMLElement;
  private currentScale: number = 1.0;
  private currentMode: SandboxMode = "borders";
  private fontSmoothing: "subpixel" | "antialiased" = "antialiased";

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  public getScale(): number {
    return this.currentScale;
  }

  private init() {
    this.render();
    this.bindEvents();
  }

  private setScale(scale: number) {
    this.currentScale = scale;
    const stage = this.container.querySelector("#sandbox-test-stage") as HTMLElement;
    const scaleDisplay = this.container.querySelector("#sandbox-scale-label");
    if (stage) {
      stage.style.transform = `scale(${scale})`;
    }
    if (scaleDisplay) {
      scaleDisplay.textContent = `${Math.round(scale * 100)}% (${scale.toFixed(2)}x)`;
    }

    // Update active button state
    this.container.querySelectorAll(".scale-btn").forEach((btn) => {
      const s = parseFloat(btn.getAttribute("data-scale") || "1");
      if (s === scale) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  private setMode(mode: SandboxMode) {
    this.currentMode = mode;
    this.container.querySelectorAll(".mode-tab-btn").forEach((btn) => {
      if (btn.getAttribute("data-mode") === mode) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    this.renderActiveStage();
  }

  private toggleFontSmoothing() {
    this.fontSmoothing =
      this.fontSmoothing === "antialiased" ? "subpixel" : "antialiased";
    const stage = this.container.querySelector("#sandbox-test-stage") as HTMLElement;
    if (stage) {
      if (this.fontSmoothing === "antialiased") {
        stage.classList.remove("subpixel-smooth");
        stage.classList.add("standard-smooth");
      } else {
        stage.classList.remove("standard-smooth");
        stage.classList.add("subpixel-smooth");
      }
    }
    const btn = this.container.querySelector("#btn-toggle-font-smoothing");
    if (btn) {
      btn.textContent = `Font Smoothing: ${this.fontSmoothing.toUpperCase()}`;
    }
  }

  private renderActiveStage() {
    const stage = this.container.querySelector("#sandbox-test-stage");
    if (!stage) return;

    if (this.currentMode === "borders") {
      stage.innerHTML = `
        <div class="sandbox-view-borders">
          <div class="view-header">
            <h4>Subpixel Border & Hairline Alignment Suite</h4>
            <p>Spot hairline clipping, rounding errors, and anti-aliasing color bleed between platforms.</p>
          </div>

          <!-- Crosshairs & Pixel Grid Alignment -->
          <div class="reticle-test-row">
            <div class="reticle-box">
              <div class="reticle-label">0.5px Hairline Reticle</div>
              <div class="reticle-crosshair border-half-px">
                <div class="cross-h"></div>
                <div class="cross-v"></div>
                <div class="reticle-circle"></div>
              </div>
            </div>

            <div class="reticle-box">
              <div class="reticle-label">1.0px Exact Alignment</div>
              <div class="reticle-crosshair border-1px">
                <div class="cross-h"></div>
                <div class="cross-v"></div>
                <div class="reticle-circle"></div>
              </div>
            </div>

            <div class="reticle-box">
              <div class="reticle-label">1.5px Fractional Reticle</div>
              <div class="reticle-crosshair border-fractional">
                <div class="cross-h"></div>
                <div class="cross-v"></div>
                <div class="reticle-circle"></div>
              </div>
            </div>

            <div class="reticle-box">
              <div class="reticle-label">2.0px Heavy Reticle</div>
              <div class="reticle-crosshair border-2px">
                <div class="cross-h"></div>
                <div class="cross-v"></div>
                <div class="reticle-circle"></div>
              </div>
            </div>
          </div>

          <!-- Nested Border Scaling Ladders -->
          <div class="border-ladder-grid">
            <div class="border-card border-0-5">
              <span class="badge">0.5px Border</span>
              <p>Minimal fractional boundary. WebKit vs Blink/WebView2 subpixel rounding test.</p>
              <div class="nested-box inner-0-5">Inner 0.5px box</div>
            </div>

            <div class="border-card border-1-0">
              <span class="badge">1.0px Standard</span>
              <p>Integer border. Validates crisp non-fractional snap across display densities.</p>
              <div class="nested-box inner-1-0">Inner 1.0px box</div>
            </div>

            <div class="border-card border-1-25">
              <span class="badge">1.25px Scale</span>
              <p>Simulates Windows 125% DPI scale rounding artifacts on standard UI chrome.</p>
              <div class="nested-box inner-1-25">Inner 1.25px box</div>
            </div>

            <div class="border-card border-1-5">
              <span class="badge">1.50px Scale</span>
              <p>Simulates 150% fractional display scaling (common on Windows 11 ARM laptops).</p>
              <div class="nested-box inner-1-5">Inner 1.5px box</div>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentMode === "typography") {
      stage.innerHTML = `
        <div class="sandbox-view-typography">
          <div class="view-header">
            <h4>Typography Scale, Kerning, & Rendering Engine Test</h4>
            <p>Comparing FreeType (Linux), DirectWrite (Windows), and CoreText (macOS) rendering side-by-side.</p>
          </div>

          <div class="typography-ladder">
            <div class="type-row">
              <span class="type-metric">8pt / 11px</span>
              <span class="type-sample sample-8pt">The quick brown fox jumps over the lazy dog • 0123456789 (0x7F)</span>
            </div>
            <div class="type-row">
              <span class="type-metric">9pt / 12px</span>
              <span class="type-sample sample-9pt">The quick brown fox jumps over the lazy dog • 0123456789 [0x7F]</span>
            </div>
            <div class="type-row">
              <span class="type-metric">10pt / 13px</span>
              <span class="type-sample sample-10pt">The quick brown fox jumps over the lazy dog • 0123456789 {MatrixApp}</span>
            </div>
            <div class="type-row">
              <span class="type-metric">11pt / 14px</span>
              <span class="type-sample sample-11pt">The quick brown fox jumps over the lazy dog • 0123456789 &lt;System&gt;</span>
            </div>
            <div class="type-row">
              <span class="type-metric">12pt / 16px</span>
              <span class="type-sample sample-12pt">The quick brown fox jumps over the lazy dog • 0123456789 ±$%^&*</span>
            </div>
            <div class="type-row">
              <span class="type-metric">14pt / 18px</span>
              <span class="type-sample sample-14pt">The quick brown fox jumps over the lazy dog • 0123456789</span>
            </div>
            <div class="type-row">
              <span class="type-metric">18pt / 24px</span>
              <span class="type-sample sample-18pt">The quick brown fox jumps over the lazy dog</span>
            </div>
          </div>

          <!-- Monospace Tabular Alignment -->
          <div class="tabular-test-card">
            <h5>Tabular Monospace Column Alignment (Zero Drift Check)</h5>
            <div class="tabular-grid font-mono">
              <div class="col-head">OFFSET</div>
              <div class="col-head">HEX DATA</div>
              <div class="col-head">ASCII</div>
              <div class="col-head">METRIC</div>

              <div>00000000</div>
              <div>4D 41 54 52 49 58 20 41</div>
              <div>MATRIX A</div>
              <div>+0.000 ms</div>

              <div>00000008</div>
              <div>50 50 20 54 41 55 52 49</div>
              <div>PP TAURI</div>
              <div>+1.250 ms</div>

              <div>00000010</div>
              <div>56 32 20 56 49 54 45 20</div>
              <div>V2 VITE </div>
              <div>+2.500 ms</div>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentMode === "icons") {
      stage.innerHTML = `
        <div class="sandbox-view-icons">
          <div class="view-header">
            <h4>Vector SVG Icon Crispness Matrix</h4>
            <p>Tests anti-aliased SVG rasterization across discrete bounding box sizes (12px to 48px).</p>
          </div>

          <div class="icon-scale-matrix">
            <div class="icon-scale-column">
              <span class="col-size-label">12px (Micro)</span>
              <div class="icon-box-grid size-12">
                <div class="icon-cell" title="Cpu 12px">${renderIcon("Cpu", { size: 12 })}</div>
                <div class="icon-cell" title="Terminal 12px">${renderIcon("Terminal", { size: 12 })}</div>
                <div class="icon-cell" title="HardDrive 12px">${renderIcon("HardDrive", { size: 12 })}</div>
                <div class="icon-cell" title="Activity 12px">${renderIcon("Activity", { size: 12 })}</div>
              </div>
            </div>

            <div class="icon-scale-column">
              <span class="col-size-label">16px (Standard)</span>
              <div class="icon-box-grid size-16">
                <div class="icon-cell" title="Cpu 16px">${renderIcon("Cpu", { size: 16 })}</div>
                <div class="icon-cell" title="Terminal 16px">${renderIcon("Terminal", { size: 16 })}</div>
                <div class="icon-cell" title="HardDrive 16px">${renderIcon("HardDrive", { size: 16 })}</div>
                <div class="icon-cell" title="Activity 16px">${renderIcon("Activity", { size: 16 })}</div>
              </div>
            </div>

            <div class="icon-scale-column">
              <span class="col-size-label">20px (Medium)</span>
              <div class="icon-box-grid size-20">
                <div class="icon-cell" title="Cpu 20px">${renderIcon("Cpu", { size: 20 })}</div>
                <div class="icon-cell" title="Terminal 20px">${renderIcon("Terminal", { size: 20 })}</div>
                <div class="icon-cell" title="HardDrive 20px">${renderIcon("HardDrive", { size: 20 })}</div>
                <div class="icon-cell" title="Activity 20px">${renderIcon("Activity", { size: 20 })}</div>
              </div>
            </div>

            <div class="icon-scale-column">
              <span class="col-size-label">24px (Large)</span>
              <div class="icon-box-grid size-24">
                <div class="icon-cell" title="Cpu 24px">${renderIcon("Cpu", { size: 24 })}</div>
                <div class="icon-cell" title="Terminal 24px">${renderIcon("Terminal", { size: 24 })}</div>
                <div class="icon-cell" title="HardDrive 24px">${renderIcon("HardDrive", { size: 24 })}</div>
                <div class="icon-cell" title="Activity 24px">${renderIcon("Activity", { size: 24 })}</div>
              </div>
            </div>

            <div class="icon-scale-column">
              <span class="col-size-label">36px (Display)</span>
              <div class="icon-box-grid size-36">
                <div class="icon-cell" title="Cpu 36px">${renderIcon("Cpu", { size: 36 })}</div>
                <div class="icon-cell" title="Terminal 36px">${renderIcon("Terminal", { size: 36 })}</div>
                <div class="icon-cell" title="HardDrive 36px">${renderIcon("HardDrive", { size: 36 })}</div>
                <div class="icon-cell" title="Activity 36px">${renderIcon("Activity", { size: 36 })}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentMode === "contrast") {
      stage.innerHTML = `
        <div class="sandbox-view-contrast">
          <div class="view-header">
            <h4>Luminance, Gamma, & Chroma Ramp</h4>
            <p>Exposes gamma banding, bit depth differences, and color profile mismatches between platforms.</p>
          </div>

          <!-- 16-Step Grayscale Ramp -->
          <div class="contrast-block">
            <span class="ramp-title">16-Step Quantized Grayscale (Black 0% to White 100%)</span>
            <div class="gray-ramp">
              <div style="background:#000000" title="0%"></div>
              <div style="background:#111111" title="6.6%"></div>
              <div style="background:#222222" title="13.3%"></div>
              <div style="background:#333333" title="20%"></div>
              <div style="background:#444444" title="26.6%"></div>
              <div style="background:#555555" title="33.3%"></div>
              <div style="background:#666666" title="40%"></div>
              <div style="background:#777777" title="46.6%"></div>
              <div style="background:#888888" title="53.3%"></div>
              <div style="background:#999999" title="60%"></div>
              <div style="background:#aaaaaa" title="66.6%"></div>
              <div style="background:#bbbbbb" title="73.3%"></div>
              <div style="background:#cccccc" title="80%"></div>
              <div style="background:#dddddd" title="86.6%"></div>
              <div style="background:#eeeeee" title="93.3%"></div>
              <div style="background:#ffffff" title="100%"></div>
            </div>
          </div>

          <!-- Cyber Gradient Smoothness Ramp -->
          <div class="contrast-block">
            <span class="ramp-title">Continuous High-Dynamic Gradient Spectrum</span>
            <div class="color-ramp-strip ramp-cyber"></div>
            <div class="color-ramp-strip ramp-emerald"></div>
            <div class="color-ramp-strip ramp-sunset"></div>
          </div>
        </div>
      `;
    }
  }

  private bindEvents() {
    // Scaling toggles
    this.container.querySelectorAll(".scale-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const scale = parseFloat(btn.getAttribute("data-scale") || "1.0");
        this.setScale(scale);
      });
    });

    // Mode tabs
    this.container.querySelectorAll(".mode-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode") as SandboxMode;
        if (mode) this.setMode(mode);
      });
    });

    // Font smoothing toggle
    this.container.querySelector("#btn-toggle-font-smoothing")?.addEventListener("click", () => {
      this.toggleFontSmoothing();
    });

    // Reset scale button
    this.container.querySelector("#btn-reset-scale")?.addEventListener("click", () => {
      this.setScale(1.0);
    });
  }

  public render() {
    this.container.innerHTML = `
      <section class="stress-sandbox-section" aria-label="Platform Stress & Scaling Sandbox">
        <div class="section-header">
          <div class="section-title-group">
            <div class="icon-chip chip-purple">
              ${renderIcon("Layers", { size: 18 })}
            </div>
            <div>
              <h3>Platform Stress & Scaling Sandbox</h3>
              <p class="section-subtitle">Side-by-side rendering, subpixel boundaries, and fractional scaling inspection.</p>
            </div>
          </div>

          <!-- Sandbox Controls Bar -->
          <div class="sandbox-controls">
            <!-- Mode Switcher Tabs -->
            <div class="mode-tabs">
              <button class="mode-tab-btn active" data-mode="borders">
                ${renderIcon("LayoutGrid", { size: 14 })}
                <span>Borders</span>
              </button>
              <button class="mode-tab-btn" data-mode="typography">
                ${renderIcon("FileCode", { size: 14 })}
                <span>Typography</span>
              </button>
              <button class="mode-tab-btn" data-mode="icons">
                ${renderIcon("Sparkles", { size: 14 })}
                <span>Vector Icons</span>
              </button>
              <button class="mode-tab-btn" data-mode="contrast">
                ${renderIcon("Eye", { size: 14 })}
                <span>Contrast Ramp</span>
              </button>
            </div>

            <!-- Fractional Scaling Selector -->
            <div class="scaling-selector">
              <span class="scale-label-tag">Zoom Sim:</span>
              <button class="btn btn-xs scale-btn active" data-scale="1.0">100%</button>
              <button class="btn btn-xs scale-btn" data-scale="1.25">125%</button>
              <button class="btn btn-xs scale-btn" data-scale="1.5">150%</button>
              <button class="btn btn-xs scale-btn" data-scale="1.75">175%</button>
              <button class="btn btn-xs scale-btn" data-scale="2.0">200%</button>
            </div>
          </div>
        </div>

        <!-- Scaling Stage Wrapper with active scale indicator -->
        <div class="sandbox-stage-container">
          <div class="stage-toolbar">
            <div class="stage-info">
              <span>Active Simulation Scale: <strong id="sandbox-scale-label" class="highlight-cyan">100% (1.00x)</strong></span>
            </div>
            <div class="stage-actions">
              <button id="btn-toggle-font-smoothing" class="btn btn-subtle btn-xs">Font Smoothing: ANTIALIASED</button>
              <button id="btn-reset-scale" class="btn btn-subtle btn-xs">Reset 1.0x</button>
            </div>
          </div>

          <div class="stage-viewport">
            <div id="sandbox-test-stage" class="test-stage standard-smooth">
              <!-- Dynamically rendered based on active mode -->
            </div>
          </div>
        </div>
      </section>
    `;

    this.renderActiveStage();
  }
}
