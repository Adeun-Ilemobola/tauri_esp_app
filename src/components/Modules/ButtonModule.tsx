import { ButtonModule as ButtonModuleSchema } from "@/lib/ModuleDefinitionSchema";
import { useModuleStore } from "@/lib/ModuleStore";
import z from "zod";
import ModuleCore from "./ModuleCore";



export function ButtonModule({ info }: { info: z.infer<typeof ButtonModuleSchema> }) {
  const getModule = useModuleStore((state) => state.getModule("Button", info.lool_up_id));

  if (!getModule) {
    return null;
  }

  const pressed = getModule.data.state.on;

  return (
    <ModuleCore
      id={getModule.data.id}
      manuel_id={getModule.data.lool_up_id}
      moduletype={getModule.data.module_type}
    >

      <div className=' flex flex-row items-center gap-2.5'>
        <span
          className={
            'h-4 w-4 rounded-full ' +
            (pressed ? 'bg-green-500 shadow-[0_0_8px_2px] shadow-green-500/60' : 'bg-gray-500')
          }
        />
        <h1 className=' text-xl font-medium'>
          {pressed ? 'Pressed' : 'Released'}
        </h1>
      </div>
    </ModuleCore>
  )
}
