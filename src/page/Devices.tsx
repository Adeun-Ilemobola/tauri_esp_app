



import {ButtonModule} from '@/components/Modules/ButtonModule'
import { LedCard } from '@/components/Modules/led'
// import { ServoCard } from '@/components/Modules/Servo'
import { useListenStore } from '@/Hook/state'


export default function Devices() {
  const modules = useListenStore((state) => state.modules)

  return (
    <div className=' flex flex-col h-[88dvh] gap-3 p-3 overflow-y-auto'>
      {modules.map(item => {
        switch (item.moduletype) {
          case "Led":
            return <LedCard key={item.id} info={item} />

          case "Button":
            return <ButtonModule key={item.id} info={item} />

          case "Servo":
            // return <ServoCard key={item.id} info={item} />
            return null

          default:
            return null;
        }
      })}



    </div>
  )
}


