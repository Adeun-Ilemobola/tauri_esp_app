import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";


export type SerialMessage<K extends keyof SerialEventPayload> = {
    id: String,
    version: String,
    kind: MessageKind,
    payload: K
}
export type MessageKind = "Command" | "RegisteredEvent" | "Error" | "Log";


export type SerialEventPayload = {
    Button: {
        pressed: boolean
    },
    Led: {
        state: boolean
    }
}
type AnyPayload = SerialEventPayload[keyof SerialEventPayload];


export type SerialEventCapability = {
    Led: {
        Command: {
            on: {},
            off: {}
        },
        Event: null
    },
    Button: null
}




async function serialPort() {

    const unlistenSerialRegistered = await listen<SerialMessage<keyof SerialEventPayload>>("serial-Registered", (event) => {
        const data = event.payload;
        console.log(
            "Registered :" +
            data
        )
        
    })

    const unlistenSerialLog = await listen<SerialMessage<keyof SerialEventPayload>>("serial-Log", (event) => {
        const data = event.payload;
        console.log(
            "Log :" +
            data
        )
        
    })
    const unlistenSerialEvent = await listen<SerialMessage<keyof SerialEventPayload>>("serial-Event", (event) => {
        const data = event.payload;
        console.log(
            "Event :" +
            data
        )
        
    })

    const unlistenError = await listen<string>("serial-error", (event) => {
        console.error("Serial error:", event.payload);
    });

    const unlistenParseError = await listen("serial-parse-error", (event) => {
        console.error("Parse error:", event.payload);
    });

    await invoke("start_serial_listener", {
        portName: "COM3",
        baudRate: 115200,
    });

    return () => {
        unlistenSerialRegistered();
        unlistenSerialLog();
        unlistenError();
        unlistenParseError();
        unlistenSerialEvent();
    };

}


