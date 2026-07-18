import z from "zod";
import { moduleTypeIdentifier } from "./ModuleDefinitionSchema";

const ButtonEventSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("Pressed"),
  }),

  z.object({
    event: z.literal("Released"),
  }),

  z.object({
    event: z.literal("StateChanged"),
    on: z.boolean(),
  }),
]);

const ServoEventSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("GetAngle"),
    angle: z.number(),
  }),
]);

const LedEventSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("Brightness"),
    level: z.number(),
  }),
  z.object({
    event: z.literal("Toggled"),
    on: z.boolean(),
  }),
]);

export const ModuleEventSchema = z.discriminatedUnion("module_type", [
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Led),
    event: LedEventSchema,
  }),

  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Button),
    event: ButtonEventSchema,
  }),
  z.object({
    id: z.string(),
    module_type: z.literal(moduleTypeIdentifier.enum.Servo),
    event: ServoEventSchema,
  }),
]);


export type ModuleEventEnvelope =  z.infer< typeof ModuleEventSchema>
