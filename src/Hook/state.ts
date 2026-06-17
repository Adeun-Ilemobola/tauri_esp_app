import { invoke } from "@tauri-apps/api/core";
import { create } from 'zustand';

import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useState, useEffect, useCallback } from "react";
import { BasicModules, isBasicModule, PortConnectionScheme, PortConnectionType, SerialMessageScheme, SerialMessageType } from "./Zod";
import { forwardConsole } from "../lib/logging";
import { debug, info, warn, error as logError } from "@tauri-apps/plugin-log";

forwardConsole("log", info);
forwardConsole("debug", debug);
forwardConsole("info", info);
forwardConsole("warn", warn);
forwardConsole("error", logError);

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error" | '';

// interface LogStore {
//   logs: SerialMessageType[];
//   addLog: (log: SerialMessageType) => void;
//   clear: () => void;
// }


interface PortStore {
    portInfo: PortConnectionType
    listPorts: string[]
    commitTime: Date | null
    status: ConnectionStatus
    error: string | null
    setPortInfo: (info: Partial<PortConnectionType>) => void;
    connect: (port: string, baudRate: number) => Promise<boolean>;
    getPorts: () => Promise<void>;
    disconnect: () => Promise<void>;
}

interface ListenStore {
    Unlisten: {
        registered: UnlistenFn | null
        Event: UnlistenFn | null
        error: UnlistenFn | null
        // parseError: UnlistenFn | null
    }
    ListenersErr: boolean
    startListeners: () => void;


    // 
    logs: SerialMessageType[];
    addLog: (log: SerialMessageType) => void;
    clear: () => void;


    // 
    modules: BasicModules[]


}

export const usePortStore = create<PortStore>((set, get) => ({
    portInfo: { port: "", baudRate: 115200 },
    commitTime: null,
    error: null,
    status: "",
    listPorts: [],
    setPortInfo: (info) => {
        console.info("[PortStore] setPortInfo:", info);
        set((state) => ({ portInfo: { ...state.portInfo, ...info } }));
    },
    connect: async (port, baudRate) => {
        console.info(`[PortStore] connect attempt — port: ${port}, baudRate: ${baudRate}`);
        const portInfo = { port, baudRate: baudRate ?? get().portInfo.baudRate };
        const valid = PortConnectionScheme.safeParse(portInfo);
        if (!valid.success) {
            console.warn("[PortStore] connect validation failed:", valid.error.issues[0].message);
            set({ error: valid.error.issues[0].message, status: "error" });
            return false;
        }
        set({ status: "connecting", error: null, portInfo: valid.data });
        try {
            await invoke("start_serial_listener", {
                portName: valid.data.port,
                baudRate: valid.data.baudRate,
            });
            console.info(`[PortStore] connected to ${valid.data.port} at ${valid.data.baudRate} baud`);
            set({ status: "connected", commitTime: new Date() });
            useListenStore.getState().startListeners();
            return true;
        } catch (e: any) {
            console.error("[PortStore] connect failed:", String(e));
            set({ status: "error", error: String(e) });
            return false;
        }
    },
    disconnect: async () => {
        console.info("[PortStore] disconnecting...");
        try {
            await invoke("stop_serial_listener");
            console.info("[PortStore] disconnected");
        } finally {
            set({ status: "disconnected", commitTime: null });
        }
    },
    getPorts: async () => {
        console.debug("[PortStore] listing serial ports...");
        try {
            const result = await invoke<string[]>("list_serial_ports");
            console.info("[PortStore] available ports:", result);
            set({ listPorts: result, error: null });
        } catch (e) {
            console.error("[PortStore] failed to list ports:", e);
            set({ error: "Failed to list ports:" + e });
        }
    }
}))

export const useListenStore = create<ListenStore>((set, get) => ({
    Unlisten: {
        registered: null,
        Event: null,
        error: null,
        parseError: null,
    },
    ListenersErr: false,
    logs: [],
    modules: [],

    addLog: (log) => {
        console.debug(`[ListenStore] addLog — kind: ${log.kind}, id: ${log.id}`);
        set((state) => ({ logs: [...state.logs, log] }));
    },
    clear: () => {
        console.info("[ListenStore] clearing logs and modules");
        set({ logs: [], modules: [] });
    },

    startListeners: () => {
        const { Unlisten, addLog } = get();

        console.info("[ListenStore] starting listeners — tearing down existing ones first");
        Object.values(Unlisten).forEach((fn) => fn?.());

        (async () => {
            try {
                const registered = await listen<SerialMessageType>("serial_registered", (event) => {
                    const result = SerialMessageScheme.safeParse(event.payload);
                    if (!result.success) {
                        console.error("[ListenStore] serial-Registered parse failed:", result.error);
                        return;
                    }
                    const fullresult = result.data;

                    if (fullresult.kind === "registered" && isBasicModule(fullresult)) {
                        set((state) => {
                            const modulesExist = state.modules.some((module) => module.id === fullresult.id);
                            if (modulesExist) {
                                console.debug(`[ListenStore] module ${fullresult.id} already registered, skipping`);
                                return state;
                            }
                            console.info(`[ListenStore] new module registered — id: ${fullresult.id}, type: ${fullresult.moduletype}`);
                            return { modules: [...state.modules, fullresult] };
                        });
                    }
                    addLog(result.data);
                });

                const Event = await listen<SerialMessageType>("serial_Event", (event) => {
                    const result = SerialMessageScheme.safeParse(event.payload);
                    if (!result.success) {
                        console.error("[ListenStore] serial-Event parse failed:", result.error);
                        return;
                    }
                    console.debug(`[ListenStore] received serial-Event — kind: ${result.data.kind}, id: ${result.data.id}`);
                    addLog(result.data);
                    if (result.data.moduletype === "button" || result.data.moduletype === "led") {
                        console.info(`[ListenStore] module state update — id: ${result.data.id}, type: ${result.data.moduletype}`);
                        set((state) => ({ modules: [...state.modules, result.data as BasicModules] }));
                    }
                });

                const error = await listen<string>("serial_error", (event) => {
                    console.error("[ListenStore] serial-error from device:", event.payload);
                });

                // const parseError = await listen("serial-parse-error", (event) => {
                //     console.error("[ListenStore] serial-parse-error from device:", event.payload);
                // });

                console.info("[ListenStore] all listeners registered successfully");
                set({ Unlisten: { registered, Event, error }, ListenersErr: false });
            } catch (e) {
                console.error("[ListenStore] failed to start listeners:", e);
                set({ ListenersErr: true });
            }
        })();
    },
}));

export function useSerial() {
    const [ports, setPorts] = useState<string[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unlisteners: UnlistenFn[] = [];
        let cancelled = false;

        // helper: registers a listener and routes its unlisten fn to the right place
        const track = (p: Promise<UnlistenFn>) =>
            p.then((fn) => {
                if (cancelled) fn();            // resolved too late — tear down now
                else unlisteners.push(fn);
            });

        track(listen<SerialMessageType>("serial-Registered", (event) => {
            const result = SerialMessageScheme.safeParse(event.payload);
            if (!result.success) {
                console.error("Bad serial message:", result.error, event.payload);
                return;
            }
            console.log("Registered:", result.data);
        }));

        track(listen<SerialMessageType>("serial-Event", (event) => {
            const result = SerialMessageScheme.safeParse(event.payload);
            if (!result.success) {
                console.error("Bad serial message:", result.error, event.payload);
                return;
            }
            console.log("Event:", result.data);
        }));

        track(listen<string>("serial-error", (event) => {
            console.error("Serial error:", event.payload);
        }));

        track(listen("serial-parse-error", (event) => {
            console.error("Parse error:", event.payload);
        }));

        return () => {
            cancelled = true;
            unlisteners.forEach((fn) => fn());
        };
    }, []);
    const listPorts = useCallback(async () => {
        try {
            const result = await invoke<string[]>("list_serial_ports");
            setPorts(result);
        } catch (e) {
            console.error("Failed to list ports:", e);
        }
    }, []);

    const connect = useCallback(async (portName: string, baudRate: number) => {
        setStatus("connecting");
        setError(null);
        try {
            await invoke("start_serial_listener", { portName, baudRate });
            setStatus("connected");
        } catch (e: any) {
            setStatus("error");
            setError(String(e));
        }
    }, []);

    return { ports, status, error, listPorts, connect };
}
