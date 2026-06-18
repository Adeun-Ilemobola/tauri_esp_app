import { useListenStore } from "@/Hook/state";
import { SerialMessageType } from "@/Hook/Zod";
import { useVirtualizer } from '@tanstack/react-virtual';


import React, { useState, useRef } from 'react'
type LogMessage = Extract<SerialMessageType, { moduletype: "log" }>;

const fakeLogMessages: LogMessage[] = [
    { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", version: "1.0", kind: "log", moduletype: "log", payload: { message: "System initialized successfully", rawjson: '{"status":"ok","uptime":0}' } },
    { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", version: "1.0", kind: "log", moduletype: "log", payload: { message: "Connecting to serial port COM3", rawjson: '{"port":"COM3","baud":115200}' } },
    { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", version: "1.0", kind: "event", moduletype: "log", payload: { message: "Serial connection established", rawjson: '{"port":"COM3","status":"connected"}' } },
    { id: "d4e5f6a7-b8c9-0123-defa-234567890123", version: "1.0", kind: "event", moduletype: "log", payload: { message: "Button press detected on GPIO 5", rawjson: '{"gpio":5,"pressed":true}' } },
    { id: "e5f6a7b8-c9d0-1234-efab-345678901234", version: "1.0", kind: "log", moduletype: "log", payload: { message: "LED state changed to ON", rawjson: '{"led":"state","value":1}' } },
    { id: "f6a7b8c9-d0e1-2345-fabc-456789012345", version: "1.0", kind: "registered", moduletype: "log", payload: { message: "Module 'button' registered", rawjson: '{"module":"button","gpio":5}' } },
    { id: "a7b8c9d0-e1f2-3456-abcd-567890123456", version: "1.0", kind: "registered", moduletype: "log", payload: { message: "Module 'led' registered", rawjson: '{"module":"led","gpio":2}' } },
    { id: "b8c9d0e1-f2a3-4567-bcde-678901234567", version: "1.0", kind: "log", moduletype: "log", payload: { message: "Heartbeat received from ESP32", rawjson: '{"type":"heartbeat","tick":1024}' } },
    { id: "c9d0e1f2-a3b4-5678-cdef-789012345678", version: "1.0", kind: "event", moduletype: "log", payload: { message: "Sensor reading: temperature 24.3°C", rawjson: '{"sensor":"temp","value":24.3,"unit":"C"}' } },
    { id: "d0e1f2a3-b4c5-6789-defa-890123456789", version: "1.0", kind: "log", moduletype: "log", payload: { message: "Command 'led ON' sent successfully", rawjson: '{"cmd":"led","arg":"ON","ack":true}' } },
    { id: "e1f2a3b4-c5d6-7890-efab-901234567890", version: "1.0", kind: "event", moduletype: "log", payload: { message: "Button released on GPIO 5", rawjson: '{"gpio":5,"pressed":false}' } },
    { id: "f2a3b4c5-d6e7-8901-fabc-012345678901", version: "1.0", kind: "log", moduletype: "log", payload: { message: "LED state changed to OFF", rawjson: '{"led":"state","value":0}' } },
    { id: "a3b4c5d6-e7f8-9012-abcd-123456789012", version: "1.0", kind: "log", moduletype: "log", payload: { message: "Serial buffer flushed", rawjson: '{"action":"flush","bytes":0}' } },
    { id: "b4c5d6e7-f8a9-0123-bcde-234567890123", version: "1.0", kind: "event", moduletype: "log", payload: { message: "Unexpected reset detected on ESP32", rawjson: '{"reason":"watchdog","code":3}' } },
    { id: "c5d6e7f8-a9b0-1234-cdef-345678901234", version: "1.0", kind: "log", moduletype: "log", payload: { message: "Reconnection attempt 1 of 3", rawjson: '{"attempt":1,"max":3}' } },
];

export default function LogFrame() {
    // const [logs, setLogs] = useState<LogMessage[]>(fakeLogMessages)
    const logs = useListenStore((state) => state.logs);


    return <LogFramePage logs={logs} />;
}


function LogFramePage({ logs }: { logs: SerialMessageType[] }) {
    const parentRef = useRef(null)
    const Virtualizer = useVirtualizer({
        count: logs.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
    })
    const virtualizerLog = Virtualizer.getVirtualItems();
    return (
        <main className="flex flex-col gap-0.5 p-3 w-full">
            <div className="flex flex-row gap-2 justify-end">
            </div>

            {/* logs */}
            <div
                ref={parentRef}
                className="flex flex-col h-[88dvh] w-full overflow-y-auto   gap-1.5 p-1 bg-neutral-500/50 rounded"
            >
                <div
                    className=" relative"
                    style={{
                        height: `${Virtualizer.getTotalSize()}px`
                    }}
                >
                    {virtualizerLog.map((Vlog) => {
                        const getRawLog = logs[Vlog.index]


                        return (
                            <div
                                key={Vlog.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${Vlog.size}px`,
                                    transform: `translateY(${Vlog.start}px)`,
                                }}
                            >
                                <LogCard
                                    log={getRawLog}
                                />

                            </div>


                        )
                    })}

                </div>

            </div>
        </main>
    );
}


function LogCard({ log }: { log: SerialMessageType }) {

    return (
        <div
            className="flex flex-col gap-0.5 overflow-y-auto rounded px-2 py-1 bg-background/70 text-sm font-mono"
        >
            <div className="flex flex-row items-center gap-2">
                <span className={`shrink-0 text-sm font-semibold uppercase px-1.5 py-0.5 rounded ${log.kind === "event"
                    ? "bg-blue-500/20 text-blue-400"
                    : log.kind === "registered"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                    {log.kind}
                </span>
            </div>
            <span className="text-sm text-muted-foreground/60 pl-1 break-all">{JSON.stringify(log)}</span>
        </div>
    )

}



