# Matrix App

A high-performance, visually polished cross-platform desktop demonstration application built with **Tauri v2**, **Vite**, and **TypeScript**. 

Matrix App is engineered specifically for testing, demonstrating, and comparing native window behavior, DPI scaling, system telemetry, and platform integrations side-by-side on camera across **macOS (Apple Silicon)**, **Windows 11 ARM**, and **Ubuntu Linux ARM**.

---

## Key Features

1. **Hero Dashboard & Live Telemetry Card**:
   - Running Operating System (`macOS`, `Windows`, `Linux`) and architecture (`aarch64` / `x86_64`).
   - Live Viewport & Window Geometry (`innerWidth × innerHeight`, `outerWidth × outerHeight`, `screen.width × screen.height`).
   - Display Scale Factor & DPI (`window.devicePixelRatio` and estimated DPI density).
   - Active Color Theme (`dark` / `light`) dynamically synced with system `prefers-color-scheme` and manual override toggle.
   - Dynamic real-time updates on window resize or system theme change.

2. **Native System Integration Tests**:
   - **Native Dialogs**: Tests native OS file picker (`open()`), message alert box (`message()`), and confirmation prompt (`ask()`).
   - **Desktop Notifications**: Validates OS notification service permissions, requests permission if ungranted, and dispatches native desktop toasts.
   - **Platform Disk IO & State Persistence**: Resolves platform-standard config/AppData directory (`~/Library/Application Support/` on macOS, `%APPDATA%` on Windows, `~/.config/` on Linux), executes round-trip atomic write, read, and checksum verification, displaying exact resolved path and microsecond latency.
   - **Platform Inspector Event Log**: Timestamped console capturing all native IPC actions.

3. **Platform Stress & Scaling Sandbox**:
   - **Fractional Scaling Simulator**: Zoom toggle between 100%, 125%, 150%, 175%, and 200% to inspect fractional scaling behavior.
   - **Subpixel Border & Hairline Reticle**: 0.5px, 1.0px, 1.25px, 1.5px, and 2.0px borders with crosshair reticles to expose anti-aliasing color bleed and pixel snapping differences between WebKit (macOS), WebView2 (Windows 11 ARM), and WebKitGTK (Linux ARM).
   - **Typography Scale & Antialiasing Ladder**: 8pt through 24pt text samples with tabular alignment grid and font smoothing toggle (`antialiased` vs `subpixel-antialiased`).
   - **Vector SVG Crispness Matrix**: Multi-scale rasterization matrix (12px to 36px) testing SVG icon crispness.
   - **Gamma, Luminance, & Chroma Ramp**: 16-step quantized grayscale and continuous gradient spectrum to test monitor color profiles and display bit depth.

---

## Project Structure

```
matrix-app/
├── package.json                   # Vite, Tauri v2 CLI, Lucide, TypeScript scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── vite.config.ts                 # Vite dev server with Tauri port forwarding
├── index.html                     # HTML5 entrypoint with SEO & theme preload script
├── app-icon.svg                   # Master vector icon
├── src/
│   ├── main.ts                    # Application bootstrapping & theme lifecycle
│   ├── style.css                  # Modern cyber-clean design system (CSS variables, glassmorphism)
│   ├── icons.ts                   # Lucide icon wrappers & SVG helpers
│   └── components/
│       ├── telemetry.ts           # Hero dashboard telemetry (OS, Arch, Scale, Resolution, DPI, Theme)
│       ├── native-tests.ts        # Native integration tests (Dialog, Notification, Disk IO)
│       └── stress-sandbox.ts      # Fractional scaling, subpixel borders, typography & icon stress tests
└── src-tauri/
    ├── Cargo.toml                 # Tauri v2 dependencies and plugins (dialog, notification, fs, os)
    ├── tauri.conf.json            # Tauri v2 bundle targets (.dmg/.app, .msi/.exe, .deb/AppImage)
    ├── build.rs                   # Tauri v2 build script
    ├── capabilities/
    │   └── default.json           # Permissions for dialog, notification, fs, and app lifecycle
    ├── src/
    │   ├── lib.rs                 # Core Tauri plugin registration and command handlers
    │   └── main.rs                # Tauri entrypoint
    └── icons/                     # Multi-resolution app icons (.icns, .ico, .png)
```

---

## Platform Build & Run Instructions

### 1. macOS (Apple Silicon / Intel)

#### Prerequisites
- Xcode Command Line Tools: `xcode-select --install`
- Node.js (v18+) and npm
- Rust toolchain:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  source "$HOME/.cargo/env"
  ```

#### Commands
```bash
# Install dependencies
npm install

# Run local development server with hot reload
npm run tauri:dev

# Build production bundle (.app and .dmg)
npm run tauri:build
```
Bundles generated at:
- `src-tauri/target/release/bundle/macos/Matrix App.app`
- `src-tauri/target/release/bundle/dmg/Matrix App_0.1.0_aarch64.dmg`

---

### 2. Windows 11 ARM (Snapdragon X / VM / Parallels)

#### Prerequisites
- Windows 11 ARM with WebView2 Runtime (installed by default).
- Visual Studio 2022 C++ Build Tools with **MSVC v143 - VS 2022 C++ ARM64 build tools** checked.
- Node.js (v18+) and npm.
- Rust toolchain targeting ARM64:
  ```powershell
  # In PowerShell / Command Prompt:
  curl.exe --proto '=https' --tlsv1.2 -sSf https://win.rustup.rs -o rustup-init.exe
  .\rustup-init.exe -y --default-host aarch64-pc-windows-msvc
  ```
- NSIS or WiX for installer packaging:
  ```powershell
  winget install NSIS.NSIS
  ```

#### Commands
```powershell
# Install dependencies
npm install

# Run local development server with hot reload
npm run tauri:dev

# Build production bundle (.exe NSIS installer and .msi)
npm run tauri:build
```
Bundles generated at:
- `src-tauri/target/release/bundle/nsis/Matrix App_0.1.0_arm64-setup.exe`
- `src-tauri/target/release/bundle/msi/Matrix App_0.1.0_arm64.msi`

---

### 3. Ubuntu Linux ARM (ARM64 / UTM / Parallels / Raspberry Pi 5)

#### Prerequisites
- Install system development libraries:
  ```bash
  sudo apt update
  sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
  ```
- Node.js (v18+) and npm:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  ```
- Rust toolchain:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  source "$HOME/.cargo/env"
  ```

#### Commands
```bash
# Install dependencies
npm install

# Run local development server with hot reload
npm run tauri:dev

# Build production bundle (.deb and .AppImage)
npm run tauri:build
```
Bundles generated at:
- `src-tauri/target/release/bundle/deb/matrix-app_0.1.0_arm64.deb`
- `src-tauri/target/release/bundle/appimage/Matrix App_0.1.0_arm64.AppImage`

---

## Network Share & VM Shared Folder Guidance

When running this repository mounted over a network share (SMB / NFS) or a Virtual Machine shared folder (Parallels Shared Folders, VMware Shared Folders, or Virtio-FS):

1. **Clean Relative Paths**: All configuration files (`vite.config.ts`, `tauri.conf.json`, `Cargo.toml`) use relative paths. There are no absolute host paths hardcoded.
2. **Cargo Target Directory Optimization**:
   To prevent filesystem locking issues or performance degradation over network filesystems, set the Cargo target directory to a local fast drive on each guest machine:
   ```bash
   # On macOS / Linux:
   export CARGO_TARGET_DIR="/tmp/matrix-app-target"
   npm run tauri:dev

   # On Windows (PowerShell):
   $env:CARGO_TARGET_DIR="C:\temp\matrix-app-target"
   npm run tauri:dev
   ```
3. **Vite Host Listening**: `vite.config.ts` is configured with `host: "0.0.0.0"` and `strictPort: true` so the dev server can be seamlessly accessed across local networks and VM boundaries.
