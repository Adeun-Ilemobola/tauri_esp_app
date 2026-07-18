use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize , Deserialize ,Clone )]
#[serde(tag = "module_type", content = "event")]
pub enum ModuleEvent {
    Led(LedEvent),
    Servo(ServoEvent),
    Lidar(LidarEvent),
}

#[derive(Debug, Serialize , Deserialize ,Clone )]
#[serde(tag = "event_type")]
// ------ LedEvent-----
pub enum LedEvent{
   Brightness{id:String , level:u32 }
}


// ------ ServoEvent-----
#[derive(Debug, Serialize , Deserialize ,Clone )]
#[serde(tag = "event_type")]
pub enum  ServoEvent {
    GetAngle{id:String , angle:i32}
}

// ------ LidarEvent-----

#[derive(Debug, Serialize , Deserialize ,Clone )]
#[serde(tag = "event_type")]
pub struct  RangPoint{
    x:i32,
    y:i32,
    distant:u32
}

#[derive(Debug, Serialize , Deserialize ,Clone )]
#[serde(tag = "event_type")]
pub enum LidarEvent{
   Roi{
    id:String,
    x_min:i32 ,
    y_min:i32,
    x_max:i32 ,
    y_max:i32,
   },
   PointMap{id :String , map:Vec<RangPoint>},
   Target{ id:String ,  x:i32 , y:i32}
}

