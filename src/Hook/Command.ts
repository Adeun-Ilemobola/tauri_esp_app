import z from "zod";
import { incomingEventBase } from "./Event";




export const cmdBase = {
  kind: z.literal("CMD"),
  id: z.string(),
};

export const LedCommandTypeScheme = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("set_state"),
    state: z.number().int(),
  }),

  z.object({
    command: z.literal("toggle"),
  }),
]);

export const   SerialCMDLed =z.object({
    ...cmdBase,
    moduletype: z.literal("led"),
    payload: LedCommandTypeScheme,
  })

export const SerialCMDScheme = z.discriminatedUnion("moduletype", [
  SerialCMDLed
]);

export type SerialCMDType = z.infer<typeof SerialCMDScheme>;



