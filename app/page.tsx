'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { MonitoringCards } from '@/components/dashboard/monitoring-cards'
import { DeviceStatusCards } from '@/components/dashboard/device-status-cards'
import { ControlPanel } from '@/components/dashboard/control-panel'
import { DataChart } from '@/components/dashboard/data-chart'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' 
import { Button } from '@/components/ui/button'
import { Building2, DoorOpen, Info, WifiOff } from 'lucide-react'

export default function DashboardPage() {
  const { data, loading, error } = useFirebaseData()

  const [nodes, setNodes] = useState<any[]>([])
  const [activeFloor, setActiveFloor] = useState<string>('')
  const [activeRoom, setActiveRoom] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedNodes = localStorage.getItem('iot_nodes_list')
    if (savedNodes) {
      const parsedNodes = JSON.parse(savedNodes)
      setNodes(parsedNodes)
      if (parsedNodes.length > 0) {
        setActiveFloor(parsedNodes[0].floor || 'Tầng 1')
        setActiveRoom(parsedNodes[0].room || 'Phòng khách')
      }
    }
    setMounted(true)
  }, [])

  const floors = Array.from(new Set(nodes.map(n => n.floor || 'Unknown')))
  const roomsInActiveFloor = Array.from(
    new Set(nodes.filter(n => (n.floor || 'Unknown') === activeFloor).map(n => n.room || 'Unknown'))
  )

  const handleSelectFloor = (floor: string) => {
    setActiveFloor(floor)
    const rooms = nodes.filter(n => n.floor === floor).map(n => n.room)
    if (rooms.length > 0) {
      setActiveRoom(rooms[0])
    } else {
      setActiveRoom('')
    }
  }

  const activeRoomNodes = nodes.filter(n => n.floor === activeFloor && n.room === activeRoom)
  const hasRealDataNode = activeRoomNodes.some(n => n.id === 'node-001')

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Giám sát thông số môi trường và thiết bị theo từng khu vực
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {nodes.length > 0 ? (
          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <span className="font-semibold text-sm w-16">Tầng:</span>
              <div className="flex flex-wrap gap-2">
                {floors.map(floor => (
                  <Button
                    key={floor as string}
                    variant={activeFloor === floor ? "default" : "outline"}
                    size="sm"
                    className={activeFloor === floor ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    onClick={() => handleSelectFloor(floor as string)}
                  >
                    {floor as string}
                  </Button>
                ))}
              </div>
            </div>

            {roomsInActiveFloor.length > 0 && (
              <div className="flex items-center gap-3">
                <DoorOpen className="w-5 h-5 text-rose-500" />
                <span className="font-semibold text-sm w-16">Phòng:</span>
                <div className="flex flex-wrap gap-2">
                  {roomsInActiveFloor.map(room => (
                    <Button
                      key={room as string}
                      variant={activeRoom === room ? "default" : "outline"}
                      size="sm"
                      className={activeRoom === room ? "bg-rose-600 hover:bg-rose-700" : "border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400"}
                      onClick={() => setActiveRoom(room as string)}
                    >
                      {room as string}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 text-amber-600 rounded-lg flex gap-2 items-center dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/50">
            <Info className="w-5 h-5" />
            <span>Chưa có trạm cảm biến nào. Vui lòng vào Node Management để thiết lập khu vực.</span>
          </div>
        )}

        {activeRoom && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Dữ liệu khu vực: <span className="text-indigo-500">{activeFloor} - {activeRoom}</span>
              </h2>
            </div>

            {hasRealDataNode ? (
              <>
                {/* Dùng "as any" để ép kiểu TypeScript, loại bỏ gạch đỏ */}
                <MonitoringCards data={data as any} loading={loading} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2 space-y-6">
                    <DeviceStatusCards data={data as any} loading={loading} />
                    <DataChart data={data as any} />
                  </div>
                  <div className="md:col-span-1">
                    <ControlPanel data={data as any} loading={loading} />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10 mt-6">
                {/* Đã sửa lại Comment chuẩn JSX */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <WifiOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Trạm cảm biến đang Offline</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Khu vực này hiện có thiết bị nhưng chưa được cấp nguồn hoặc mất kết nối LoRa.
                </p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </LayoutWrapper>
  )
}