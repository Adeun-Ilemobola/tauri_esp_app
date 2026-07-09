
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { SerialCMDScheme, SerialCMDType } from "./Command";
import { SeriaIncomingEventType } from "./Event";

export async function sendSerialCommand(command: SerialCMDType) {
  const validCommand = SerialCMDScheme.parse(command);
  console.info("sendSerialCommand :" + validCommand)

  await invoke("send_serial_command", {
    data: validCommand,
  });
}


export const PortConnectionScheme = z.object({
  port: z.string().min(1, "Please select a port"),
  baudRate: z.coerce.number().int().positive("Must be a positive integer"),
});
export type PortConnectionType = z.infer<typeof PortConnectionScheme>;

type ModuleType = SeriaIncomingEventType["moduletype"];

export type OnlyModules<T extends ModuleType> = Extract<
  SeriaIncomingEventType,
  { moduletype: T }
>;

export type BasicModules = OnlyModules<"led" | "button" | "servo">;
export function isBasicModule(message: SeriaIncomingEventType): message is BasicModules {
  return message.moduletype === "led"
  || message.moduletype === "button"
  || message.moduletype === "servo";
}