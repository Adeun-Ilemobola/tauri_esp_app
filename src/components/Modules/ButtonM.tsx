import { messageBase, OnlyModules } from "@/Hook/Zod";
import z from "zod";

import { Badge } from "../ui/badge";

export const ButtonPayloadScheme = z.object({ pressed: z.boolean() });
export const ButtonSerialMessageScheme = z.object({ ...messageBase, moduletype: z.literal("button"), payload: ButtonPayloadScheme })


export default function ButtonM({ info }: { info: OnlyModules<"button"> }) {
  const pressed = info.payload.pressed;

  return (
    <div className=' relative flex flex-col gap-1.5 pt-5 p-2 rounded bg-gray-700/75'>
      <Badge className=' absolute -top-2 right-3' variant={"secondary"}>
        {info.moduletype}
      </Badge>
      <p className=' text-sm  text-amber-600/40'>{info.id}</p>

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
    </div>
  )
}
