import z from "zod";
import { moduleTypeIdentifier } from "./ModuleDefinitionSchema";


export const LedCommandTypeScheme = z.union([
  z.object({
    SetState: z.object({
      state: z.number(),
    }),
  }),
  z.literal("Toggle"),
]);

export const ServoCommandTypeScheme = z.union([
  z.object({
    SetAngle: z.object({
      angle: z.number(),
    }),
  }),
  z.object({
    SetMinPivot: z.object({
      min_pivot: z.number(),
    }),
  }),
  z.object({
    SetMaxPivot: z.object({
      max_pivot: z.number(),
    }),
  }),
]);

export const ClusterCommandTypeScheme = z.union([
  z.literal("ToggleAll"),
  z.object({
    SetAll: z.object({
      state: z.number(),
    }),
  }),
  z.object({
    Toggle: z.object({
      id: z.string(),
      state: z.number(),
    }),
  }),
  z.object({
    SetState: z.object({
      id: z.string(),
      state: z.number(),
    }),
  }),
]);

export const ModuleCommandSchema = z.discriminatedUnion("module_type", [
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Led),
    command: LedCommandTypeScheme,
  }),
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Servo),
    command: ServoCommandTypeScheme,
  }),
  z.object({
    id: z.string(),
    module_type: z.literal("ClusterLeds"),
    command: ClusterCommandTypeScheme,
  }),
]);

export type Command = z.infer<typeof ModuleCommandSchema>;
