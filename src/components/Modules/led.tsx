import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { memo, useState } from 'react';
import ModuleCore from './ModuleCore';
import z from 'zod';
import { Command } from '@/lib/ModuleCommand';
import { LedModule } from '@/lib/ModuleDefinitionSchema';


type LedCardProps = {
  module: z.infer<typeof LedModule>;
  sendCommand: (command: Command) => Promise<void>;
};

export const LedCard = memo(function LedCard({ module, sendCommand }: LedCardProps) {
  const [data, setData] = useState(module.state.brightness);

  function SendCmdByText() {
    const clanp = Math.min(Math.max(data, 0), 100)
    void sendCommand({
      id: module.id,
      module_type: "Led",
      command: {
        SetState: {
          state: clanp
        }
      }
    })


  }

  return (
    <ModuleCore
      id={module.id}
      manuel_id={module.lool_up_id}
      moduletype={module.module_type}
    >
      <div className=' flex flex-col items-center gap-2.5'>
        <h1 className=' text-3xl text-center  w-10'>
          {data}
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

            void sendCommand({
              id: module.id,
              module_type: "Led",
              command: {
                SetState: {
                  state: data === 0? 100: 0
                }
              }
            })

          }}
        >
          Toggle
        </Button>



      </div>
    </ModuleCore>





  )





});
