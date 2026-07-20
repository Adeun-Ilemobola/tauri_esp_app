import z from "zod";
import { moduleTypeIdentifier } from "./ModuleDefinitionSchema";

export const LedCommandTypeSchema = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("SetState"),
    state: z.number(),
  }),
  z.object({
    command: z.literal("Toggle"),
  }),
]);

export const ServoCommandTypeSchema = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("SetAngle"),
    angle: z.number(),
  }),
  z.object({
    command: z.literal("SetMinPivot"),
    min_pivot: z.number(),
  }),
  z.object({
    command: z.literal("SetMaxPivot"),
    max_pivot: z.number(),
  }),
]);

export const ClusterCommandTypeSchema = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("ToggleAll"),
  }),
  z.object({
    command: z.literal("SetAll"),
    state: z.number(),
  }),
  z.object({
    command: z.literal("Toggle"),
    id: z.string(),
    state: z.number(),
  }),
  z.object({
    command: z.literal("SetState"),
    id: z.string(),
    state: z.number(),
  }),
]);

export const PointSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

export const RangefinderDistanceModeSchema = z.enum([
  "Short",
  "Long",
]);

export const RangefinderCommandTypeSchema = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("StartRanging"),
  }),

  z.object({
    command: z.literal("StopRanging"),
  }),

  z.object({
    command: z.literal("SetTimingBudget"),
    milliseconds: z.number().int().positive(),
  }),

  z.object({
    command: z.literal("SetDistanceMode"),
    mode: RangefinderDistanceModeSchema,
  }),
]);

export type RangefinderDistanceMode = z.infer<
  typeof RangefinderDistanceModeSchema
>;

export const LidarCommandTypeSchema = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("Roi"),
    min: PointSchema,
    max: PointSchema,
  }),
  z.object({
    command: z.literal("StartScan"),
  }),
  z.object({
    command: z.literal("StopScan"),
  }),
  z.object({
    command: z.literal("Test"),
  }),
  z.object({
    command: z.literal("SetStep"),
    step: z.number().int().nonnegative(),
  }),
  z.object({
    command: z.literal("ChangeMotorAngle"),
    id: z.string(),
    step: z.number().int(),
  }),
  z.object({
    command: z.literal("MovePos"),
    p: PointSchema,
  }),
]);

export const ModuleCommandSchema = z.discriminatedUnion("module_type", [
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Led),
    payload: LedCommandTypeSchema,
  }),
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Servo),
    payload: ServoCommandTypeSchema,
  }),
  z.object({
    id: z.string(),
    module_type: z.literal("ClusterLeds"),
    payload: ClusterCommandTypeSchema,
  }),
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Lidar),
    payload: LidarCommandTypeSchema,
  }),
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Rangefinder),
    payload: RangefinderCommandTypeSchema,
  }),
]);

export type Command = z.infer<typeof ModuleCommandSchema>;
