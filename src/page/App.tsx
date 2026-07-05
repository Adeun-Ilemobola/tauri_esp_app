import "@/App.css";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortStore } from "@/Hook/state";

function App() {
  const listPorts = usePortStore((state) => state.listPorts)
  const getPorts =  usePortStore((state)=> state.getPorts)
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(()=>{
    getPorts()
  } , [])
  


  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
   
  }

  

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Serial port monitor</p>
        </div>
        <Badge variant={listPorts.length > 0 ? "default" : "outline"}>
          {listPorts.length} port{listPorts.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Command</CardTitle>
          <CardDescription>Send a greeting via Tauri invoke</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              greet();
            }}
          >
            <Input
              id="greet-input"
              className="flex-1"
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a name..."
            />
            <Button type="submit">Greet</Button>
          </form>
          {greetMsg && (
            <p className="text-sm text-muted-foreground">{greetMsg}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serial Ports</CardTitle>
          <CardDescription>
            {listPorts.length === 0
              ? "No ports detected"
              : `${listPorts.length} port${listPorts.length === 1 ? "" : "s"} available`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listPorts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Connect a device and refresh.
            </p>
          ) : (
            <div className="grid gap-2">
              {listPorts.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-3xl border bg-input/30 px-4 py-2"
                >
                  <span className="text-sm font-mono">{item}</span>
                  <Badge variant="secondary">active</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
