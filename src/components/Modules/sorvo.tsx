import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnlyModules, sendSerialCommand } from '@/Hook/Zod';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import ModuleCore from './ModuleCore';


function clamp(value: number, min: number, max: number) {
  return Math.round(Math.min(Math.max(value, min), max));
}

function NumberField({
  label,
  value,
  onChange,
  onCommit,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  onCommit: () => void
}) {
  return (
    <div className=' flex flex-col gap-1'>
      <label className=' text-xs text-accent-foreground/35'>{label}</label>
      <Input
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? 0 : parseInt(raw) || 0);
        }}
        onKeyDown={(e) => {
          if (e.key != 'Enter') return;
          e.preventDefault();
          onCommit();
        }}
      />
    </div>
  )
}

export function SorvoCard({ info }: { info: OnlyModules<"sorvo"> }) {
  const { angle, offset, min_pivot, max_pivot, config } = info.payload;

  const [pivot, setPivot] = useState(min_pivot);
  const [minPivot, setMinPivot] = useState(min_pivot);
  const [maxPivot, setMaxPivot] = useState(max_pivot);

  function sendAngle() {
    sendSerialCommand({
      id: info.id,
      kind: "CMD",
      moduletype: "sorvo",
      payload: {
        command: "set_angle",
        angle: clamp(pivot, min_pivot, max_pivot),
      }
    })
  }

  function sendMinPivot() {
    sendSerialCommand({
      id: info.id,
      kind: "CMD",
      moduletype: "sorvo",
      payload: {
        command: "set_min_pivot",
        min_pivot: clamp(minPivot, 0, max_pivot),
      }
    })
  }

  function sendMaxPivot() {
    sendSerialCommand({
      id: info.id,
      kind: "CMD",
      moduletype: "sorvo",
      payload: {
        command: "set_max_pivot",
        max_pivot: Math.round(Math.max(maxPivot, min_pivot)),
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
        <h1 className=' text-3xl text-center'>
          {angle}&deg;
        </h1>

        <div className=' flex flex-row items-center gap-2'>
          <Badge variant={"outline"}>pivot {min_pivot}&ndash;{max_pivot}</Badge>
          <Badge variant={"outline"}>offset {offset}</Badge>
          <Badge variant={"outline"}>limit {config.min_angle}&ndash;{config.max_angle}</Badge>
        </div>

        <NumberField
          label='Pivot'
          value={pivot}
          onChange={setPivot}
          onCommit={sendAngle}
        />

        <Button onClick={sendAngle}>
          Set Angle
        </Button>

        <div className=' flex flex-row gap-2.5'>
          <NumberField
            label='Min Pivot'
            value={minPivot}
            onChange={setMinPivot}
            onCommit={sendMinPivot}
          />
          <NumberField
            label='Max Pivot'
            value={maxPivot}
            onChange={setMaxPivot}
            onCommit={sendMaxPivot}
          />
        </div>
      </div>
    </ModuleCore>
  )
}
