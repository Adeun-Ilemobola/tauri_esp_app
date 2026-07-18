import z from "zod";
export const moduleTypeIdentifier = z.enum([
    "Servo",
    "Led",
    "Imu",
    "LedCluster",
    "Button"
])
export type TypeIdentifier = z.infer<typeof moduleTypeIdentifier>

export const RegistrationSchema = z.object({
    id: z.string(),
    lool_up_id: z.string(),
    parent_id:z.string(),
    module_type: z.union([
        z.literal(moduleTypeIdentifier.enum.Led),
        z.literal(moduleTypeIdentifier.enum.Servo),
        z.literal(moduleTypeIdentifier.enum.Button),
    ]),
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

export const ModuleDefinitionSchema = z.discriminatedUnion("module_type", [
    LedModule, ServoModule, ButtonModule
]
)

export type ModuleDefinitionType = z.infer < typeof ModuleDefinitionSchema >

