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
}


#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "command", rename_all = "snake_case")]
pub enum LedCommand {
    SetState { state: u32 },
    Toggle,
}
