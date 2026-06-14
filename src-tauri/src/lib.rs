// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use std::{
    io::{BufRead, BufReader}, string, thread, time::Duration
};
use tauri::{AppHandle, Emitter};


#[derive(Debug, Serialize, Deserialize, Clone)]
struct SerialMessage {
    id: String,
    version: String,
    kind: MessageKind,

    #[serde(flatten)]
    event: SerialEvent,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
enum MessageKind {
    Registered,
    Event,
    Log
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "payload", rename_all = "snake_case")]
enum SerialEvent {
    Button(ButtonEvent),
    Led(LedEvent),
    Log(LogEvent)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ButtonEvent {
    pin: u8,
    pressed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LogEvent {
   message:String
}


#[derive(Debug, Serialize, Clone)]
struct SerialParseError {
    raw: String,
    error: String,
}

static mut SERIAL_MODE: bool = false;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LedEvent {
    pin: u8,
    state: bool,
}

#[tauri::command]
fn list_serial_ports() -> Result<Vec<String>, String> {
    let ports = serialport::available_ports().map_err(|err| err.to_string())?;

    Ok(ports.into_iter().map(|port| port.port_name).collect())
}

#[tauri::command]
fn start_serial_listener(
    app: AppHandle,
    name: String,
    baud_rate: Option<u32>,
) -> Result<(), String> {
    let baud_rate = baud_rate.unwrap_or(115_200);

    thread::spawn(move || {
        let port = match serialport::new(&name, baud_rate)
            .timeout(Duration::from_millis(100))
            .open()
        {
            Ok(port) => port,
            Err(err) => {
                let _ = app.emit("serial-error", format!("Failed to open {name}: {err}"));
                return;
            }
        };
         let mut reader = BufReader::new(port);

         loop {
              
              let mut line = String::new();
              match reader.read_line(&mut line) {

                Ok(0)=>{
                    continue;
                }
                Err(err) if err.kind() == std::io::ErrorKind::TimedOut => {
                    continue;
                }

                Err(err) => {
                    let _ = app.emit("serial-error", err.to_string());
                    break;
                }
                Ok(_)=>{
                     let line = line.trim();

                    if line.is_empty() {
                        continue;
                    }
                    match serde_json::from_str::<SerialMessage>(line) {
                        Ok(event)=>{
                           
                           match event.kind  {
                             MessageKind::Registered =>{
                                //verify if this motion has registered

                                //registered module than update. 
                                

                             }
                             MessageKind::Event =>{
                                // if a module is not registered do not register
                                let  _ = app.emit("serial-Registered", event);
                             }
                             MessageKind::Log =>{
                                let  _ = app.emit("serial-Log", event);

                             }

                           }

                        }

                        Err(err)=>{
                             let _ = app.emit("serial-error", SerialParseError{ raw: line.to_string() , error:err.to_string() });
                        }
                        
                    }
                }
                  
              }
         }
    });

    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
            tauri::generate_handler![
                greet,
                start_serial_listener,
                list_serial_ports
            ]

        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
