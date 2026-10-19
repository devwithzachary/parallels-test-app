use serde::Serialize;
use std::path::PathBuf;
use std::time::{Instant, SystemTime, UNIX_EPOCH};
use tauri::Manager;

#[derive(Debug, Serialize)]
pub struct SystemTelemetry {
    pub os: String,
    pub arch: String,
    pub family: String,
    pub app_version: String,
    pub hostname: String,
}

#[derive(Debug, Serialize)]
pub struct DiskIoResult {
    pub success: bool,
    pub resolved_dir: String,
    pub file_path: String,
    pub bytes_written: usize,
    pub elapsed_ms: f64,
    pub timestamp_epoch_ms: u128,
    pub verified: bool,
    pub error: Option<String>,
}

#[tauri::command]
fn get_system_telemetry() -> SystemTelemetry {
    let hostname = match std::env::var("HOSTNAME")
        .or_else(|_| std::env::var("COMPUTERNAME"))
    {
        Ok(h) => h,
        Err(_) => "Local Device".to_string(),
    };

    SystemTelemetry {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        family: std::env::consts::FAMILY.to_string(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        hostname,
    }
}

#[tauri::command]
fn test_disk_io(app: tauri::AppHandle) -> Result<DiskIoResult, String> {
    let start = Instant::now();

    // Resolve platform-standard directory (AppData/Roaming on Windows, ~/Library/Application Support on macOS, ~/.config on Linux)
    let config_dir: PathBuf = app
        .path()
        .app_config_dir()
        .or_else(|_| app.path().app_data_dir())
        .map_err(|e| format!("Failed to resolve platform app directory: {e}"))?;

    if let Err(e) = std::fs::create_dir_all(&config_dir) {
        return Ok(DiskIoResult {
            success: false,
            resolved_dir: config_dir.display().to_string(),
            file_path: "".to_string(),
            bytes_written: 0,
            elapsed_ms: 0.0,
            timestamp_epoch_ms: 0,
            verified: false,
            error: Some(format!("Failed to create directory: {e}")),
        });
    }

    let file_path = config_dir.join("matrix_state_test.json");
    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);

    let payload = serde_json::json!({
        "generator": "Matrix App Platform Stress & State Test",
        "timestamp_ms": now_ms,
        "platform": std::env::consts::OS,
        "architecture": std::env::consts::ARCH,
        "test_guid": "7e3b9f52-8c10-449a-bd91-039c2980ef51",
        "status": "active_probe",
        "random_entropy": [0x4D, 0x41, 0x54, 0x52, 0x49, 0x58]
    });

    let payload_str = match serde_json::to_string_pretty(&payload) {
        Ok(s) => s,
        Err(e) => {
            return Ok(DiskIoResult {
                success: false,
                resolved_dir: config_dir.display().to_string(),
                file_path: file_path.display().to_string(),
                bytes_written: 0,
                elapsed_ms: 0.0,
                timestamp_epoch_ms: now_ms,
                verified: false,
                error: Some(format!("JSON serialization error: {e}")),
            });
        }
    };

    let bytes_len = payload_str.as_bytes().len();

    // Write file
    if let Err(e) = std::fs::write(&file_path, payload_str.as_bytes()) {
        return Ok(DiskIoResult {
            success: false,
            resolved_dir: config_dir.display().to_string(),
            file_path: file_path.display().to_string(),
            bytes_written: 0,
            elapsed_ms: 0.0,
            timestamp_epoch_ms: now_ms,
            verified: false,
            error: Some(format!("File write error: {e}")),
        });
    }

    // Read back and verify exact byte content
    let read_back = match std::fs::read_to_string(&file_path) {
        Ok(content) => content,
        Err(e) => {
            return Ok(DiskIoResult {
                success: false,
                resolved_dir: config_dir.display().to_string(),
                file_path: file_path.display().to_string(),
                bytes_written: bytes_len,
                elapsed_ms: start.elapsed().as_micros() as f64 / 1000.0,
                timestamp_epoch_ms: now_ms,
                verified: false,
                error: Some(format!("File readback error: {e}")),
            });
        }
    };

    let verified = read_back == payload_str;
    let elapsed_ms = start.elapsed().as_micros() as f64 / 1000.0;

    Ok(DiskIoResult {
        success: true,
        resolved_dir: config_dir.display().to_string(),
        file_path: file_path.display().to_string(),
        bytes_written: bytes_len,
        elapsed_ms,
        timestamp_epoch_ms: now_ms,
        verified,
        error: None,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            get_system_telemetry,
            test_disk_io
        ])
        .run(tauri::generate_context!())
        .expect("error while running matrix-app tauri application");
}
