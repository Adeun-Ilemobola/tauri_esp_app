import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnlyModules, sendSerialCommand } from '@/Hook/Zod';
import { useEffect, useState } from 'react';
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
  label: string;
  value: number;
  onChange: (value: number) => void;
  onCommit: () => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function handleChange(raw: string) {
    // Allow empty typing and negative typing states:
    // "", "-", "-3", "35"
    if (!/^-?\d*$/.test(raw)) return;

    setDraft(raw);

    // Do not commit incomplete values yet
    if (raw === "" || raw === "-") return;

    onChange(Number(raw));
  }

  function handleCommit() {
    // If user leaves it empty or just "-", restore real value
    if (draft === "" || draft === "-") {
      setDraft(String(value));
      return;
    }

    onChange(Number(draft));
    onCommit();
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-accent-foreground/35">
        {label}
      </label>

      <Input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          handleCommit();
        }}
        onBlur={handleCommit}
      />
    </div>
  );
}


export function ServoCard({ info }: { info: OnlyModules<"servo"> }) {
  const { angle, offset, min_pivot, max_pivot, config } = info.payload;

  const [pivot, setPivot] = useState(min_pivot);
  const [minPivot, setMinPivot] = useState(min_pivot);
  const [maxPivot, setMaxPivot] = useState(max_pivot);

  function sendAngle() {
    // console.info("angle :" + clamp(pivot, min_pivot, max_pivot))
    sendSerialCommand({
      id: info.id,
      kind: "CMD",
      moduletype: "servo",
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
      moduletype: "servo",
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
      moduletype: "servo",
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
