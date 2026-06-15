import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { SerialCMDScheme, SerialMessageScheme, SerialMessageType } from "./Zod";


// export type SerialMessage<K extends keyof SerialEventPayload> = {
//     id: String,
//     version: String,
//     kind: MessageKind,
//     payload: K
// }
// export type MessageKind = "Command" | "RegisteredEvent" | "Error" | "Log";


// export type SerialEventPayload = {
//     Button: {
//         pressed: boolean
//     },
//     Led: {
//         state: boolean
//     }
// }
// type AnyPayload = SerialEventPayload[keyof SerialEventPayload];


// export type SerialEventCapability = {
//     Led: {
//         Command: {
//             on: {},
//             off: {}
//         },
//         Event: null
//     },
//     Button: null
// }





async function serialPort() {

    

    const unlistenSerialRegistered = await listen<SerialMessageType>("serial-Registered", (event) => {
        const result = SerialMessageScheme.safeParse(event.payload);
        if (!result.success) {
            console.error("Bad serial message:", result.error, event.payload);
             return

        }
        const data = result.data
        console.log("Registered:" + data)

    })

    const unlistenSerialLog = await listen<SerialMessageType>("serial-Log", (event) => {
        const result = SerialMessageScheme.safeParse(event.payload);
        if (!result.success) {
            console.error("Bad serial message:", result.error, event.payload);
            return

        }

        const data = result.data
        console.log("Log:" + data)

    })
    const unlistenSerialEvent = await listen<SerialMessageType>("serial-Event", (event) => {
        const result = SerialMessageScheme.safeParse(event.payload);
        if (!result.success) {
            console.error("Bad serial message:", result.error, event.payload);
             return

        }
        const data = result.data
        console.log("Event:" + data)

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


