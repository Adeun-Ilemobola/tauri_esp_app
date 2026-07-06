import { OnlyModules } from "@/Hook/Zod";
import { Badge } from "../ui/badge";
import ModuleCore from "./ModuleCore";



export function ButtonModule({ info }: { info: OnlyModules<"button"> }) {
  const pressed = info.payload.pressed;

  return (
    <ModuleCore
      id={info.id}
      manuel_id={info.manuel_id}
      moduletype={info.moduletype}
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
