import z from "zod";

export const LogPayloadScheme    = z.object({ message: z.string() , rawjson:z.string() });

export const incomingEventBase = {
  id: z.string(),
  manuel_id: z.string(),
  version: z.string(),
  kind: z.enum(["registered", "event", "log"]),
};


export const ButtonPayloadScheme = z.object({ pressed: z.boolean() });

export const ButtonSerialMessageScheme = z.object({ 
  ...incomingEventBase, moduletype: z.literal("button"), payload: ButtonPayloadScheme 
})

export const LedPayloadScheme    = z.object({ state: z.number() });

export const led_SerialMessageScheme = z.object({ ...incomingEventBase, moduletype: z.literal("led"),    payload: LedPayloadScheme })






export const SeriaIncomingEventScheme = z.discriminatedUnion("moduletype", [
  z.object({ ...incomingEventBase, moduletype: z.literal("log"),    payload: LogPayloadScheme }),
  led_SerialMessageScheme,
  ButtonSerialMessageScheme
]);
export type SeriaIncomingEventType = z.infer<typeof SeriaIncomingEventScheme>;

