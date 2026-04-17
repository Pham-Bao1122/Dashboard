'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' 
import { toast } from 'sonner'
import { Power, Settings2, ShieldCheck, Cpu } from 'lucide-react'

interface ControlPanelProps {
  data: any // Truyền toàn bộ SystemData từ rễ vào
  loading: boolean
}

export function ControlPanel({ data, loading }: ControlPanelProps) {
  // Lấy 2 hàm điều khiển từ hook mới
  const { toggleDevice, changeMode } = useFirebaseData() 
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  // 1. Hàm BẬT/TẮT nguồn (Chỉ dùng được khi ở chế độ MANUAL)
  const handleTogglePower = async (nodeId: string, currentState: number) => {
    setPendingAction(`${nodeId}-power`)
    try {
      const newState = currentState === 1 ? 0 : 1;
      await toggleDevice(nodeId, newState);
      toast.success(`Đã lệnh ${newState === 1 ? 'BẬT' : 'TẮT'} thiết bị ${nodeId}`);
    } catch (error) {
      toast.error('Lỗi gửi lệnh, vui lòng kiểm tra kết nối!');
    } finally {
      setPendingAction(null)
    }
  }

  // 2. Hàm chuyển đổi chế độ AUTO / MANUAL
  const handleToggleMode = async (nodeId: string, currentMode: string) => {
    setPendingAction(`${nodeId}-mode`)
    try {
      const newMode = currentMode === 'AUTO' ? 'MANUAL' : 'AUTO';
      await changeMode(nodeId, newMode);
      toast.info(`Trạm ${nodeId} đã chuyển sang chế độ ${newMode}`);
    } catch (error) {
      toast.error('Lỗi đổi chế độ!');
    } finally {
      setPendingAction(null)
    }
  }

  // Lấy danh sách các Trạm từ nhánh CONTROL trên Firebase
  const controls = data?.CONTROL || {}
  const nodeIds = Object.keys(controls)

  return (
    <Card className="h-full border-t-4 border-t-indigo-500 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          Device Control
        </CardTitle>
        <CardDescription>Bảng điều khiển công tắc và chế độ vận hành tự động</CardDescription>
      </CardHeader>
      
      <CardContent>
        {nodeIds.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-4">Chưa có thiết bị điều khiển</p>
        )}

        <div className="space-y-6">
          {nodeIds.map((nodeId) => {
            const deviceState = controls[nodeId].DEVICE_STATE || 0
            const mode = controls[nodeId].MODE || 'MANUAL'
            const isAuto = mode === 'AUTO'

            return (
              <div key={nodeId} className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-base tracking-tight">Trạm {nodeId}</h3>
                </div>

                {/* CÔNG TẮC CHẾ ĐỘ (AUTO / MANUAL) */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      {isAuto ? <ShieldCheck className="w-4 h-4 text-emerald-500"/> : <Settings2 className="w-4 h-4 text-amber-500"/>}
                      Chế độ vận hành
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAuto ? 'Tự động chạy theo cảm biến' : 'Điều khiển bằng tay'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isAuto ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {mode}
                    </span>
                    <Switch
                      checked={isAuto}
                      onCheckedChange={() => handleToggleMode(nodeId, mode)}
                      disabled={loading || pendingAction === `${nodeId}-mode`}
                      className={isAuto ? "data-[state=checked]:bg-emerald-500" : "data-[state=unchecked]:bg-amber-500"}
                    />
                  </div>
                </div>

                {/* CÔNG TẮC NGUỒN (ON / OFF) */}
                <div className={`flex items-center justify-between pt-2 ${isAuto ? 'opacity-50 grayscale transition-all' : ''}`}>
                  <div className="flex-1">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Power className={`w-4 h-4 ${deviceState === 1 ? 'text-rose-500' : 'text-muted-foreground'}`} />
                      Nguồn thiết bị
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Bật/Tắt công tắc chính</p>
                  </div>
                  <Switch
                    checked={deviceState === 1}
                    onCheckedChange={() => handleTogglePower(nodeId, deviceState)}
                    // Khóa mỏ công tắc nếu đang chạy AUTO
                    disabled={isAuto || loading || pendingAction === `${nodeId}-power`}
                    className="data-[state=checked]:bg-rose-500"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}