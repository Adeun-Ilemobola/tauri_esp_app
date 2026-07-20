import z from "zod";
import { PointSchema } from "./ModuleEven";


export const moduleTypeIdentifier = z.enum([
    "Servo",
    "Led",
    "Imu",
    "LedCluster",
    "Button",
    "Lidar",
    "SysLog",
    "Rangefinder"
])
export type TypeIdentifier = z.infer<typeof moduleTypeIdentifier>

export const RegistrationSchema = z.object({
    id: z.string(),
    lool_up_id: z.string(),
    parent_id:z.string(),
    module_type: moduleTypeIdentifier,
})

export type Registration = z.infer<typeof RegistrationSchema>

export const LedModule = z.object({
    id: z.string(),
    lool_up_id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Led),
     parent_id:z.string(),
    state: z.object({
        brightness: z.number()
    }),

})

export const ButtonModule = z.object({
  id: z.string(),
   lool_up_id: z.string(),
   module_type: z.literal(moduleTypeIdentifier.enum.Button),
    parent_id:z.string(),

  state: z.object({
    on: z.boolean(),
  }),

});

export const ServoModule = z.object({
    id: z.string(),
    lool_up_id: z.string(),
    parent_id:z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Servo),
    state: z.object({
        angle: z.number(),
    }),
})


export const RangefinderModule = z.object({
  id: z.string(),
  lool_up_id: z.string(),
  parent_id: z.string(),
  module_type: z.literal(moduleTypeIdentifier.enum.Rangefinder),

  state: z.object({
    range_mm: z.number().int().nonnegative(),
    is_ranging: z.boolean(),
    timing_budget_ms: z.number().int().nonnegative(),
    distance_mode: z.enum(["Short", "Long"]),
    last_invalid_status: z.string().nullable(),
  }),
});

export const LidarModule = z.object({
    id: z.string(),
    lool_up_id: z.string(),
    parent_id:z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Lidar),
    state: z.object({
        state: z.enum(["Idol", "Scanning", "StopScan"]),
        map:z.array(
            z.object({
              x: z.number(),
              y: z.number(),
              distant: z.number(),
            })
        ),
        ROI:z.object({
            min:PointSchema,
            max:PointSchema
        })

    }),
})

export const ModuleDefinitionSchema = z.discriminatedUnion("module_type", [
    LedModule, ServoModule, ButtonModule , LidarModule , RangefinderModule
]
)

export type ModuleDefinitionType = z.infer < typeof ModuleDefinitionSchema >
