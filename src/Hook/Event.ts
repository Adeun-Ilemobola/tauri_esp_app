import z from "zod";

// Firmware payload fields are `u32`.
const u32 = z.number().int().nonnegative();

export const LogPayloadScheme    = z.object({ message: z.string() , rawjson:z.string() });

export const incomingEventBase = {
  id: z.string(),
  manuel_id: z.string(),
  version: z.string(),
  kind: z.enum(["registered", "event", "log"]),
  // `Option<String>` on the firmware; a clustered module reports its master here.
  master_id: z.string().nullish(),
  generated_info: z.unknown().optional(),
};


export const ButtonPayloadScheme = z.object({ pressed: z.boolean() });

export const ButtonSerialMessageScheme = z.object({
  ...incomingEventBase, moduletype: z.literal("button"), payload: ButtonPayloadScheme
})

export const LedPayloadScheme    = z.object({ state: u32 });

export const led_SerialMessageScheme = z.object({ ...incomingEventBase, moduletype: z.literal("led"),    payload: LedPayloadScheme })


// Mirrors `SorvoConfig` in moduleconflg.rs.
export const SorvoConfigScheme = z.object({
  max_angle: u32,
  min_angle: u32,
  offset:    u32,
  min_pivot: u32,
  max_pivot: u32,
  pulse_min: u32,
  pulse_max: u32,
})

// `offset`/`min_pivot`/`max_pivot` also exist on `config`, but the module mutates
// its own copies at runtime, so these are the live values and `config` is the boot default.
export const SorvoPayloadScheme = z.object({
  config:    SorvoConfigScheme,
  offset:    u32,
  angle:     u32,
  min_pivot: u32,
  max_pivot: u32,
})

export const SorvoSerialMessageScheme = z.object({
  ...incomingEventBase, moduletype: z.literal("sorvo"), payload: SorvoPayloadScheme
})


export const SeriaIncomingEventScheme = z.discriminatedUnion("moduletype", [
  z.object({ ...incomingEventBase, moduletype: z.literal("log"),    payload: LogPayloadScheme }),
  led_SerialMessageScheme,
  ButtonSerialMessageScheme,
  SorvoSerialMessageScheme
]);
export type SeriaIncomingEventType = z.infer<typeof SeriaIncomingEventScheme>;
