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
  activeNodeId: string // Đã thêm biến này để nhận ID từ page.tsx
}

export function ControlPanel({ data, loading, activeNodeId }: ControlPanelProps) {
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
  const activeNodes = data?.NODES || {} 

  // TRÍCH XUẤT ĐÚNG DỮ LIỆU CỦA TRẠM ĐANG CHỌN (Không lặp nữa)
  const nodeControlData = controls[activeNodeId]
  
  return (
    <Card className="h-full min-h-[300px] border-t-4 border-t-indigo-500 shadow-sm mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          Device Control
        </CardTitle>
        <CardDescription>Bảng điều khiển công tắc và chế độ vận hành</CardDescription>
      </CardHeader>
      
      <CardContent>
        {(!nodeControlData || loading) ? (
          <p className="text-center text-muted-foreground py-4">Chưa có kết nối điều khiển</p>
        ) : (
          <div className="space-y-6">
            {/* ĐOẠN NÀY ĐÃ BỎ LỆNH MAP, CHỈ RENDER 1 TRẠM DUY NHẤT */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
              
              {/* TIÊU ĐỀ TRẠM & BIỂU TƯỢNG */}
              <div className="flex items-center justify-between mb-2 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-base tracking-tight">Trạm {activeNodeId}</h3>
                </div>
                
                {/* TRẠNG THÁI MẠCH THỰC TẾ */}
                {activeNodes[activeNodeId]?.DEVICE === 1 ? (
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

              {/* CÔNG TẮC CHẾ ĐỘ */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    {nodeControlData.MODE === 'AUTO' ? <ShieldCheck className="w-4 h-4 text-emerald-500"/> : <Settings2 className="w-4 h-4 text-amber-500"/>}
                    Chế độ vận hành
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {nodeControlData.MODE === 'AUTO' ? 'Tự động chạy theo cảm biến' : 'Điều khiển bằng tay'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${nodeControlData.MODE === 'AUTO' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {nodeControlData.MODE || 'MANUAL'}
                  </span>
                  <Switch
                    checked={nodeControlData.MODE === 'AUTO'}
                    onCheckedChange={() => handleToggleMode(activeNodeId, nodeControlData.MODE || 'MANUAL')}
                    disabled={loading || pendingAction === `${activeNodeId}-mode`}
                    className={nodeControlData.MODE === 'AUTO' ? "data-[state=checked]:bg-emerald-500" : "data-[state=unchecked]:bg-amber-500"}
                  />
                </div>
              </div>

              {/* CÔNG TẮC NGUỒN */}
              <div className={`flex items-center justify-between pt-2 ${nodeControlData.MODE === 'AUTO' ? 'opacity-50 grayscale transition-all' : ''}`}>
                <div className="flex-1">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Power className={`w-4 h-4 ${nodeControlData.DEVICE_STATE === 1 ? 'text-rose-500' : 'text-muted-foreground'}`} />
                    Nguồn thiết bị
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Bật/Tắt công tắc chính</p>
                </div>
                <Switch
                  checked={nodeControlData.DEVICE_STATE === 1}
                  onCheckedChange={() => handleTogglePower(activeNodeId, nodeControlData.DEVICE_STATE || 0)}
                  disabled={nodeControlData.MODE === 'AUTO' || loading || pendingAction === `${activeNodeId}-power`}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}