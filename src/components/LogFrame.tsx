import { SeriaIncomingEventType } from "@/Hook/Event";
import { useListenStore } from "@/Hook/state";

import { useVirtualizer } from '@tanstack/react-virtual';


import React, { useState, useRef } from 'react'
type LogMessage = Extract<SeriaIncomingEventType, { moduletype: "log" }>;

export default function LogFrame() {
    // const [logs, setLogs] = useState<LogMessage[]>(fakeLogMessages)
    const logs = useListenStore((state) => state.logs);


    return <LogFramePage logs={logs} />;
}


function LogFramePage({ logs }: { logs: SeriaIncomingEventType[] }) {
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


function LogCard({ log }: { log: SeriaIncomingEventType }) {

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



