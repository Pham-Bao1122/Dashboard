'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrainCircuit, AlertTriangle, CheckCircle2, Info, Wind } from 'lucide-react'

interface AIPredictionProps {
  data: any
}

// 1. TẬP DỮ LIỆU HUẤN LUYỆN AI (Chuẩn hóa nhãn và giao thức công nghiệp)
const trainingData = [
  { 
    temp: 25, hum: 60, light: 300, 
    label: 'SYS_OPTIMAL', 
    action: 'Duy trì tham số hiện tại. Không yêu cầu can thiệp phần cứng.', 
    type: 'normal' 
  },
  { 
    temp: 22, hum: 85, light: 150, 
    label: 'HIGH_HUMIDITY_WARN', 
    action: 'Cảnh báo rỉ sét mạch. Đề xuất kích hoạt module tản ẩm/thông gió (Relay điều khiển).', 
    type: 'info' 
  },
  { 
    temp: 33, hum: 70, light: 700, 
    label: 'THERMAL_OVERLOAD_WARN', 
    action: 'Suy hao nhiệt năng. Khuyến nghị giám sát tản nhiệt chủ động.', 
    type: 'warning' 
  },
  { 
    temp: 42, hum: 30, light: 900, 
    label: 'CRITICAL_FIRE_RISK', 
    action: 'BÁO ĐỘNG ĐỎ: Quá nhiệt cục bộ! Yêu cầu ngắt nguồn hệ thống và kích hoạt giao thức chữa cháy.', 
    type: 'danger' 
  },
  { 
    temp: 18, hum: 40, light: 50,  
    label: 'LOW_ENERGY_STATE', 
    action: 'Cường độ quang học và nhiệt độ dưới ngưỡng hoạt động tiêu chuẩn.', 
    type: 'info' 
  },
]

export function AIPredictionCard({ data }: AIPredictionProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [confidence, setConfidence] = useState(0)

  // 2. MÔ HÌNH AI: K-Nearest Neighbors (KNN) Inference Engine
  useEffect(() => {
    if (!data || data.TEMP == null || data.HUM == null || data.LIGHT == null) return

    const currentTemp = data.TEMP
    const currentHum = data.HUM
    const currentLight = data.LIGHT

    let minDistance = Infinity
    let bestMatch = trainingData[0]

    // Chuẩn hóa Vector dữ liệu đầu vào
    const normalize = (val: number, max: number) => val / max

    // Tính toán khoảng cách Euclidean trong không gian Vector 3D
    trainingData.forEach((point) => {
      const distTemp = Math.pow(normalize(currentTemp, 50) - normalize(point.temp, 50), 2)
      const distHum = Math.pow(normalize(currentHum, 100) - normalize(point.hum, 100), 2)
      const distLight = Math.pow(normalize(currentLight, 1000) - normalize(point.light, 1000), 2)
      
      const distance = Math.sqrt(distTemp + distHum + distLight)

      if (distance < minDistance) {
        minDistance = distance
        bestMatch = point
      }
    })

    // Tính điểm tin cậy (Confidence Score)
    const confidenceScore = Math.max(0, 100 - (minDistance * 100)).toFixed(1)

    setPrediction(bestMatch)
    setConfidence(Number(confidenceScore))

  }, [data])

  if (!prediction) return null

  // Cấu hình UI theo phân lớp nội suy
  const config = {
    normal: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" /> },
    info: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Wind className="w-6 h-6 text-blue-500" /> },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: <Info className="w-6 h-6 text-amber-500" /> },
    danger: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <AlertTriangle className="w-6 h-6 text-rose-500" animate-pulse /> },
  }

  const activeConfig = config[prediction.type as keyof typeof config]

  return (
    <Card className="border-t-4 border-t-purple-500 overflow-hidden relative shadow-sm">
      {/* Background AI Pattern */}
      <div className="absolute right-0 top-0 opacity-5">
        <BrainCircuit className="w-32 h-32 -mr-8 -mt-8" />
      </div>

      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <BrainCircuit className="w-5 h-5" />
          KNN Inference Engine
        </CardTitle>
        <CardDescription>Tiến trình phân tích chuỗi dữ liệu môi trường thời gian thực</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 pt-4">
          
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${activeConfig.bg} border-border/50`}>
            <div className="p-2 bg-background rounded-full shadow-sm">
              {activeConfig.icon}
            </div>
            <div>
              <p className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Phân lớp nội suy (Class)
              </p>
              <h3 className={`text-lg font-mono font-bold tracking-tight ${activeConfig.color}`}>
                [{prediction.label}]
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-muted-foreground">Độ tin cậy (Confidence Score)</span>
              <span className="font-mono font-bold text-purple-600">{confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                style={{ width: `${confidence}%` }} 
              />
            </div>
          </div>

          <div className="bg-muted/40 p-3 rounded-lg border border-border mt-4">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-mono text-xs font-semibold text-purple-500 uppercase tracking-wider block mb-1">
                Giao thức đề xuất:
              </span> 
              {prediction.action}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}