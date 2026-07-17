'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Thermometer, Droplets, Sun } from 'lucide-react'

// ==========================================
// 1. INTERFACE KHỚP VỚI CHỮ IN HOA TRÊN FIREBASE
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
  // 2. CẬP NHẬT CÁCH GỌI TÊN BIẾN
  // ==========================================
  const tempValue = data?.TEMP != null ? Number(data.TEMP).toFixed(1) : '--'
  const humValue = data?.HUM != null ? Number(data.HUM).toFixed(1) : '--'
  const lightValue = data?.LIGHT != null ? Number(data.LIGHT).toFixed(1) : '--'

  // Tính toán % cho thanh tiến trình
  const tempPercent = data?.TEMP ? Math.min((Number(data.TEMP) / 50) * 100, 100) : 0
  const humPercent = data?.HUM ? Math.min((Number(data.HUM) / 100) * 100, 100) : 0
  const lightPercent = data?.LIGHT ? Math.min((Number(data.LIGHT) / 1000) * 100, 100) : 0

  // ==========================================
  // 3. LOGIC ĐẶC TRỊ CẢNH BÁO
  // ==========================================
  const isTempDanger = data?.TEMP != null && Number(data.TEMP) > 40
  const isHumDanger = data?.HUM != null && Number(data.HUM) > 80
  const isLightDanger = data?.LIGHT != null && Number(data.LIGHT) > 800
  const isLightWeak = data?.LIGHT != null && Number(data.LIGHT) < 15

  const getLightStatus = () => {
    if (data?.LIGHT == null) return { text: '--', color: 'text-muted-foreground' }
    if (isLightWeak) return { text: 'WEAK', color: 'text-slate-500 dark:text-slate-400' }
    if (isLightDanger) return { text: 'HIGH (CẢNH BÁO)', color: 'text-rose-600 dark:text-rose-500 font-bold animate-pulse' }
    return { text: 'NORMAL', color: 'text-emerald-600 dark:text-emerald-500' }
  }

  const lightStatus = getLightStatus()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      
      {/* THẺ 1: NHIỆT ĐỘ */}
      <Card className={`relative overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-all group ${
        isTempDanger ? 'border-l-rose-500' : 'border-l-emerald-500'
      }`}>
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity dark:opacity-10">
          <Thermometer className="w-32 h-32" />
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Temperature</p>
              <div className="flex items-baseline gap-1">
                {/* Đổi màu chữ số ở đây */}
                <h3 className={`text-4xl font-bold tracking-tight transition-colors duration-300 ${
                  isTempDanger ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-500'
                }`}>
                  {tempValue}
                </h3>
                <span className="text-sm font-medium text-muted-foreground">°C</span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${isTempDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isTempDanger ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${tempPercent}%` }} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className={`text-xs font-semibold transition-colors duration-300 ${
                isTempDanger ? 'text-rose-600 dark:text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-500'
              }`}>
                {isTempDanger ? 'HIGH (CẢNH BÁO)' : 'NORMAL'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THẺ 2: ĐỘ ẨM */}
      <Card className={`relative overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-all group ${
        isHumDanger ? 'border-l-rose-500' : 'border-l-emerald-500'
      }`}>
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity dark:opacity-10">
          <Droplets className="w-32 h-32" />
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Humidity</p>
              <div className="flex items-baseline gap-1">
                {/* Đổi màu chữ số ở đây */}
                <h3 className={`text-4xl font-bold tracking-tight transition-colors duration-300 ${
                  isHumDanger ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-500'
                }`}>
                  {humValue}
                </h3>
                <span className="text-sm font-medium text-muted-foreground">%</span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${isHumDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <Droplets className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isHumDanger ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${humPercent}%` }} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className={`text-xs font-semibold transition-colors duration-300 ${
                isHumDanger ? 'text-rose-600 dark:text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-500'
              }`}>
                {isHumDanger ? 'HIGH (CẢNH BÁO)' : 'NORMAL'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THẺ 3: ÁNH SÁNG */}
      <Card className={`relative overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-all group ${
        isLightDanger ? 'border-l-rose-500' : isLightWeak ? 'border-l-slate-400' : 'border-l-emerald-500'
      }`}>
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity dark:opacity-10">
          <Sun className="w-32 h-32" />
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Light Intensity</p>
              <div className="flex items-baseline gap-1">
                {/* Đổi màu chữ số ở đây */}
                <h3 className={`text-4xl font-bold tracking-tight transition-colors duration-300 ${
                  isLightDanger ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 
                  isLightWeak ? 'text-slate-500 dark:text-slate-400' : 
                  'text-emerald-600 dark:text-emerald-500'
                }`}>
                  {lightValue}
                </h3>
                <span className="text-sm font-medium text-muted-foreground">lux</span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${
              isLightDanger ? 'bg-rose-500/10 text-rose-500' : 
              isLightWeak ? 'bg-slate-500/10 text-slate-500' : 
              'bg-emerald-500/10 text-emerald-500'
            }`}>
              <Sun className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isLightDanger ? 'bg-rose-500' : 
                  isLightWeak ? 'bg-slate-400' : 
                  'bg-emerald-500'
                }`} 
                style={{ width: `${lightPercent}%` }} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className={`text-xs font-semibold transition-colors duration-300 ${lightStatus.color}`}>
                {lightStatus.text}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}