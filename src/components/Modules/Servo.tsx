import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ServoModule } from '@/lib/ModuleDefinitionSchema';
import { useModuleStore } from '@/lib/ModuleStore';
import { useEffect, useState } from 'react';
import z from 'zod';
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


export function ServoCard({ info }: { info: z.infer<typeof ServoModule> }) {
  const getModule = useModuleStore((state) => state.getModule("Servo", info.lool_up_id));

  const [pivot, setPivot] = useState(getModule?.data.state.angle ?? 0);
  const [minPivot, setMinPivot] = useState(-90);
  const [maxPivot, setMaxPivot] = useState(90);

  useEffect(() => {
    if (getModule) {
      setPivot(getModule.data.state.angle);
    }
  }, [getModule?.data.state.angle]);

  if (!getModule) {
    return null;
  }

  function sendAngle() {
    void getModule?.command({
      id: getModule.data.id,
      module_type: "Servo",
      command: {
        SetAngle: {
          angle: clamp(pivot, minPivot, maxPivot),
        },
      }
    })
  }

  function sendMinPivot() {
    void getModule?.command({
      id: getModule.data.id,
      module_type: "Servo",
      command: {
        SetMinPivot: {
          min_pivot: Math.min(Math.round(minPivot), maxPivot),
        },
      }
    })
  }

  function sendMaxPivot() {
    void getModule?.command({
      id: getModule.data.id,
      module_type: "Servo",
      command: {
        SetMaxPivot: {
          max_pivot: Math.round(Math.max(maxPivot, minPivot)),
        },
      }
    })
  }

  return (
    <ModuleCore
      id={getModule.data.id}
      manuel_id={getModule.data.lool_up_id}
      moduletype={getModule.data.module_type}
    >
      <div className=' flex flex-col items-center gap-2.5'>
        <h1 className=' text-3xl text-center'>
          {getModule.data.state.angle}&deg;
        </h1>

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
