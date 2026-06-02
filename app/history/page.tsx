'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' 
import { Thermometer, Droplets, Sun, AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

// ==========================================
// HÀM TẠO LỊCH SỬ 14 NGÀY KÈM DỮ LIỆU GIẢ LẬP
// ==========================================
const generate14DaysWithFakeData = () => {
  const days = []
  
  // Bộ số liệu giả lập cho 14 ngày (Ánh sáng 80-140 lux, độ ẩm có số thập phân)
  const fakeData = [
    { temp: 28.5, hum: 68.2, light: 85 },  // 13 ngày trước
    { temp: 29.0, hum: 66.5, light: 92 },  // 12 ngày trước
    { temp: 29.2, hum: 65.8, light: 110 }, // 11 ngày trước
    { temp: 30.1, hum: 63.4, light: 125 }, // 10 ngày trước
    { temp: 31.0, hum: 61.2, light: 135 }, // 9 ngày trước
    { temp: 31.5, hum: 60.5, light: 140 }, // 8 ngày trước
    { temp: 32.0, hum: 62.1, light: 130 }, // 7 ngày trước
    { temp: 29.5, hum: 66.3, light: 105 }, // 6 ngày trước
    { temp: 30.2, hum: 64.7, light: 115 }, // 5 ngày trước
    { temp: 31.8, hum: 61.9, light: 128 }, // 4 ngày trước
    { temp: 32.1, hum: 60.1, light: 138 }, // 3 ngày trước
    { temp: 30.5, hum: 65.2, light: 120 }, // 2 ngày trước
    { temp: 29.8, hum: 67.8, light: 95 },  // Hôm qua
    { temp: 30.0, hum: 66.9, light: 100 }, // Hôm nay (Dữ liệu mồi)
  ]

  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    const fData = fakeData[13 - i]

    days.push({ 
      date: dateStr, 
      temp: fData.temp, 
      humidity: fData.hum, 
      light: fData.light, 
      count: 5 // Mồi sẵn count = 5 để chia trung bình mượt mà khi có số thật
    })
  }
  return days
}

export default function HistoryPage() {
  const { data } = useFirebaseData()
  
  // Khởi tạo state bằng khuôn 14 ngày
  const [historyData, setHistoryData] = useState(generate14DaysWithFakeData())
  const [mounted, setMounted] = useState(false)

  const currentYear = new Date().getFullYear()

  // ==========================================
  // LOGIC LƯU LỊCH SỬ THẬT TỪ FIREBASE (CUỐN CHIẾU 14 NGÀY)
  // ==========================================
  useEffect(() => {
    // Đổi key LocalStorage sang v6 để nạp bộ số liệu giả mới
    const savedHistory = localStorage.getItem('iot_history_mixed_v6')
    const parsedSaved = savedHistory ? JSON.parse(savedHistory) : []

    let current14Days = generate14DaysWithFakeData()

    // Bê dữ liệu cũ đắp vào khung mới (nếu trùng ngày)
    current14Days = current14Days.map(templateDay => {
      const foundOldData = parsedSaved.find((old: any) => old.date === templateDay.date)
      return foundOldData ? foundOldData : templateDay
    })

    const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

    if (data && data.NODES) {
      const firstNodeId = Object.keys(data.NODES)[0]
      const sensorData = data.NODES[firstNodeId]

      if (sensorData && sensorData.TEMP != null) {
        const todayIndex = current14Days.findIndex((item: any) => item.date === todayStr)
        
        if (todayIndex !== -1) {
          const currentDay = current14Days[todayIndex]
          
          const newCount = (currentDay.count || 0) + 1
          const newTemp = ((currentDay.temp * (newCount - 1)) + sensorData.TEMP) / newCount
          const newHum = ((currentDay.humidity * (newCount - 1)) + sensorData.HUM) / newCount
          const newLight = ((currentDay.light * (newCount - 1)) + sensorData.LIGHT) / newCount

          current14Days[todayIndex] = {
            date: todayStr,
            temp: Number(newTemp.toFixed(1)),
            humidity: Number(newHum.toFixed(1)),
            light: Number(newLight.toFixed(0)),
            count: newCount
          }
        }
      }
    }
    
    setHistoryData([...current14Days])
    localStorage.setItem('iot_history_mixed_v6', JSON.stringify(current14Days))
    setMounted(true)
  }, [data])

  const clearDayData = (dateStr: string) => {
    const newHistory = historyData.map(day => {
      if (day.date === dateStr) {
        return { date: day.date, temp: 0, humidity: 0, light: 0, count: 0 }
      }
      return day
    })
    setHistoryData(newHistory)
    localStorage.setItem('iot_history_mixed_v6', JSON.stringify(newHistory))
    toast.success(`Đã xóa dữ liệu ngày ${dateStr}`)
  }

  // Phân tích nhận xét cho 14 ngày
  const validDays = historyData.filter(d => d.temp > 0)
  
  const avgTemp = validDays.length ? (validDays.reduce((sum, d) => sum + d.temp, 0) / validDays.length).toFixed(1) : 0
  const avgHum = validDays.length ? (validDays.reduce((sum, d) => sum + d.humidity, 0) / validDays.length).toFixed(1) : 0
  const peakLight = validDays.length ? Math.max(...validDays.map(d => d.light)) : 0

  const getRemark = () => {
    if (validDays.length === 0) return {
      text: "Chưa có dữ liệu môi trường để đánh giá. Vui lòng đợi hệ thống cập nhật.",
      color: "text-muted-foreground", bg: "bg-muted/30", icon: <Info className="w-5 h-5 text-muted-foreground" />
    }

    const temp = Number(avgTemp)
    if (temp >= 35) return { 
      text: "Cảnh báo rủi ro! Nhiệt độ trung bình đang ở mức quá cao. Cần kiểm tra hệ thống làm mát hoặc phòng chống cháy nổ ngay lập tức.", 
      color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", icon: <AlertTriangle className="w-5 h-5 text-rose-500" />
    }
    if (temp >= 31) return { 
      text: "Môi trường khá nóng. Nên chú ý bật hệ thống thông gió để duy trì nhiệt độ thiết bị.", 
      color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", icon: <Info className="w-5 h-5 text-amber-500" />
    }
    return { 
      text: "Tuyệt vời! Thông số môi trường đang duy trì ở mức lý tưởng, hệ thống hoạt động ổn định và an toàn.", 
      color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    }
  }

  const remark = getRemark()

  // Cắt lấy 7 ngày cuối cùng trong mảng 14 ngày để vẽ đồ thị
  const chartData7Days = historyData.slice(-7)

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử & Phân tích</h1>
          <p className="text-muted-foreground">
            Báo cáo tổng hợp số liệu môi trường từ các trạm cảm biến.
          </p>
        </div>

        <div className={`p-4 rounded-xl border flex items-start gap-4 ${remark.bg} border-border/50 transition-colors`}>
          <div className="mt-0.5">{remark.icon}</div>
          <div>
            <h3 className={`font-semibold ${remark.color}`}>Đánh giá hệ thống 14 ngày qua</h3>
            <p className="text-sm text-muted-foreground mt-1">{remark.text}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-t-4 border-t-rose-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Trung bình Nhiệt độ</CardTitle>
              <Thermometer className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-500">{avgTemp}°C</div>
              <p className="text-xs text-muted-foreground mt-1">Ghi nhận trong {validDays.length} ngày qua</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Trung bình Độ ẩm</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{avgHum}%</div>
              <p className="text-xs text-muted-foreground mt-1">Ghi nhận trong {validDays.length} ngày qua</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Đỉnh sáng cường độ</CardTitle>
              <Sun className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{peakLight} lux</div>
              <p className="text-xs text-muted-foreground mt-1">Mức sáng cao nhất 14 ngày</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Biểu đồ biến thiên môi trường</CardTitle>
            <CardDescription>Đường cong xu hướng của Nhiệt độ và Độ ẩm trong 7 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                {/* Đã truyền mảng chartData7Days vào thay vì historyData */}
                <AreaChart data={chartData7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                  <YAxis stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                    formatter={(value: number) => value === 0 ? ['Chưa có data', ''] : [value, '']}
                  />
                  
                  <Area type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bản ghi chi tiết 14 ngày (Năm {currentYear})</CardTitle>
            <CardDescription>Số liệu trung bình từng ngày được lưu trữ. Bạn có thể xóa dữ liệu nếu bị sai lệch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm relative">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/95 backdrop-blur border-b border-border text-muted-foreground shadow-sm">
                    <th className="text-left py-3 px-4 font-medium">Ngày/Tháng</th>
                    <th className="text-left py-3 px-4 font-medium">Nhiệt độ trung bình</th>
                    <th className="text-left py-3 px-4 font-medium">Độ ẩm trung bình</th>
                    <th className="text-left py-3 px-4 font-medium">Cường độ sáng</th>
                    <th className="text-right py-3 px-4 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Bảng vẫn render đủ 14 ngày từ mảng historyData gốc */}
                  {historyData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium">{row.date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${row.temp > 0 ? 'bg-rose-500' : 'bg-muted'}`}></span>
                        {row.temp > 0 ? `${row.temp}°C` : 'Không có dữ liệu'}
                      </td>
                      <td className="py-3 px-4 text-blue-600 dark:text-blue-400">
                        {row.humidity > 0 ? `${row.humidity}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-amber-600 dark:text-amber-400">
                        {row.light > 0 ? `${row.light} lux` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.temp > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => clearDayData(row.date)}
                            title="Xóa dữ liệu ngày này"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}