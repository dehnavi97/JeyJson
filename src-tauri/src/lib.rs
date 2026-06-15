#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use std::env;

#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

#[tauri::command]
fn set_default_handler() -> Result<String, String> {
    // بررسی اینکه آیا سیستم‌عامل کاربر ویندوز است یا خیر
    #[cfg(target_os = "windows")]
    {
        // ۱. پیدا کردن مسیر دقیق و فعلی فایل exe برنامه شما
        let current_exe = env::current_exe()
            .map_err(|e| format!("Failed to get current exe path: {}", e))?;
        let exe_path = current_exe.to_string_lossy().to_string();

        // ۲. دسترسی به بخش کلاس‌های کاربر جاری (نیاز به دسترسی Admin ندارد)
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let classes_key = hkcu
            .open_subkey_with_flags("Software\\Classes", KEY_ALL_ACCESS)
            .map_err(|e| format!("Failed to open Software\\Classes: {}", e))?;

        // ۳. ساخت یک Class Type اختصاصی برای برنامه JeyJson
        let (jeyjson_key, _) = classes_key
            .create_subkey("JeyJson.Assoc")
            .map_err(|e| format!("Failed to create JeyJson class: {}", e))?;
        jeyjson_key.set_value("", &"JeyJson Document").unwrap();

        // ۴. معرفی مسیر فایل exe به عنوان دستگیره اصلی باز کردن فایل (shell\open\command)
        let (command_key, _) = jeyjson_key
            .create_subkey("shell\\open\\command")
            .map_err(|e| format!("Failed to create shell command key: {}", e))?;
        
        // فرمت استاندارد ویندوز: "C:\path\to\JeyJson.exe" "%1"
        let command_value = format!("\"{}\" \"%1\"", exe_path);
        command_key.set_value("", &command_value).unwrap();

        // ۵. متصل کردن پسوندهای مد نظر به کلاس JeyJson.Assoc
        let extensions = vec![".json", ".xml", ".yaml", ".yml", ".txt"];
        for ext in extensions {
            let (ext_key, _) = classes_key
                .create_subkey(ext)
                .map_err(|e| format!("Failed to create extension key for {}", ext))?;
            
            // مقدار پیش‌فرض پسوند را برابر با کلاس برنامه‌مان قرار می‌دهیم
            let _ = ext_key.set_value("", &"JeyJson.Assoc");
        }

        println!("JeyJson successfully registered in Windows Registry for extensions.");
        Ok("برنامه با موفقیت به عنوان بازکننده پیش‌فرض فایلهای متنی و جیسون در رجیستری ثبت شد.".into())
    }

    // لایه محافظتی برای سیستم‌عامل‌های دیگر (مک و لینوکس) که کدهای فوق روی آنها اجرا نمی‌شود
    #[cfg(not(target_os = "windows"))]
    {
        // در لینوکس/مک سیستم متفاوت است و ترجیحاً بر اساس استاندارد سیستم‌عامل در پکیج نصبی (dmg/deb) اعمال می‌شود.
        Ok("این قابلیت در حال حاضر برای سیستم‌عامل شما به صورت خودکار در پکیج نصب فعال است.".into())
    }
}

// تغییر نام تابع از main به pub fn run برای هماهنگی کامل با main.rs پروژه شما
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
                    // استفاده از آدرس‌دهی مستقیم Emitter برای رفع ارور کامپایلر
                    let _ = tauri::Emitter::emit(&window, "open-file-event", file_path.clone());
                }
            }
        }))
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window2 = app.get_window("main").unwrap();
                window2.open_devtools();
            }
            // Setup block for cold-boots (app is totally closed, user double clicks a file).
            let args: Vec<String> = env::args().collect();
            if args.len() > 1 {
                let file_path = args[1].clone();
                let window = app.get_webview_window("main").unwrap();
                let window_clone = window.clone();
                
                // Spawn async delay to allow the React frontend to mount its event listeners.
                tauri::async_runtime::spawn(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                    // استفاده از آدرس‌دهی مستقیم Emitter برای رفع ارور کامپایلر
                    let _ = tauri::Emitter::emit(&window_clone, "open-file-event", file_path);
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_default_handler])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}