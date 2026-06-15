mod shared_types;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use crate::shared_types::command::CommandPayload;
use crate::shared_types::event::{MessageKind, SerialMessage, SerialParseError, SerialState};

use std::sync::Mutex;
use std::{
    io::{BufRead, BufReader},
    thread,
    time::Duration,
};
use tauri::State;
use tauri::{AppHandle, Emitter};

#[tauri::command]
fn list_serial_ports() -> Result<Vec<String>, String> {
    let ports = serialport::available_ports().map_err(|err| err.to_string())?;

    Ok(ports.into_iter().map(|port| port.port_name).collect())
}

#[tauri::command]
fn start_serial_listener(
    app: AppHandle,
    port_name: String,
    baud_rate: Option<u32>,
    state: State<SerialState>,
) -> Result<(), String> {
    let baud_rate = baud_rate.unwrap_or(115_200);

    let port = serialport::new(&port_name, baud_rate)
        .timeout(Duration::from_millis(100))
        .open()
        .map_err(|e| format!("Failed to open {port_name}: {e}"))?;

    // Clone for reading thread.
    // Original port stays in state for writing commands later.
    let reader_port = port.try_clone().map_err(|e| e.to_string())?;

    *state.port.lock().unwrap() = Some(port);
    

   let handle=  thread::spawn(move || {
        let mut reader = BufReader::new(reader_port);
        let mut line = String::new();
        loop {
            match reader.read_line(&mut line) {
                Ok(0) => {
                    continue;
                }

                Err(err) if err.kind() == std::io::ErrorKind::TimedOut => {
                    continue;
                }

                Err(err) => {
                    let _ = app.emit("serial-error", err.to_string());
                    break;
                }

                Ok(_) => {
                    let linetrim = line.trim();

                    if linetrim.is_empty() {
                        continue;
                    }

                    match serde_json::from_str::<SerialMessage>(linetrim) {
                        Ok(event) => {
                            match &event.kind {
                                MessageKind::Registered => {
                                    let _ = app.emit("serial-registered", &event);

                                    // Later:
                                    // update your module registry here
                                }

                                MessageKind::Event => {
                                    let _ = app.emit("serial-event", &event);
                                }

                                MessageKind::Log => {
                                    let _ = app.emit("serial-log", &event);
                                }
                            }
                            line.clear();
                        }

                        Err(err) => {
                            let _ = app.emit(
                                "serial-error",
                                SerialParseError {
                                    raw: line.to_string(),
                                    error: err.to_string(),
                                },
                            );
                            line.clear();
                        }
                    }
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn send_serial_command(state: State<SerialState>, data: CommandPayload) -> Result<(), String> {
    let mut port_guard = state.port.lock().unwrap();

    let port = port_guard.as_mut().ok_or("Serial port is not connected")?;

    let mut message = serde_json::to_string(&data).map_err(|err| err.to_string())?;

    message.push('\n');
    port.write_all(message.as_bytes())
        .map_err(|err| err.to_string())?;
    port.flush().map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SerialState {
            port: Mutex::new(None),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            start_serial_listener,
            list_serial_ports,
            send_serial_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
