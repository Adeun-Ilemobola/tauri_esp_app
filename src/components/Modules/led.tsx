import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Copy } from 'lucide-react';
import { Separator } from '../ui/separator';
import ModuleCore from './ModuleCore';
import z from 'zod';
import { LedModule } from '@/lib/ModuleDefinitionSchema';
import { useModuleStore } from '@/lib/ModuleStore';


export function LedCard({ info }: { info: z.infer<typeof LedModule> }) {
  const getModule = useModuleStore((state) => state.getModule("Led", info.lool_up_id))

  if (!getModule) {
    return null
  }

  const [data, setData] = useState(getModule.data.state.brightness);

  function SendCmdByText() {
    const clanp = Math.min(Math.max(data, 0), 100)
    getModule?.command({
      id: getModule.data.id,
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
      id={info.id}
      manuel_id={info.lool_up_id}
      moduletype={info.module_type}
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

            getModule?.command({
              id: getModule.data.id,
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





}