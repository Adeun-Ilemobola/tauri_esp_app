import z from "zod";

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const RangPointSchema = z.object({
  event_type: z.literal("RangPoint"),
  x: z.number(),
  y: z.number(),
  distant: z.number(),
});

const LedEventSchema = z.discriminatedUnion("event_type", [
  z.object({
    event_type: z.literal("Brightness"),
    id: z.string(),
    level: z.number(),
  }),
]);

const ServoEventSchema = z.discriminatedUnion("event_type", [
  z.object({
    event_type: z.literal("GetAngle"),
    id: z.string(),
    angle: z.number(),
  }),
  z.object({
    event_type: z.literal("GetMinPivot"),
    id: z.string(),
    min_pivot: z.number(),
  }),
  z.object({
    event_type: z.literal("GetMaxPivot"),
    id: z.string(),
    max_pivot: z.number(),
  }),
  z.object({
    event_type: z.literal("GetOffset"),
    id: z.string(),
    angle: z.number(),
  }),
]);

const LidarEventSchema = z.discriminatedUnion("event_type", [
  z.object({
    event_type: z.literal("Roi"),
    id: z.string(),
    min: PointSchema,
    max: PointSchema,
  }),
  z.object({
    event_type: z.literal("PointMap"),
    id: z.string(),
    map: z.array(RangPointSchema),
  }),
  z.object({
    event_type: z.literal("Target"),
    id: z.string(),
    point: PointSchema,
  }),
  z.object({
    event_type: z.literal("ScanState"),
    id: z.string(),
    state: z.enum(["Idol", "Scanning", "StopScan"]),
  }),
]);

const ButtonEventSchema = z.discriminatedUnion("event_type", [
  z.object({
    event_type: z.literal("Ckick"),
    id: z.string(),
  }),
]);

const SysLogEventSchema = z.object({
  text: z.string(),
  raw_err: z.string().nullable(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

export const ModuleEventSchema = z.discriminatedUnion("module_type", [
  z.object({ module_type: z.literal("Led"), event: LedEventSchema }),
  z.object({ module_type: z.literal("Servo"), event: ServoEventSchema }),
  z.object({ module_type: z.literal("Lidar"), event: LidarEventSchema }),
  z.object({ module_type: z.literal("Button"), event: ButtonEventSchema }),
  z.object({ module_type: z.literal("SysLog"), event: SysLogEventSchema }),
]);

export type ModuleEventEnvelope = z.infer<typeof ModuleEventSchema>;
