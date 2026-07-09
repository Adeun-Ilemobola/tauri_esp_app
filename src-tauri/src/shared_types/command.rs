// use serde::{Deserialize, Serialize};
// use crate::shared_types::event::SerialPayload;
use serde::{Deserialize, Serialize};
use serde_json::Value;



#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandEnvelope {
    pub kind: String,
    pub id: String,

    #[serde(flatten)]
    pub command: CommandBody,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "moduletype", content = "payload", rename_all = "snake_case")]
pub enum CommandBody {
    Led(LedCommand),
    ClusterLeds(ClusterCommand),
    // Spelled to match the firmware's `ModuleCommand::Sorvo` wire tag.
    Sorvo(SorvoCommand),
}


#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "command", rename_all = "snake_case")]
pub enum LedCommand {
    SetState { state: u32 },
    Toggle,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "command", rename_all = "snake_case")]
pub enum SorvoCommand {
    SetAngle { angle: u32 },
    SetMinPivot { min_pivot: u32 },
    SetMaxPivot { max_pivot: u32 },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "command", rename_all = "snake_case")]
pub enum ClusterCommand {
    ToggleAll,
    SetAll { state: u32 },
    Toggle { id: String, state: u32 },
    SetState { id: String, state: u32 },
}
