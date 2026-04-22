'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DataPoint {
  time: string
  temperature: number
  humidity: number
}

// Sửa kiểu dữ liệu thành any để không bị lỗi gạch đỏ (vì nhận dữ liệu linh động từ nhiều phòng)
interface DataChartProps {
  data: any 
}

// 1. BIẾN TOÀN CỤC: Nằm ngoài component để không bao giờ bị reset khi chuyển tab
let globalChartCache: DataPoint[] = []

export function DataChart({ data }: DataChartProps) {
  // 2. Khởi tạo đồ thị bằng dữ liệu từ biến toàn cục
  const [chartData, setChartData] = useState<DataPoint[]>(globalChartCache)

  // 3. Phục hồi dữ liệu nếu lỡ tay bấm F5 (Tải lại trang)
  useEffect(() => {
    if (globalChartCache.length === 0) {
      const savedHistory = sessionStorage.getItem('iot_chart_history')
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory)
          globalChartCache = parsed
          setChartData(parsed)
        } catch (e) {
          console.error("Lỗi đọc lịch sử:", e)
        }
      }
    }
  }, [])

  // 4. Lắng nghe và cập nhật dữ liệu mới từ Firebase
  useEffect(() => {
    if (!data) return

    setChartData((prev) => {
      // Dùng thời gian thực tế lúc nhận được data
      const currentTime = new Date();
      
      const newPoint: DataPoint = {
        time: currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: false 
        }),
        // SỬA LẠI THÀNH CHỮ IN HOA: TEMP và HUM
        temperature: Number(data.TEMP) || 0,
        humidity: Number(data.HUM) || 0,
      }

      // Tránh việc React render nhiều lần cùng 1 giây gây ra điểm ảnh bị trùng
      if (prev.length > 0 && prev[prev.length - 1].time === newPoint.time) {
        return prev; 
      }

      const updated = [...prev, newPoint].slice(-1800) // Giữ tối đa 1800 điểm (2 tiếng)
      
      // ĐỒNG BỘ: Cập nhật vào biến toàn cục và bộ nhớ trình duyệt
      globalChartCache = updated
      sessionStorage.setItem('iot_chart_history', JSON.stringify(updated))

      return updated
    })
  }, [data])

  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm border-t-4 border-t-indigo-500">
      <CardHeader>
        <CardTitle className="text-lg">Real-time Data Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#d1d5db"
                tickMargin={10}
                minTickGap={60} 
                tickFormatter={(tick) => tick.substring(0, 5)} 
              />

              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#d1d5db"
                domain={['dataMin - 1', 'dataMax + 1']} 
              />

              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#d1d5db"
                domain={[0, 100]} 
              />

              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '4px' }}
              />
              
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
              />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#f43f5e" 
                dot={false}
                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                strokeWidth={3}
                name="Temperature (°C)"
                isAnimationActive={false} 
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6" 
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                strokeWidth={3}
                name="Humidity (%)"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              Waiting for sensor data...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}