import { ServoCard } from "@/components/Modules/Servo"
import { Card, CardContent } from "@/components/ui/card"
import { useModuleStore } from "@/lib/ModuleStore"
import { CubeIcon } from "@phosphor-icons/react"





export default function Dashboard() {
  const lidar = useModuleStore((state) => selectModule(state, "lidar", "Lidar"))
  const servoX = useModuleStore((state) => selectModule(state, "servo_x", "Servo"))
  const servoY = useModuleStore((state) => selectModule(state, "servo_y", "Servo"))
  const sendCommand = useModuleStore((state) => state.sendCommand)


  if (!lidar || !servoX || !servoY) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-3xl items-center justify-center p-6">
        <Card className="w-full max-w-md text-center" size="sm">
          <CardContent className="flex flex-col items-center py-10">
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <CubeIcon className="size-6" weight="duotone" />
            </div>
            <h1 className="font-heading text-2xl font-medium">Waiting for a LiDAR</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Connect a LiDAR module to view its identity, scan area, and axis controls.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full min-h-0 w-full">
       <h1 className=' text-4xl'>Dashboard</h1>

       <div className=" flex  flex-row gap-3.5  items-center p-1">
        <ServoCard module={servoX} sendCommand={sendCommand}/>
        <ServoCard module={servoY} sendCommand={sendCommand}/>
       </div>
      
    </div>
  )
}

function selectModule<T extends "Lidar" | "Servo">(
  state: ReturnType<typeof useModuleStore.getState>,
  lookupId: string,
  moduleType: T,
) {
  const id = state.LookUp_ID_refTo_ID[lookupId]
  const module = id ? state.modules[id] : undefined
  return module?.module_type === moduleType
    ? module as Extract<typeof module, { module_type: T }>
    : undefined
}
