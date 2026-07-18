use serde::{Deserialize, Serialize};




#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IncomingCommand {
    pub id: String,
    #[serde(flatten)]
    pub command: ModuleCommand,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "module_type", content = "command", )]
pub enum ModuleCommand {
    Led(LedCommandPayload),
    ClusterLeds(ClusterCommandPayload),
    Servo(ServoCommandPayload),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum LedCommandPayload {
    SetState { state: u32 },
    Toggle,
}

//Servo
#[derive(Debug, Serialize, Deserialize, Clone)]

pub enum ServoCommandPayload {
    SetAngle { angle: i32 },
    SetMinPivot { min_pivot: i32 },
    SetMaxPivot { max_pivot: i32 },
}

//cluster Leds
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ClusterCommandPayload {
    ToggleAll,
    SetAll { state: u32 },

    Toggle { id: String, state: u32 },
    SetState { id: String, state: u32 },
}


// ---- Lidar




