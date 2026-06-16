import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useState, useEffect, useCallback } from "react";
import { SerialMessageScheme, SerialMessageType } from "./Zod";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

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
