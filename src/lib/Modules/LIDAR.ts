import z from "zod";
import type { ModuleDefinitionType } from "../ModuleDefinitionSchema";

export const PointSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

export const RangePointSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  distant: z.number().int().nonnegative(),
});

const RangePointEventSchema = RangePointSchema.extend({
  event_type: z.literal("RangPoint"),
});

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

export const LidarEventSchema = z.discriminatedUnion("event_type", [
  z.object({
    event_type: z.literal("Roi"),
    id: z.string(),
    min: PointSchema,
    max: PointSchema,
  }),
  z.object({
    event_type: z.literal("PointMap"),
    id: z.string(),
    map: z.array(RangePointEventSchema),
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

export const LidarModule = z.object({
  id: z.string(),
  lool_up_id: z.string(),
  parent_id: z.string(),
  module_type: z.literal("Lidar"),
  state: z.object({
    state: z.enum(["Idol", "Scanning", "StopScan"]),
    map: z.array(RangePointSchema),
    ROI: z.object({
      min: PointSchema,
      max: PointSchema,
    }),
  }),
});

export function lidarInitialBuild(
  id: string,
  parent_id: string,
  lool_up_id: string,
): z.infer<typeof LidarModule> {
  return {
    id,
    parent_id,
    module_type: "Lidar",
    lool_up_id,
    state: {
      state: "Idol",
      map: [],
      ROI: {
        min: { x: 0, y: 0 },
        max: { x: 0, y: 0 },
      },
    },
  };
}

export function updateLidar(
  module: ModuleDefinitionType,
  event: z.infer<typeof LidarEventSchema>,
): ModuleDefinitionType {
  if (module.module_type !== "Lidar") return module;

  switch (event.event_type) {
    case "Roi":
      return {
        ...module,
        state: {
          ...module.state,
          ROI: { min: event.min, max: event.max },
        },
      };

    case "PointMap":
      return {
        ...module,
        state: {
          ...module.state,
          map: event.map.map(({ x, y, distant }) => ({ x, y, distant })),
        },
      };

    case "Target":
      return module;

    case "ScanState":
      return {
        ...module,
        state: { ...module.state, state: event.state },
      };
  }
}
