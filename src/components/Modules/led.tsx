import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cmdBase, messageBase, OnlyModules, sendSerialCommand } from '@/Hook/Zod';
import { useState } from 'react';
import z from 'zod';

export const LedPayloadScheme    = z.object({ state: z.number() });
export const led_SerialMessageScheme = z.object({ ...messageBase, moduletype: z.literal("led"),    payload: LedPayloadScheme })



export const LedCommandTypeScheme = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("set_state"),
    state: z.number().int(),
  }),

  z.object({
    command: z.literal("toggle"),
  }),
]);

export const   SerialCMDLed =z.object({
    ...cmdBase,
    moduletype: z.literal("led"),
    payload: LedCommandTypeScheme,
  })





export function LedCard({ info }: { info: OnlyModules<"led"> }) {
  const [data, setData] = useState(0);

  return (
    <div
      className=' relative flex flex-col gap-1.5 pt-5 p-2 rounded bg-gray-700/75'
    >
      <Badge className=' absolute -top-2 right-3' variant={"secondary"}>
        {info.moduletype}
      </Badge>
      <p className=' text-sm  text-amber-600/40'>{info.id}</p>
      <div className=' flex flex-row items-center gap-2.5'>
        <h1 className=' text-2xl text-center  w-10'>
          {info.payload.state}
        </h1>


        <Input
          value={data}
          onChange={(e) => {
            const raw = e.target.value;


            setData(raw === "" ? 0 : parseInt(raw) || 0);
          }}
          onKeyDown={(e) => {
            if (e.key != 'Enter') return;
            e.preventDefault();
            const clanp = Math.min(Math.max(data, 0), 100)
            sendSerialCommand({
              id: info.id,
              kind: "CMD",
              moduletype: "led",
              payload: {
                command: "set_state",
                state: clanp
              }
            })


          }}

        />

        <Button
          onClick={() => {

            sendSerialCommand({
              id: info.id,
              kind: "CMD",
              moduletype: "led",
              payload: {
                command: "toggle",
              }
            })

          }}
        >
          Toggle
        </Button>



      </div>

    </div>
  )





}