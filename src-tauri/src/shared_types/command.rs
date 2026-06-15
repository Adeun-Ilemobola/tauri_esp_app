// use serde::{Deserialize, Serialize};
use crate::shared_types::event::{
    SerialPayload
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct  CommandPayload {
    pub kind: String,
    pub id:String,
    #[serde(flatten)]
    pub payload: SerialPayload,
}


