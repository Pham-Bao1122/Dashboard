'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { SensorData } from '@/components/hooks/use-firebase-data' // Nhớ check lại đường dẫn này nhé
import { ref, set } from 'firebase/database'
import { database } from '@/lib/firebase' 
import { toast } from 'sonner'

// Đệ đã bỏ bớt cái onToggleRelay cũ đi vì giờ mình bắn thẳng lên Firebase luôn
interface ControlPanelProps {
  data: SensorData | any
  loading: boolean
}

export function ControlPanel({ data, loading }: ControlPanelProps) {
  const [relay1Toggling, setRelay1Toggling] = useState(false)
  const [relay2Toggling, setRelay2Toggling] = useState(false)

  // Hàm xử lý gửi lệnh (Gộp chung cho cả 2 relay)
  const handleToggle = async (relayName: string, currentState: number, setToggling: (val: boolean) => void) => {
    setToggling(true)
    try {
      const newState = currentState === 1 ? 0 : 1;
      const dbRef = ref(database, `controls/${relayName}`);
      await set(dbRef, newState);
      toast.success(`Đã lệnh ${newState === 1 ? 'BẬT' : 'TẮT'} cho ${relayName.toUpperCase()}`);
    } catch (error) {
      console.error("Lỗi gửi lệnh:", error);
      toast.error('Không thể gửi lệnh, vui lòng kiểm tra kết nối!');
    } finally {
      setToggling(false)
    }
  }

  // Lấy dữ liệu đúng từ nhánh controls/relay1 và controls/relay2
  const relay1State = data?.controls?.relay1 || 0;
  const relay2State = data?.controls?.relay2 || 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Device Control</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* CÔNG TẮC RELAY 1 */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <Label className="text-base font-medium">Relay 1</Label>
              <p className="text-sm text-muted-foreground mt-1">Primary control switch</p>
            </div>
            <Switch
              checked={relay1State === 1}
              onCheckedChange={() => handleToggle('relay1', relay1State, setRelay1Toggling)}
              disabled={loading || relay1Toggling}
            />
          </div>

          {/* CÔNG TẮC RELAY 2 */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <Label className="text-base font-medium">Relay 2</Label>
              <p className="text-sm text-muted-foreground mt-1">Secondary control switch</p>
            </div>
            <Switch
              checked={relay2State === 1}
              onCheckedChange={() => handleToggle('relay2', relay2State, setRelay2Toggling)}
              disabled={loading || relay2Toggling}
            />
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}