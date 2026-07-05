import { ButtonSerialMessageScheme } from "@/components/Modules/ButtonM";
import { led_SerialMessageScheme, SerialCMDLed } from "@/components/Modules/led";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export const LogPayloadScheme    = z.object({ message: z.string() , rawjson:z.string() });

export const messageBase = {
  id: z.string(),
  manuel_id: z.string(),

  version: z.string(),
  kind: z.enum(["registered", "event", "log"]),
};

export const SerialMessageScheme = z.discriminatedUnion("moduletype", [
  z.object({ ...messageBase, moduletype: z.literal("log"),    payload: LogPayloadScheme }),
  led_SerialMessageScheme,
  ButtonSerialMessageScheme
]);
export type SerialMessageType = z.infer<typeof SerialMessageScheme>;


export const cmdBase = {
  kind: z.literal("CMD"),
  id: z.string(),
};

export const SerialCMDScheme = z.discriminatedUnion("moduletype", [
  SerialCMDLed
]);

export type SerialCMDType = z.infer<typeof SerialCMDScheme>;

export async function sendSerialCommand(command: SerialCMDType) {
  const validCommand = SerialCMDScheme.parse(command);

  await invoke("send_serial_command", {
    data: validCommand,
  });
}


export const PortConnectionScheme = z.object({
  port: z.string().min(1, "Please select a port"),
  baudRate: z.coerce.number().int().positive("Must be a positive integer"),
});
export type PortConnectionType = z.infer<typeof PortConnectionScheme>;

type ModuleType = SerialMessageType["moduletype"];

export type OnlyModules<T extends ModuleType> = Extract<
  SerialMessageType,
  { moduletype: T }
>;

export type BasicModules = OnlyModules<"led" | "button">;
export function isBasicModule(message: SerialMessageType): message is BasicModules {
  return message.moduletype === "led" 
  || message.moduletype === "button";
}