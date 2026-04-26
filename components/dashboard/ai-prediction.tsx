'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrainCircuit, AlertTriangle, CheckCircle2, Info, Wind } from 'lucide-react'

interface AIPredictionProps {
  data: any
}

// 1. TẬP DỮ LIỆU HUẤN LUYỆN AI (Training Dataset)
// Huynh đệ có thể thêm nhiều trường hợp vào đây để AI thông minh hơn
const trainingData = [
  { temp: 25, hum: 60, light: 300, label: 'Bình thường', action: 'Hệ thống hoạt động ổn định.', type: 'normal' },
  { temp: 22, hum: 85, light: 150, label: 'Ẩm thấp', action: 'Nguy cơ nấm mốc, nên bật quạt thông gió.', type: 'info' },
  { temp: 33, hum: 70, light: 700, label: 'Nóng bức', action: 'Môi trường khá nóng, theo dõi làm mát thiết bị.', type: 'warning' },
  { temp: 42, hum: 30, light: 900, label: 'Nguy cơ cháy', action: 'BÁO ĐỘNG: Nhiệt độ cực cao, kiểm tra ngay!', type: 'danger' },
  { temp: 18, hum: 40, light: 50,  label: 'Lạnh & Tối', action: 'Môi trường thiếu sáng và nhiệt độ thấp.', type: 'info' },
]

export function AIPredictionCard({ data }: AIPredictionProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [confidence, setConfidence] = useState(0)

  // 2. MÔ HÌNH AI: K-Nearest Neighbors (KNN) Algorithm
  useEffect(() => {
    if (!data || data.TEMP == null || data.HUM == null || data.LIGHT == null) return

    const currentTemp = data.TEMP
    const currentHum = data.HUM
    const currentLight = data.LIGHT

    let minDistance = Infinity
    let bestMatch = trainingData[0]

    // Chuẩn hóa dữ liệu (Normalization) để các thang đo (độ C, %, lux) không đè lên nhau
    const normalize = (val: number, max: number) => val / max

    // Thuật toán tìm Láng giềng gần nhất (Tính khoảng cách Euclidean 3D)
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

    // Tính độ tự tin (Confidence Score) của AI. Càng gần khuôn mẫu thì độ tự tin càng cao.
    const confidenceScore = Math.max(0, 100 - (minDistance * 100)).toFixed(1)

    setPrediction(bestMatch)
    setConfidence(Number(confidenceScore))

  }, [data])

  if (!prediction) return null

  // Cấu hình màu sắc giao diện theo quyết định của AI
  const config = {
    normal: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" /> },
    info: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Wind className="w-6 h-6 text-blue-500" /> },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: <Info className="w-6 h-6 text-amber-500" /> },
    danger: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <AlertTriangle className="w-6 h-6 text-rose-500" animate-pulse /> },
  }

  const activeConfig = config[prediction.type as keyof typeof config]

  return (
    <Card className="border-t-4 border-t-purple-500 overflow-hidden relative">
      {/* Background AI Pattern */}
      <div className="absolute right-0 top-0 opacity-5">
        <BrainCircuit className="w-32 h-32 -mr-8 -mt-8" />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <BrainCircuit className="w-5 h-5" />
          AI Phân tích Môi trường
        </CardTitle>
        <CardDescription>Mô hình Machine Learning (KNN) dự đoán trạng thái</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 pt-2">
          
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${activeConfig.bg} border-border/50`}>
            <div className="p-2 bg-background rounded-full shadow-sm">
              {activeConfig.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phân loại AI:</p>
              <h3 className={`text-xl font-bold tracking-tight ${activeConfig.color}`}>
                Trạng thái: {prediction.label}
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Độ tự tin (Confidence)</span>
              <span className="font-bold text-purple-600">{confidence}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                style={{ width: `${confidence}%` }} 
              />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <span className="text-purple-500 font-bold">Gợi ý:</span> {prediction.action}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}