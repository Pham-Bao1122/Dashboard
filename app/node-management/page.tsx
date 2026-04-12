'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Wifi, WifiOff } from 'lucide-react'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' // Lưu ý check lại đường dẫn hook này nhé
import { toast } from 'sonner'

// 1. CẬP NHẬT INTERFACE THÊM TẦNG & PHÒNG
interface NodeInfo {
  id: string
  name: string
  floor: string
  room: string
}

export default function NodeManagementPage() {
  const { data } = useFirebaseData() 
  const [nodes, setNodes] = useState<NodeInfo[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const savedNodes = localStorage.getItem('iot_nodes_list')
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes))
    } else {
      // Dữ liệu mẫu chuẩn cấu trúc mới
      setNodes([{ id: 'node-001', name: 'Trạm trung tâm', floor: 'Tầng 1', room: 'Phòng khách' }])
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('iot_nodes_list', JSON.stringify(nodes))
    }
  }, [nodes, mounted])

  // ==========================================
  // HÀM XỬ LÝ THÊM NODE CÓ CHỌN TẦNG/PHÒNG
  // ==========================================
  const handleAddNode = () => {
    const id = window.prompt('Nhập Mã ID thiết bị (VD: node-001 để kết nối lại mạch thật):')
    if (!id) return 

    if (nodes.some(n => n.id === id)) {
      toast.error('Thiết bị có ID này đã tồn tại trong danh sách!')
      return
    }

    const name = window.prompt('Nhập tên Node (VD: Cảm biến nhiệt độ):') || 'Trạm cảm biến mới'
    
    // Tách riêng hỏi Tầng và Phòng
    const floor = window.prompt('Nhập Tầng (VD: Tầng 1, Tầng 2, Sân vườn):') || 'Tầng 1'
    const room = window.prompt('Nhập Phòng (VD: Phòng khách, Phòng ngủ):') || 'Phòng khách'
    
    const newNode: NodeInfo = { id, name, floor, room }
    
    setNodes([...nodes, newNode])
    toast.success(`Đã thêm ${name} vào ${floor} - ${room}!`)
  }

  const handleDeleteNode = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Node này không?')) {
      setNodes(nodes.filter(n => n.id !== id))
      toast.error('Đã xóa Node khỏi hệ thống.')
    }
  }

  // ==========================================
  // LOGIC ONLINE / OFFLINE (GIỮ NGUYÊN)
  // ==========================================
  const loraActive = data?.LORA_ACTIVATE === 1
  const currentPacketId = data?.packet_id || 0

  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [prevPacketId, setPrevPacketId] = useState(currentPacketId)

  useEffect(() => {
    if (currentPacketId !== prevPacketId) {
      setLastUpdateTime(Date.now())
      setPrevPacketId(currentPacketId)
    }
  }, [currentPacketId, prevPacketId])

  const timeSinceLastUpdate = currentTime - lastUpdateTime
  const isOnline = loraActive && (timeSinceLastUpdate < 10000)
  
  const lastSeenText = isOnline ? 'Vừa xong' : 'Mất kết nối'
  const signalStrength = isOnline ? Math.floor(Math.random() * 15) + 85 : 0 

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Node Management</h1>
          <p className="text-muted-foreground">
            Quản lý vị trí và giám sát trạng thái các trạm cảm biến LoRa
          </p>
        </div>

        <div>
          <Button onClick={handleAddNode} className="flex gap-2">
            <Plus className="w-4 h-4" /> Thêm Node Mới
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Nodes</CardTitle>
            <CardDescription>Danh sách các trạm cảm biến trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Node Name</th>
                    {/* Đổi cột Location thành Tầng / Phòng */}
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Khu vực</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Signal</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Last Seen</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node) => {
                    const isRealNode = node.id === 'node-001'
                    const nodeIsOnline = isRealNode ? isOnline : false
                    const nodeSignal = isRealNode ? signalStrength : 0
                    const nodeLastSeen = isRealNode ? lastSeenText : 'Offline'

                    return (
                      <tr key={node.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-medium flex items-center gap-2">
                            {nodeIsOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                            {node.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{node.id}</p>
                        </td>
                        {/* Hiển thị Tầng và Phòng */}
                        <td className="py-4 px-4">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{node.floor}</span>
                          <span className="text-muted-foreground"> / {node.room}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={nodeIsOnline ? 'default' : 'secondary'} className={nodeIsOnline ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                            {nodeIsOnline ? 'online' : 'offline'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${nodeIsOnline ? 'bg-green-500' : 'bg-muted-foreground'}`}
                                style={{ width: `${nodeSignal}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{nodeSignal}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{nodeLastSeen}</td>
                        <td className="py-4 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteNode(node.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {nodes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        Hệ thống chưa có thiết bị. Hãy thêm thiết bị bằng Mã ID!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}