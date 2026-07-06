import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnlyModules, sendSerialCommand } from '@/Hook/Zod';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Copy } from 'lucide-react';
import { Separator } from '../ui/separator';
import ModuleCore from './ModuleCore';


export function LedCard({ info }: { info: OnlyModules<"led"> }) {
  const [data, setData] = useState(0);

  function SendCmdByText() {
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

  }

  return (
    <ModuleCore
      id={info.id}
      manuel_id={info.manuel_id}
      moduletype={info.moduletype}
    >
      <div className=' flex flex-col items-center gap-2.5'>
        <h1 className=' text-3xl text-center  w-10'>
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
            SendCmdByText()
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
    </ModuleCore>





  )





}