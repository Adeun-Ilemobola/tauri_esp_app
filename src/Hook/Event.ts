// import z from "zod";
// import { EventModeType, moduleTypeIdentifier } from "./moduleType";



// export const LogPayloadScheme    = z.object({ message: z.string() , rawjson:z.string() });

// export const incomingEventBase = {
//   id: z.string(),
//   manuel_id: z.string(),
//   version: z.string(),
//   kind: EventModeType,
//   master_id: z.string().nullish(),
//   generated_info: z.unknown().optional(),
// };


// export const ButtonPayloadScheme = z.object({ pressed: z.boolean() });

// export const ButtonSerialMessageScheme = z.object({
//   ...incomingEventBase, moduletype: z.literal(moduleTypeIdentifier.enum.Button), payload: ButtonPayloadScheme
// })

// export const LedPayloadScheme    = z.object({ state: z.number() });

// export const led_SerialMessageScheme = z.object({ ...incomingEventBase, moduletype: z.literal(moduleTypeIdentifier.enum.Led),    payload: LedPayloadScheme })


// export const ServoConfigScheme = z.object({
//   max_angle: z.number(),
//   min_angle: z.number(),
//   offset:    z.number(),
//   min_pivot: z.number(),
//   max_pivot: z.number(),
//   pulse_min: z.number(),
//   pulse_max: z.number(),
// })


// export const ServoPayloadScheme = z.object({
//   config:    ServoConfigScheme,
//   offset:    z.number(),
//   angle:     z.number(),
//   min_pivot: z.number(),
//   max_pivot: z.number(),
// })

// export const ServoSerialMessageScheme = z.object({
//   ...incomingEventBase, moduletype: z.literal(moduleTypeIdentifier.enum.Servo), payload: ServoPayloadScheme
// })


// export const SeriaIncomingEventScheme = z.discriminatedUnion("moduletype", [
//   // z.object({ ...incomingEventBase, moduletype: z.literal("log"),    payload: LogPayloadScheme }),
//   led_SerialMessageScheme,
//   ButtonSerialMessageScheme,
//   ServoSerialMessageScheme
// ]);
// export type SeriaIncomingEventType = z.infer<typeof SeriaIncomingEventScheme>;
