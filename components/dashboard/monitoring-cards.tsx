'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Thermometer, Droplets, Sun } from 'lucide-react'

// (Giữ nguyên Interface của huynh đệ)
interface SensorData {
  temperature?: number | string;
  humidity?: number | string;
  light?: number | string;
}

interface MonitoringCardsProps {
  data: SensorData;
  loading?: boolean;
}

export function MonitoringCards({ data, loading }: MonitoringCardsProps) {
  
  // Xử lý dữ liệu an toàn (giữ nguyên logic đã sửa lúc trước)
  const tempValue = data?.temperature != null ? Number(data.temperature).toFixed(1) : '--'
  const humValue = data?.humidity != null ? Number(data.humidity).toFixed(1) : '--'
  const lightValue = data?.light != null ? Number(data.light).toFixed(1) : '--'

  // Tính toán % cho thanh tiến trình (Giả sử Max Nhiệt là 50°C, Max Ẩm là 100%, Max Sáng là 1000 lux)
  const tempPercent = data?.temperature ? Math.min((Number(data.temperature) / 50) * 100, 100) : 0
  const humPercent = data?.humidity ? Math.min((Number(data.humidity) / 100) * 100, 100) : 0
  const lightPercent = data?.light ? Math.min((Number(data.light) / 1000) * 100, 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      
      {/* THẺ 1: NHIỆT ĐỘ */}
      <Card className="relative overflow-hidden border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-all group">
        {/* Icon in bóng mờ làm background */}
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
            {/* Vòng tròn chứa Icon */}
            <div className="p-3 bg-rose-500/10 rounded-full text-rose-500">
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          
          {/* Thanh hiển thị mức độ trực quan */}
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
                {Number(data?.temperature) > 35 ? 'HIGH (CẢNH BÁO)' : 'NORMAL'}
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
                {Number(data?.humidity) > 80 ? 'HIGH' : 'NORMAL'}
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