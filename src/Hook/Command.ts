// import z from "zod";




// export const cmdBase = {
//   kind: z.literal("CMD"),
//   id: z.string(),
// };


// export const LedCommandTypeScheme = z.discriminatedUnion("command", [
//   z.object({
//     command: z.literal("set_state"),
//     state: z.number(),
//   }),

//   z.object({
//     command: z.literal("toggle"),
//   }),
// ]);

// export const ServoCommandTypeScheme = z.discriminatedUnion("command", [
//   z.object({
//     command: z.literal("set_angle"),
//     angle: z.number(),
//   }),

//   z.object({
//     command: z.literal("set_min_pivot"),
//     min_pivot: z.number(),
//   }),

//   z.object({
//     command: z.literal("set_max_pivot"),
//     max_pivot: z.number(),
//   }),
// ]);

// export const ClusterCommandTypeScheme = z.discriminatedUnion("command", [
//   z.object({
//     command: z.literal("toggle_all"),
//   }),

//   z.object({
//     command: z.literal("set_all"),
//     state: z.number(),
//   }),

//   z.object({
//     command: z.literal("toggle"),
//     id: z.string(),
//     state: z.number(),
//   }),

//   z.object({
//     command: z.literal("set_state"),
//     id: z.string(),
//     state: z.number(),
//   }),
// ]);

// export const   SerialCMDLed =z.object({
//     ...cmdBase,
//     moduletype: z.literal("led"),
//     payload: LedCommandTypeScheme,
//   })

// export const SerialCMDServo = z.object({
//   ...cmdBase,
//   moduletype: z.literal("servo"),
//   payload: ServoCommandTypeScheme,
// })

// export const SerialCMDClusterLeds = z.object({
//   ...cmdBase,
//   moduletype: z.literal("cluster_leds"),
//   payload: ClusterCommandTypeScheme,
// })

// export const SerialCMDScheme = z.discriminatedUnion("moduletype", [
//   SerialCMDLed,
//   SerialCMDServo,
//   SerialCMDClusterLeds,
// ]);

// export type SerialCMDType = z.infer<typeof SerialCMDScheme>;
