'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Thermometer, Droplets, Sun } from 'lucide-react'

// ==========================================
// 1. SỬA LẠI INTERFACE KHỚP VỚI CHỮ IN HOA TRÊN FIREBASE MỚI
// ==========================================
interface SensorData {
  TEMP?: number | string;
  HUM?: number | string;
  LIGHT?: number | string;
}

interface MonitoringCardsProps {
  data: SensorData | null | undefined;
  loading?: boolean;
}

export function MonitoringCards({ data, loading }: MonitoringCardsProps) {
  
  // ==========================================
  // 2. CẬP NHẬT CÁCH GỌI TÊN BIẾN (temperature -> TEMP, humidity -> HUM, light -> LIGHT)
  // ==========================================
  const tempValue = data?.TEMP != null ? Number(data.TEMP).toFixed(1) : '--'
  const humValue = data?.HUM != null ? Number(data.HUM).toFixed(1) : '--'
  const lightValue = data?.LIGHT != null ? Number(data.LIGHT).toFixed(1) : '--'

  // Tính toán % cho thanh tiến trình
  const tempPercent = data?.TEMP ? Math.min((Number(data.TEMP) / 50) * 100, 100) : 0
  const humPercent = data?.HUM ? Math.min((Number(data.HUM) / 100) * 100, 100) : 0
  const lightPercent = data?.LIGHT ? Math.min((Number(data.LIGHT) / 1000) * 100, 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      
      {/* THẺ 1: NHIỆT ĐỘ */}
      <Card className="relative overflow-hidden border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-all group">
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity dark:opacity-10">
          <Thermometer className="w-32 h-32" />
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Temperature</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-4xl font-bold tracking-tight">{tempValue}</h3>
                <span className="text-sm font-medium text-muted-foreground">°C</span>
              </div>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-full text-rose-500">
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${tempPercent}%` }} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-xs font-semibold text-rose-500">
                {Number(data?.TEMP) > 35 ? 'HIGH (CẢNH BÁO)' : 'NORMAL'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THẺ 2: ĐỘ ẨM */}
      <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all group">
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity dark:opacity-10">
          <Droplets className="w-32 h-32" />
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Humidity</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-4xl font-bold tracking-tight">{humValue}</h3>
                <span className="text-sm font-medium text-muted-foreground">%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${humPercent}%` }} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-xs font-semibold text-blue-500">
                {Number(data?.HUM) > 80 ? 'HIGH' : 'NORMAL'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THẺ 3: ÁNH SÁNG */}
      <Card className="relative overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all group">
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity dark:opacity-10">
          <Sun className="w-32 h-32" />
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Light Intensity</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-4xl font-bold tracking-tight">{lightValue}</h3>
                <span className="text-sm font-medium text-muted-foreground">lux</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
              <Sun className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${lightPercent}%` }} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-xs font-semibold text-amber-500">
                NORMAL
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}