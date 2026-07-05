



import ButtonM from '@/components/Modules/ButtonM'
import { LedCard } from '@/components/Modules/led'
import { useListenStore, usePortStore } from '@/Hook/state'
import { BasicModules, OnlyModules, sendSerialCommand } from '@/Hook/Zod'
import React, { useEffect, useState } from 'react'

export default function Devices() {
  const modules = useListenStore((state) => state.modules)


  


  return (
    <div className=' flex flex-col h-[88dvh] gap-2.5 p-3 overflow-y-auto'>
      {modules.map(item => {
        switch (item.moduletype) {
          case "led":
            return <LedCard key={item.id} info={item} />

          case "button":
            return <ButtonM key={item.id} info={item} />

          default:
            return null;
        }
      })}



    </div>
  )
}


