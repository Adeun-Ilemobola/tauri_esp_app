



import {ButtonModule} from '@/components/Modules/ButtonModule'
import { LedCard } from '@/components/Modules/led'
import { ServoCard } from '@/components/Modules/Servo'
import { useListenStore } from '@/Hook/state'


export default function Devices() {
  const modules = useListenStore((state) => state.modules)

  return (
    <div className=' flex flex-col h-[88dvh] gap-3 p-3 overflow-y-auto'>
      {modules.map(item => {
        switch (item.moduletype) {
          case "led":
            return <LedCard key={item.id} info={item} />

          case "button":
            return <ButtonModule key={item.id} info={item} />

          case "servo":
            return <ServoCard key={item.id} info={item} />

          default:
            return null;
        }
      })}



    </div>
  )
}


