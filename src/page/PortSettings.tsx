


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
import { useSerial } from '@/Hook/state';
import { useEffect, useState } from 'react'

export default function PortSettings() {
  const {ports , listPorts}  =useSerial()
  const [baudRate, setbaudRate] = useState<number>(115200)
  useEffect(()=>{
      listPorts();
    },[])
  function MakeConnect() {

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

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ports" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ports.length === 0 ? (
                    <SelectItem value="__none__" disabled>No ports available</SelectItem>
                  ) : (
                    ports.map(port => (
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
              onChange={(e) => {
                const val = e.target.value
                

              }}

            />
          </div>

        </div>


        <Button>
          Connect to port
        </Button>

      </div>

    </div>
  )
}
