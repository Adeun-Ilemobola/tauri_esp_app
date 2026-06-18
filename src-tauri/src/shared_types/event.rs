use serde::{Deserialize, Serialize};
use serialport::SerialPort;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
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
    Log(LogPayload),
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ButtonEvent {
    pub pressed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogPayload {
    pub message: String,
    pub rawjson: String,
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
pub struct SerialRuntime {
    pub port_name: Option<String>,
    pub baud_rate: u32,
    pub port: Box<dyn SerialPort>,
    pub worker: Option<JoinHandle<()>>,
    pub stop_flag: Arc<AtomicBool>,
}

impl SerialRuntime {
    pub fn new(
        port_name: String,
        baud_rate: u32,
        port: Box<dyn SerialPort>,
        worker: JoinHandle<()>,
        stop_flag: Arc<AtomicBool>,
    ) -> Self {
        Self {
            port_name: Some(port_name),
            baud_rate,
            port,
            worker: Some(worker),
            stop_flag,
        }
    }

    pub fn stop(self) {
        let SerialRuntime { port, worker, stop_flag, .. } = self;
        stop_flag.store(true, Ordering::Relaxed);
        drop(port);
        if let Some(handle) = worker {
            let _ = handle.join();
        }
    }
}

pub struct SerialState {
    // pub port: Mutex<Option<Box<dyn SerialPort>>>,
    pub runtime: Mutex<Option<SerialRuntime>>,
}

pub const MAXBACTH:usize = 100;
pub const MAX_TIME_BETEEN:u128 = 75;

