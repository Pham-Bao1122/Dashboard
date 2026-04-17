'use client'

import { DoorOpen, DoorClosed, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DeviceStatusCardsProps {
  data: any // Nhận activeSensorData (Dữ liệu của phòng đang chọn) từ page.tsx
  loading: boolean
}

export function DeviceStatusCards({ data, loading }: DeviceStatusCardsProps) {
  
  // Đọc trạng thái từ Firebase (Biến viết hoa theo chuẩn mới)
  // DOOR: 1 là Mở, 0 là Đóng
  // NODE_STATE: 1 là Online, 0 là Offline
  const isDoorOpen = data?.DOOR === 1
  const isNodeOnline = data?.NODE_STATE === 1

  const statuses = [
    {
      label: 'Cảm biến Cửa',
      isActive: isDoorOpen,
      description: 'Giám sát an ninh đóng/mở cửa',
      iconOn: <DoorOpen className="w-5 h-5 text-amber-500" />,
      iconOff: <DoorClosed className="w-5 h-5 text-emerald-500" />,
      textOn: 'ĐANG MỞ',
      textOff: 'ĐÃ ĐÓNG',
      // Style cho Badge
      badgeClassOn: 'bg-amber-500 hover:bg-amber-600 text-white',
      badgeClassOff: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      variantOff: 'default'
    },
    {
      label: 'Kết nối mạng LoRa',
      isActive: isNodeOnline,
      description: 'Trạng thái truyền tin của trạm',
      iconOn: <Wifi className="w-5 h-5 text-indigo-500" />,
      iconOff: <WifiOff className="w-5 h-5 text-muted-foreground" />,
      textOn: 'ONLINE',
      textOff: 'OFFLINE',
      // Style cho Badge
      badgeClassOn: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      badgeClassOff: '',
      variantOff: 'secondary'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {statuses.map((item, idx) => (
        <Card key={idx} className="overflow-hidden border-t-4 border-t-muted transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              {/* Hiển thị Icon tương ứng với trạng thái */}
              {item.isActive ? item.iconOn : item.iconOff}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium">Status</span>
                <Badge 
                  variant={(!item.isActive && item.variantOff === 'secondary') ? 'secondary' : 'default'}
                  className={item.isActive ? item.badgeClassOn : item.badgeClassOff}
                >
                  {loading ? 'Đang tải...' : (item.isActive ? item.textOn : item.textOff)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}