'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Wifi, WifiOff, Trash2, Plus, X, Save, Server } from 'lucide-react'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' // Lưu ý check lại đường dẫn hook
import { toast } from 'sonner'

export default function NodeManagementPage() {
  const { data } = useFirebaseData() 
  const [mounted, setMounted] = useState(false)

  // Trạng thái cho Khung Thêm Node
  const [isAddingNode, setIsAddingNode] = useState(false)
  const [selectedAvailableNode, setSelectedAvailableNode] = useState('')
  const [newFloor, setNewFloor] = useState('Tầng 1')
  const [newRoom, setNewRoom] = useState('Phòng Khách')

  const FB_NODE_INFO_URL = "https://doantotnghiep-808e9-default-rtdb.firebaseio.com/NODE_INFO"

  useEffect(() => {
    setMounted(true)
  }, [])

  // ==========================================
  // PHÂN LOẠI DỮ LIỆU: ĐÃ QUẢN LÝ vs ĐANG CHỜ
  // ==========================================
  const nodeInfoList = data?.NODE_INFO || {}    // Các Node ĐÃ được cấp phép (hiện trên Dashboard)
  const activeNodesData = data?.NODES || {}     // Tất cả các Node ĐANG cắm điện (gửi dữ liệu)
  
  const managedNodeIds = Object.keys(nodeInfoList)
  const physicalNodeIds = Object.keys(activeNodesData)

  // Lọc ra những Node đang cắm điện nhưng CHƯA có mặt trong danh sách quản lý
  const availableNodeIds = physicalNodeIds.filter(id => !managedNodeIds.includes(id))

  // ==========================================
  // HÀM XỬ LÝ: THÊM - SỬA - XÓA
  // ==========================================
  
  // 1. LƯU NODE MỚI VÀO HỆ THỐNG
  const submitAddNode = async () => {
    if (!selectedAvailableNode) {
      toast.error('Vui lòng chọn một Trạm đang online từ danh sách!')
      return
    }
    try {
      await fetch(`${FB_NODE_INFO_URL}/${selectedAvailableNode}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LOCATION: newFloor, NAME: newRoom })
      })
      toast.success(`Đã thêm Trạm ${selectedAvailableNode} vào hệ thống thành công!`)
      setIsAddingNode(false)
      setSelectedAvailableNode('')
    } catch (error) {
      toast.error('Lỗi kết nối khi thêm Trạm!')
    }
  }

  // 2. SỬA VỊ TRÍ NODE
  const handleEditNode = async (nodeId: string, currentFloor: string, currentRoom: string) => {
    const floor = window.prompt(`Cập nhật TẦNG cho trạm ${nodeId}:`, currentFloor)
    if (floor === null) return 
    const room = window.prompt(`Cập nhật TÊN PHÒNG cho trạm ${nodeId}:`, currentRoom)
    if (room === null) return 

    try {
      await fetch(`${FB_NODE_INFO_URL}/${nodeId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LOCATION: floor, NAME: room })
      })
      toast.success(`Đã cập nhật vị trí cho trạm ${nodeId}!`)
    } catch (error) {
      toast.error('Lỗi khi cập nhật vị trí!')
    }
  }

  // 3. XÓA NODE KHỎI HỆ THỐNG (ĐƯA VỀ PHÒNG CHỜ)
  const handleDeleteNode = async (nodeId: string) => {
    if (window.confirm(`Bạn có chắc muốn XÓA Trạm ${nodeId} khỏi Dashboard không?\n(Trạm sẽ bị ẩn đi nhưng vẫn có thể thêm lại sau)`)) {
      try {
        await fetch(`${FB_NODE_INFO_URL}/${nodeId}.json`, {
          method: 'DELETE'
        })
        toast.success(`Đã xóa Trạm ${nodeId} khỏi hệ thống quản lý.`)
      } catch (error) {
        toast.error('Lỗi khi xóa thiết bị!')
      }
    }
  }

  if (!mounted) return null

  // Chuyển Object thành Array để vẽ bảng
  const nodesArray = managedNodeIds.map(nodeId => {
    const info = nodeInfoList[nodeId]
    const sensor = activeNodesData[nodeId]
    const isOnline = sensor && sensor.NODE_STATE === 1
    
    return {
      id: nodeId,
      floor: info.LOCATION || 'Chưa thiết lập',
      room: info.NAME || 'Chưa thiết lập',
      isOnline: isOnline,
      lastSeen: sensor?.TIMESTRING || 'Chưa có kết nối',
      signalStrength: isOnline ? Math.floor(Math.random() * 15) + 85 : 0 
    }
  })

  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Node Management</h1>
          <p className="text-muted-foreground">
            Cấp phép, thu hồi và quản lý vị trí các trạm cảm biến trong hệ thống.
          </p>
        </div>

        {/* NÚT MỞ KHUNG THÊM THIẾT BỊ */}
        {!isAddingNode && (
          <div>
            <Button onClick={() => setIsAddingNode(true)} className="flex gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Thêm thiết bị mới
            </Button>
          </div>
        )}

        {/* KHUNG PANEL THÊM THIẾT BỊ (Mở ra khi bấm nút) */}
        {isAddingNode && (
          <Card className="border-2 border-indigo-500 shadow-md animate-in fade-in slide-in-from-top-4">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400">Dò tìm & Thêm trạm cảm biến</CardTitle>
                  <CardDescription>Chọn thiết bị đang phát sóng để đưa vào hệ thống quản lý.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAddingNode(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Chọn ID Thiết bị */}
                <div className="space-y-2">
                  <Label>Trạm phần cứng khả dụng</Label>
                  <div className="relative">
                    <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select 
                      className="flex h-10 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      value={selectedAvailableNode}
                      onChange={(e) => setSelectedAvailableNode(e.target.value)}
                    >
                      <option value="" disabled>-- Chọn mạch đang Online --</option>
                      {availableNodeIds.length === 0 && (
                        <option value="" disabled>Không tìm thấy mạch mới nào!</option>
                      )}
                      {availableNodeIds.map(id => (
                        <option key={id} value={id}>Mạch {id} (Sẵn sàng)</option>
                      ))}
                    </select>
                  </div>
                  {availableNodeIds.length === 0 && (
                    <p className="text-xs text-amber-500 font-medium">
                      * Hãy cấp nguồn cho mạch mới và chờ gửi dữ liệu lên Firebase trước.
                    </p>
                  )}
                </div>

                {/* Nhập Tầng */}
                <div className="space-y-2">
                  <Label>Khu vực (Tầng)</Label>
                  <Input 
                    placeholder="VD: Tầng 1" 
                    value={newFloor} 
                    onChange={(e) => setNewFloor(e.target.value)} 
                  />
                </div>

                {/* Nhập Phòng */}
                <div className="space-y-2">
                  <Label>Vị trí (Phòng)</Label>
                  <Input 
                    placeholder="VD: Phòng Khách" 
                    value={newRoom} 
                    onChange={(e) => setNewRoom(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t pt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddingNode(false)}>Hủy bỏ</Button>
              <Button onClick={submitAddNode} disabled={!selectedAvailableNode} className="gap-2">
                <Save className="w-4 h-4" /> Lưu cấu hình
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* BẢNG DANH SÁCH THIẾT BỊ ĐANG QUẢN LÝ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Danh sách Trạm đã cấp phép</CardTitle>
            <CardDescription>
              Các thiết bị đang hiển thị trên giao diện Dashboard chính.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Mã Trạm</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Vị trí cấp phép</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Trạng thái mạng</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Tín hiệu</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Đồng bộ cuối</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {nodesArray.map((node) => (
                    <tr key={node.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          {node.isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                          {node.id}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{node.floor}</span>
                        <span className="text-muted-foreground"> / {node.room}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={node.isOnline ? 'default' : 'secondary'} className={node.isOnline ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}>
                          {node.isOnline ? 'ONLINE' : 'OFFLINE'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${node.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                              style={{ width: `${node.signalStrength}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{node.signalStrength}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground font-mono text-xs">
                        {node.lastSeen}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                            onClick={() => handleEditNode(node.id, node.floor, node.room)}
                            title="Đổi tên phòng"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            onClick={() => handleDeleteNode(node.id)}
                            title="Xóa khỏi hệ thống"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {nodesArray.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground bg-muted/10">
                        <div className="flex flex-col items-center gap-2">
                          <Server className="w-8 h-8 text-muted-foreground/50" />
                          <p>Hệ thống hiện chưa có thiết bị nào được cấp phép.</p>
                          <p className="text-xs">Bấm "Thêm thiết bị mới" để bắt đầu quét mạng.</p>
                        </div>
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