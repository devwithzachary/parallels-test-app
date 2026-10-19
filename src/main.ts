import "./style.css";
import { renderIcon } from "./icons";
import { TelemetryManager } from "./components/telemetry";
import { NativeTestsManager } from "./components/native-tests";
import { StressSandboxManager } from "./components/stress-sandbox";

export class App {
  public telemetryManager?: TelemetryManager;
  public nativeTestsManager?: NativeTestsManager;
  public stressSandboxManager?: StressSandboxManager;

  constructor() {
    this.init();
    (window as any).__MATRIX_APP__ = this;
  }

  private init() {
    this.setupTheme();
    this.mountComponents();
    this.checkRuntimeEnvironment();
  }

  private setupTheme() {
    const themeBtn = document.querySelector("#theme-toggle-btn");
    const themeIcon = document.querySelector("#theme-toggle-icon");
    const themeLabel = document.querySelector("#theme-toggle-label");

    const updateThemeUI = (isDark: boolean) => {
      if (themeIcon) {
        themeIcon.innerHTML = isDark
          ? renderIcon("Sun", { size: 14 })
          : renderIcon("Moon", { size: 14 });
      }
      if (themeLabel) {
        themeLabel.textContent = isDark ? "Light" : "Dark";
      }
    };

    // Check saved theme or system preference
    const saved = localStorage.getItem("matrix_theme");
    let isDark = false;
    if (saved === "light" || saved === "dark") {
      isDark = saved === "dark";
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.removeAttribute("data-theme");
    }

    updateThemeUI(isDark);

    themeBtn?.addEventListener("click", () => {
      const currentAttr = document.documentElement.getAttribute("data-theme");
      let nextTheme: "dark" | "light";

      if (currentAttr) {
        nextTheme = currentAttr === "dark" ? "light" : "dark";
      } else {
        const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        nextTheme = sysDark ? "light" : "dark";
      }

      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("matrix_theme", nextTheme);
      updateThemeUI(nextTheme === "dark");
    });

    // React to system preference changes if user hasn't overridden
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("matrix_theme")) {
          updateThemeUI(e.matches);
        }
      });
  }

  private checkRuntimeEnvironment() {
    const pill = document.querySelector("#platform-env-pill");
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

    if (pill) {
      if (isTauri) {
        pill.className = "badge badge-native";
        pill.innerHTML = `${renderIcon("Cpu", { size: 12 })} <span>TAURI V2 NATIVE</span>`;
      } else {
        pill.className = "badge badge-web";
        pill.innerHTML = `${renderIcon("Globe", { size: 12 })} <span>WEB PREVIEW</span>`;
      }
    }
  }

  private mountComponents() {
    const telemetryRoot = document.querySelector("#telemetry-root") as HTMLElement;
    const nativeTestsRoot = document.querySelector("#native-tests-root") as HTMLElement;
    const stressSandboxRoot = document.querySelector("#stress-sandbox-root") as HTMLElement;

    if (telemetryRoot) {
      this.telemetryManager = new TelemetryManager(telemetryRoot);
    }

    if (nativeTestsRoot) {
      this.nativeTestsManager = new NativeTestsManager(nativeTestsRoot);
    }

    if (stressSandboxRoot) {
      this.stressSandboxManager = new StressSandboxManager(stressSandboxRoot);
    }
  }
}

// Bootstrap application safely whether DOM is still loading or ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new App();
  });
} else {
  new App();
}
