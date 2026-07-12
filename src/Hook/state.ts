import { invoke } from "@tauri-apps/api/core";
import { create } from 'zustand';

import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useState, useEffect, useCallback } from "react";
import { BasicModules, isBasicModule, PortConnectionScheme, PortConnectionType, sendSerialCommand} from "./Zod";
import { forwardConsole } from "../lib/logging";
import { debug, info, warn, error as logError } from "@tauri-apps/plugin-log";
import { SeriaIncomingEventScheme, SeriaIncomingEventType } from "./Event";

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
    error: string | null,
    setPortInfo: (info: Partial<PortConnectionType>) => void;
    connect: (port: string, baudRate: number) => Promise<boolean>;
    getPorts: () => Promise<void>;
    disconnect: () => Promise<void>;
}

interface ListenStore {
    Unlisten: {
        unlistenBatch: UnlistenFn | null
        error: UnlistenFn | null
        // parseError: UnlistenFn | null
    }
    ListenersErr: boolean;
    isListening: boolean;

    startListeners: () => void;
    stopListeners: () => void;


    // 
    logs: SeriaIncomingEventType[];
    addLog: (log: SeriaIncomingEventType) => void;
    clear: () => void;


    // 
    modules: BasicModules[]
    modulesRaw : Record<string ,BasicModules>
    moduleIdRef:Record<string ,string>


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
         useListenStore.getState().stopListeners();
         set({commitTime:null})
        
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
         set({commitTime:null , listPorts: [] ,  portInfo: { port: "", baudRate: 115200 } , error: null });
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
const MAX_VISIBLE_LOGS = 500;

export const useListenStore = create<ListenStore>((set, get) => ({
    Unlisten: {
        // registered: null,
        // Event: null,
        unlistenBatch: null,
        error: null,
        parseError: null,
    },
    ListenersErr: false,
    isListening: false,
    logs: [],
    modules: [],
    moduleIdRef:{},
    modulesRaw:{},

    addLog: (log) => {
        console.debug(`[ListenStore] addLog — kind: ${log.kind}, id: ${log.id}`);
        set((state) => ({
            logs: [...state.logs, log].slice(-MAX_VISIBLE_LOGS),
        }));
    },
    clear: () => {
        console.info("[ListenStore] clearing logs and modules");
        set({ logs: [], modules: [] ,  ListenersErr: false ,isListening: false  });
    },
    stopListeners: () => {
        const { Unlisten , clear } = get();
        console.info("[ListenStore] stopping listeners");
        if (Object.values(Unlisten).length <= 0) {
            return
        }
        clear()
        Object.values(Unlisten).forEach((fn) => fn?.());
        set({ Unlisten: { unlistenBatch: null, error: null } });
    },

    startListeners: () => {
        const { addLog } = get();
        const { isListening } = get();

        if (isListening) {
            console.info("[ListenStore] listeners already active");
            return;
        }


        (async () => {
            try {
               
                const error = await listen<string>("serial_error", (event) => {
                   if (event.payload.trim().length > 0 ){
                     console.error("[ListenStore] serial-error from device:", event.payload);
                   }
                });

                const unlistenBatch = await listen<SeriaIncomingEventType[]>("serial_batch", (event) => {

                    for (const msg of event.payload) {
                        const result = SeriaIncomingEventScheme.safeParse(msg);
                        if (!result.success) {
                            console.error("[ListenStore] serial-Registered parse failed:", result.error);
                            continue;
                        }
                        const newModule = result.data;
                        switch (newModule.kind) {
                            case "registered":
                                if (isBasicModule(newModule)) {
                                    set((state) => {
                                        const modulesExist = state.modules.some((module) => module.id === newModule.id);
                                        if (modulesExist) {
                                            console.debug(`[ListenStore] module ${newModule.id} already registered, skipping`);
                                            return state;
                                        }
                                        console.info(`[ListenStore] new module registered — id: ${newModule.id}, type: ${newModule.moduletype}`);
                                      
                                        return { 
                                            modules: [...state.modules, newModule], 
                                            moduleIdRef:{
                                                ...state.moduleIdRef,
                                                [newModule.manuel_id]:newModule.id
                                            },
                                            modulesRaw:{
                                                ...state.modulesRaw,
                                                [newModule.id]:newModule
                                            }
                                        };
                                    });
                                }
                                break;
                            case "event":
                                if (isBasicModule(newModule)) {
                                    console.info(`[ListenStore] module state update — id: ${newModule.id}, type: ${newModule.moduletype}`);
                                    set((state) => {
                                        const id = newModule.id
                                        const m = state.modules.map(item => {
                                            if (item.id === id) {
                                                return {
                                                    ...newModule
                                                }
                                            }
                                            return item

                                        })

                                        return { modules: m }
                                    });
                                }
                                break;
                            case "log":
                                console.debug(`[ListenStore] log message — id: ${newModule.id}, type: ${newModule.moduletype}`);
                                break;
                            default:
                                console.warn(`[ListenStore] unknown message kind: ${newModule.kind}`);
                        }
                        addLog(result.data);
                    }


                });

                // const parseError = await listen("serial-parse-error", (event) => {
                //     console.error("[ListenStore] serial-parse-error from device:", event.payload);
                // });

                console.info("[ListenStore] all listeners registered successfully");
                set({ Unlisten: { unlistenBatch, error }, ListenersErr: false, isListening: true });
            } catch (e) {
                console.error("[ListenStore] failed to start listeners:", e);
                set({ ListenersErr: true });
            }
        })();
    },
}));

