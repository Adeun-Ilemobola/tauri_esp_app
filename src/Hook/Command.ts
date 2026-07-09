import z from "zod";




export const cmdBase = {
  kind: z.literal("CMD"),
  id: z.string(),
};

// Firmware payloads are `u32`, so anything negative is rejected here rather
// than failing to deserialize on the Rust side.
const u32 = z.number().int().nonnegative();

export const LedCommandTypeScheme = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("set_state"),
    state: u32,
  }),

  z.object({
    command: z.literal("toggle"),
  }),
]);

export const SorvoCommandTypeScheme = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("set_angle"),
    angle: u32,
  }),

  z.object({
    command: z.literal("set_min_pivot"),
    min_pivot: u32,
  }),

  z.object({
    command: z.literal("set_max_pivot"),
    max_pivot: u32,
  }),
]);

export const ClusterCommandTypeScheme = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("toggle_all"),
  }),

  z.object({
    command: z.literal("set_all"),
    state: u32,
  }),

  z.object({
    command: z.literal("toggle"),
    id: z.string(),
    state: u32,
  }),

  z.object({
    command: z.literal("set_state"),
    id: z.string(),
    state: u32,
  }),
]);

export const   SerialCMDLed =z.object({
    ...cmdBase,
    moduletype: z.literal("led"),
    payload: LedCommandTypeScheme,
  })

export const SerialCMDSorvo = z.object({
  ...cmdBase,
  moduletype: z.literal("sorvo"),
  payload: SorvoCommandTypeScheme,
})

export const SerialCMDClusterLeds = z.object({
  ...cmdBase,
  moduletype: z.literal("cluster_leds"),
  payload: ClusterCommandTypeScheme,
})

export const SerialCMDScheme = z.discriminatedUnion("moduletype", [
  SerialCMDLed,
  SerialCMDSorvo,
  SerialCMDClusterLeds,
]);

export type SerialCMDType = z.infer<typeof SerialCMDScheme>;
