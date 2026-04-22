'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' 
import { toast } from 'sonner'
import { Power, Settings2, ShieldCheck, Cpu, Zap } from 'lucide-react'

interface ControlPanelProps {
  data: any 
  loading: boolean
}

export function ControlPanel({ data, loading }: ControlPanelProps) {
  const { toggleDevice, changeMode } = useFirebaseData() 
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const handleTogglePower = async (nodeId: string, currentState: number) => {
    setPendingAction(`${nodeId}-power`)
    try {
      const newState = currentState === 1 ? 0 : 1;
      await toggleDevice(nodeId, newState);
      toast.success(`Đã gửi lệnh ${newState === 1 ? 'BẬT' : 'TẮT'} xuống trạm ${nodeId}`);
    } catch (error) {
      toast.error('Lỗi gửi lệnh, vui lòng kiểm tra kết nối!');
    } finally {
      setPendingAction(null)
    }
  }

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

  const controls = data?.CONTROL || {}
  const activeNodes = data?.NODES || {} // Lấy thêm dữ liệu thực tế từ các Node
  const nodeIds = Object.keys(controls)

  return (
    <Card className="h-full border-t-4 border-t-indigo-500 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          Device Control
        </CardTitle>
        <CardDescription>Bảng điều khiển công tắc và chế độ vận hành</CardDescription>
      </CardHeader>
      
      <CardContent>
        {nodeIds.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-4">Chưa có thiết bị điều khiển</p>
        )}

        <div className="space-y-6">
          {nodeIds.map((nodeId) => {
            // Lệnh điều khiển gửi đi (từ CONTROL)
            const commandState = controls[nodeId].DEVICE_STATE || 0
            const mode = controls[nodeId].MODE || 'MANUAL'
            const isAuto = mode === 'AUTO'

            // Trạng thái phần cứng thực tế báo về (từ NODES -> DEVICE)
            const actualDeviceState = activeNodes[nodeId]?.DEVICE || 0

            return (
              <div key={nodeId} className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                
                {/* TIÊU ĐỀ TRẠM & BIỂU TƯỢNG NHẬN DIỆN (Đọc từ NODES -> DEVICE) */}
                <div className="flex items-center justify-between mb-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-base tracking-tight">Trạm {nodeId}</h3>
                  </div>
                  
                  {/* HIỂN THỊ DỰA VÀO BIẾN THỰC TẾ TRÊN MẠCH (actualDeviceState) */}
                  {actualDeviceState === 1 ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-md text-xs font-bold animate-pulse border border-rose-500/30">
                      <Zap className="w-3.5 h-3.5" fill="currentColor" />
                      ĐANG BẬT
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs font-semibold border border-border">
                      <Power className="w-3.5 h-3.5" />
                      ĐÃ TẮT
                    </div>
                  )}
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
                      <Power className={`w-4 h-4 ${commandState === 1 ? 'text-rose-500' : 'text-muted-foreground'}`} />
                      Nguồn thiết bị
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Bật/Tắt công tắc chính</p>
                  </div>
                  <Switch
                    checked={commandState === 1}
                    onCheckedChange={() => handleTogglePower(nodeId, commandState)}
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