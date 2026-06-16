use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use serialport::SerialPort;
use std::thread::JoinHandle;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SerialMessage {
    pub id: String,
    pub version: String,
    pub kind: MessageKind,

    #[serde(flatten)]
    pub payload: SerialPayload,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum MessageKind {
    Registered,
    Event,
    Log,

}
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "moduletype", content = "payload", rename_all = "snake_case")]
pub enum SerialPayload {
    Button(ButtonEvent),
    Led(LedPayload),
    Log(LogPayload)
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ButtonEvent {
    pub pressed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogPayload {
   pub message:String
}


#[derive(Debug, Serialize, Clone)]
pub struct SerialParseError {
    pub raw: String,
    pub error: String,
}

pub static mut SERIAL_MODE: bool = false;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LedPayload {
    pub state: u32,
}


pub struct SerialState {
   pub port: Mutex<Option<Box<dyn SerialPort>>>,
}

struct SerialRuntime {
    port_name: Option<String>,
    baud_rate: u32,
    port: Mutex<Option<Box<dyn SerialPort>>>,
    worker: Option<JoinHandle<()>>,

}