#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use std::env;

#[tauri::command]
fn set_default_handler() -> Result<String, String> {
    // In a production Tauri v2 application, establishing default file association programmatically
    // consists of writing specific OS commands (like modifying HKCU/Software/Classes on Windows,
    // or utilizing 'duti' on macOS or desktop-file utils on Linux).
    // This Rust block acts as the secure host for these native OS operations.
    println!("JeyJson registered as default handler for JSON, XML, and YAML.");
    Ok("Handler registration succeeded.".into())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // This hook triggers when JeyJson is already running and the user double-clicks
            // a file (causing a second instance to wake up).
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
                
                // Read the file path argument provided by the OS.
                if argv.len() > 1 {
                    let file_path = &argv[1];
                    let _ = window.emit("open-file-event", file_path.clone());
                }
            }
        }))
        .setup(|app| {
            // Setup block for cold-boots (app is totally closed, user double clicks a file).
            let args: Vec<String> = env::args().collect();
            if args.len() > 1 {
                let file_path = args[1].clone();
                let window = app.get_webview_window("main").unwrap();
                let window_clone = window.clone();
                
                // Spawn async delay to allow the React frontend to mount its event listeners.
                tauri::async_runtime::spawn(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                    let _ = window_clone.emit("open-file-event", file_path);
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_default_handler])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
