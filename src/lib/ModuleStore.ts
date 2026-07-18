import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { Command } from "./ModuleCommand";
import { ModuleEventEnvelope } from "./ModuleEven";
import {
  ModuleDefinitionType,
  Registration,
  TypeIdentifier,
} from "./ModuleDefinitionSchema";
type ModuleInfo<T extends TypeIdentifier> = {
  data: Extract<
    ModuleDefinitionType,
    { module_type: T }
  >;

  command: (
    command: Extract<Command, { module_type: T }>
  ) => Promise<void>;
};


type ModuleStore = {
  modules: Record<string, ModuleDefinitionType>;
  LookUp_ID_refTo_ID: Record<string, string>;

   registerModule: (registration: Registration) => void;
  dispatchModuleEvent: (event: ModuleEventEnvelope) => void;
  sendCommand: (command: Command) => Promise<void>;

  getModule: <T extends TypeIdentifier>(
    type: T,
    id: string,
  ) => ModuleInfo<T>| undefined ;
};


export const useModuleStore = create<ModuleStore>((set, get) => ({
  modules: {},
  LookUp_ID_refTo_ID:{},

  registerModule: (registration) => {
    const module = createModule(registration);

    set((store) => ({
      modules: {
        ...store.modules,
        [registration.id]: module,
      },
      LookUp_ID_refTo_ID :{
        ...store.LookUp_ID_refTo_ID,
        [registration.lool_up_id]:registration.id
      }
    }));
  },

  dispatchModuleEvent: (event) => {
    set((store) => {
      const module = store.modules[event.id];

      if (!module) {
        return {};
      }

      switch (event.module_type) {
        case "Led": {
          if (!isModuleType(module, "Led")) {
            return {};
          }

          return {
            modules: {
              ...store.modules,
              [event.id]: {
                ...module,
                state: {
                  brightness: event.event.event === "Brightness"
                    ? event.event.level
                    : event.event.on ? 100 : 0,
                },
              },
            },
          };
        }

        case "Button": {
          if (!isModuleType(module, "Button")) {
            return {};
          }

          const on = event.event.event === "Pressed"
            ? true
            : event.event.event === "Released"
              ? false
              : event.event.on;

          return {
            modules: {
              ...store.modules,
              [event.id]: {
                ...module,
                state: { on },
              },
            },
          };
        }

        case "Servo": {
          if (!isModuleType(module, "Servo")) {
            return {};
          }

          return {
            modules: {
              ...store.modules,
              [event.id]: {
                ...module,
                state: { angle: event.event.angle },
              },
            },
          };
        }
      }
    });
  },

  sendCommand: async (command) => {
    await invoke("send_serial_command", { data: command });
  },

  getModule: (type, id) => {

    const get_root_id  = get().LookUp_ID_refTo_ID[id];
    if (!get_root_id){
       return undefined;
    }
    const module = get().modules[get_root_id];

    if (!module || !isModuleType(module ,type)) {
      return undefined;
    }

    return {
      data: module,
      command: async (command) => {
        await get().sendCommand(command);
      },
    } ;
  },
}));

function createModule(
  registration: Registration,
): ModuleDefinitionType {
  switch (registration.module_type) {
    case "Led":
      return {
        id: registration.id,
          parent_id:registration.parent_id,
        module_type: "Led",
        lool_up_id: registration.lool_up_id,
        state: {
          brightness: 0,
        },
      };

    case "Button":
      return {
        id: registration.id,
         parent_id:registration.parent_id,
        module_type: "Button",
        lool_up_id: registration.lool_up_id,
        state: {
          on: false,
        },
      };

    case "Servo":
      return {
        id: registration.id,
          parent_id:registration.parent_id,
        module_type: "Servo",
        lool_up_id: registration.lool_up_id,
        state: {
          angle: 0,
        },
      };

    default:
      throw new Error(
        `Unsupported module type: ${registration.module_type}`,
      );
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
