


import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePortStore, useSerial } from '@/Hook/state';
import { PortConnectionScheme, PortConnectionType } from '@/Hook/Zod';
import { useEffect, useState } from 'react'

export default function PortSettings() {
  const { portInfo, connect, status, error , listPorts , getPorts , setPortInfo } = usePortStore()
  

  useEffect(() => {
    getPorts()
  }, [])
  function MakeConnect() {
    const val = PortConnectionScheme.safeParse(portInfo)
    if (val.success) {
      connect(
        val.data.port,
        val.data.baudRate
      )

    }

  }

  return (
    <div className=' min-h-screen  w-full flex flex-col gap-0.5 p-3 items-center'>
      <h1 className=' text-4xl'>PortSettings</h1>


      <div className=' flex  flex-col gap-2'>

        <div className=' flex flex-row gap-4'>


          <div className=' flex flex-col gap-1'>
            <Label>
              Ports
            </Label>

            <Select
              value={portInfo.port}
              onValueChange={((val) => {
                if (val === "__none__") {
                  return
                }
                setPortInfo({port:val})
              })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ports" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {listPorts.length === 0 ? (
                    <SelectItem value="__none__" disabled>No ports available</SelectItem>
                  ) : (
                    listPorts.map(port => (
                      <SelectItem key={port} value={port}>{port}</SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

          </div>

          <div className=' flex flex-col gap-1'>
            <Label>
              baud Rate
            </Label>
            <Input
              value={portInfo.baudRate}
              onChange={(e) => {
                const val = e.target.value
                const toNum = Number(val)
                if (!isNaN(toNum)) {
                  setPortInfo({ baudRate: toNum })
                }
              }}

            />
          </div>

        </div>


        <div className=' flex flex-col gap-2'>
          <Button
          onClick={()=>{
            MakeConnect()
          }}
          >
            Connect to port
          </Button>
          <p>
            {status}
          </p>

          {error && (<>
            <p className=' text-amber-700'>
              {error}

            </p>

          </>)}

        </div>

      </div>

    </div>
  )
}
