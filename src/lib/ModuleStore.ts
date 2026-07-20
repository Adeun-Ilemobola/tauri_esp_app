import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { Command } from "./ModuleCommand";
import { ModuleEventEnvelope } from "./ModuleEven";
import {
  ModuleDefinitionType,
  Registration,
  TypeIdentifier,
} from "./ModuleDefinitionSchema";


type ModuleStore = {
  modules: Record<string, ModuleDefinitionType>;
  LookUp_ID_refTo_ID: Record<string, string>;

  registerModule: (registration: Registration) => void;
  dispatchModuleEvent: (event: ModuleEventEnvelope) => void;
  sendCommand: (command: Command) => Promise<void>;

  ModuleCount: () => number,
};


export const useModuleStore = create<ModuleStore>((set, get) => ({
  modules: {},
  LookUp_ID_refTo_ID: {},

  registerModule: (registration) => {

    const module_has = get().modules[registration.id]
    if (module_has) {
      return
    }


    const module = createModule(registration);
    if (!module) {
      return;
    }
    set((store) => ({
      modules: {
        ...store.modules,
        [registration.id]: module,
      },
      LookUp_ID_refTo_ID: {
        ...store.LookUp_ID_refTo_ID,
        [registration.lool_up_id]: registration.id
      }
    }));
  },

  dispatchModuleEvent: (event) => {
    set((store) => {
      if (event.module_type === "SysLog") {
        return store;
      }

      const id = event.event.id;
      const module = store.modules[id];

      if (!module) {
        return store;
      }

      const nextModule = applyModuleEvent(module, event);

      if (modulesEqual(module, nextModule)) {
        return store;
      }

      return {
        modules: {
          ...store.modules,
          [id]: nextModule,
        },
      };
    });
  },

  sendCommand: async (command) => {
    await invoke("send_serial_command", { data: command });
  },

  ModuleCount: () => {
    return Object.values(get().modules).length
  },
}));

function applyModuleEvent(
  module: ModuleDefinitionType,
  event: Exclude<ModuleEventEnvelope, { module_type: "SysLog" }>,
): ModuleDefinitionType {
  switch (event.module_type) {
    case "Led":
      if (!isModuleType(module, "Led")) return module;
      return {
        ...module,
        state: { brightness: event.event.level },
      };

    case "Button":
      if (!isModuleType(module, "Button")) return module;
      return {
        ...module,
        state: { on: !module.state.on },
      };

    case "Servo":
      if (!isModuleType(module, "Servo")) return module;
      if (event.event.event_type !== "GetAngle") return module;
      return {
        ...module,
        state: { angle: event.event.angle },
      };

    case "Lidar":
      if (!isModuleType(module, "Lidar")) return module;

      if (event.event.event_type === "ScanState") {
        return {
          ...module,
          state: { ...module.state, state: event.event.state },
        };
      }

      if (event.event.event_type === "Roi") {
        console.debug(`New Roi ->  min : ${event.event.min} | max : ${event.event.max}`)
        return {
          ...module,
          state: {
            ...module.state,
            ROI: {
              max: event.event.max,
              min: event.event.min
            }
          },
        };
      }

      if (event.event.event_type === "PointMap") {
        return {
          ...module,
          state: {
            ...module.state,
            map: event.event.map.map(({ x, y, distant }) => ({ x, y, distant })),
          },
        };
      }

      return module;

    case "Rangefinder":
      if (!isModuleType(module, "Rangefinder")) {
        return module;
      }
      switch (event.event.event_type) {
        case "Range":
          return {
            ...module,
            state: {
              ...module.state,
              range_mm: event.event.millimeters,
              last_invalid_status: null,
            },
          };

        case "RangingState":
          return {
            ...module,
            state: {
              ...module.state,
              is_ranging: event.event.is_ranging,
            },
          };

        case "TimingBudget":
          return {
            ...module,
            state: {
              ...module.state,
              timing_budget_ms: event.event.milliseconds,
            },
          };

        case "DistanceMode":
          return {
            ...module,
            state: {
              ...module.state,
              distance_mode: event.event.mode,
            },
          };

        case "InvalidMeasurement":
          return {
            ...module,
            state: {
              ...module.state,
              last_invalid_status: event.event.status,
            },
          };


      }


      return module;
  }
}

function modulesEqual(
  previous: ModuleDefinitionType,
  next: ModuleDefinitionType,
): boolean {
  return JSON.stringify(previous).trim() === JSON.stringify(next).trim();
}
function deepEqual(previous: unknown, next: unknown): boolean {
  if (Object.is(previous, next)) return true;
  if (typeof previous !== "object" || previous === null) return false;
  if (typeof next !== "object" || next === null) return false;

  if (Array.isArray(previous) || Array.isArray(next)) {
    if (!Array.isArray(previous) || !Array.isArray(next)) return false;
    if (previous.length !== next.length) return false;
    return previous.every((value, index) => deepEqual(value, next[index]));
  }

  const previousRecord = previous as Record<string, unknown>;
  const nextRecord = next as Record<string, unknown>;
  const previousKeys = Object.keys(previousRecord);
  const nextKeys = Object.keys(nextRecord);

  if (previousKeys.length !== nextKeys.length) return false;

  return previousKeys.every(
    (key) => Object.prototype.hasOwnProperty.call(nextRecord, key)
      && deepEqual(previousRecord[key], nextRecord[key]),
  );
}

function createModule(
  registration: Registration,
): ModuleDefinitionType | undefined {
  switch (registration.module_type) {
    case "Led":
      return {
        id: registration.id,
        parent_id: registration.parent_id,
        module_type: "Led",
        lool_up_id: registration.lool_up_id,
        state: {
          brightness: 0,
        },
      };

    case "Button":
      return {
        id: registration.id,
        parent_id: registration.parent_id,
        module_type: "Button",
        lool_up_id: registration.lool_up_id,
        state: {
          on: false,
        },
      };

    case "Servo":
      return {
        id: registration.id,
        parent_id: registration.parent_id,
        module_type: "Servo",
        lool_up_id: registration.lool_up_id,
        state: {
          angle: 0,
        },
      };

    case "Lidar":
      return {
        id: registration.id,
        parent_id: registration.parent_id,
        module_type: "Lidar",
        lool_up_id: registration.lool_up_id,
        state: {
          state: "Idol",
          map: [],
          ROI: {
            max: { x: 0, y: 0 },
            min: { x: 0, y: 0 },
          }
        },
      };

    case "Rangefinder":
      return {
        id: registration.id,
        parent_id: registration.parent_id,
        module_type: "Rangefinder",
        lool_up_id: registration.lool_up_id,
        state: {
      range_mm: 0,
      is_ranging: false,
      timing_budget_ms: 50,
      distance_mode: "Long",
      last_invalid_status: null,
    },
      };


    default:
      return undefined;
  }
}


function isModuleType<T extends TypeIdentifier>(
  module: ModuleDefinitionType,
  type: T,
): module is Extract<
  ModuleDefinitionType,
  { module_type: T }
> {
  return module.module_type === type;
}
