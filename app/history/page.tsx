'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useFirebaseData } from '@/hooks/use-firebase-data' // Đường dẫn hook của huynh đệ
import { Thermometer, Droplets, Sun, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

// Dữ liệu mồi ban đầu (để web luôn có biểu đồ đẹp ngay cả khi chưa đủ 7 ngày thật)
const initialHistory = [
  { date: 'Mon', temp: 28, humidity: 65, light: 450 },
  { date: 'Tue', temp: 29, humidity: 68, light: 480 },
  { date: 'Wed', temp: 27, humidity: 62, light: 520 },
  { date: 'Thu', temp: 30, humidity: 70, light: 410 },
  { date: 'Fri', temp: 31, humidity: 72, light: 390 },
  { date: 'Sat', temp: 32, humidity: 75, light: 350 },
  { date: 'Sun', temp: 0, humidity: 0, light: 0 }, // Sẽ được điền bằng dữ liệu thật
]

export default function HistoryPage() {
  const { data } = useFirebaseData()
  const [historyData, setHistoryData] = useState(initialHistory)
  const [mounted, setMounted] = useState(false)

  // ==========================================
  // LOGIC LƯU LỊCH SỬ THẬT TỪ FIREBASE
  // ==========================================
  useEffect(() => {
    // Tải lịch sử cũ từ bộ nhớ lên (nếu có)
    const savedHistory = localStorage.getItem('iot_weekly_history')
    let currentHistory = savedHistory ? JSON.parse(savedHistory) : initialHistory

    // Lấy Tên ngày hôm nay (VD: 'Mon', 'Tue',...)
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' })

    // Nếu có dữ liệu thật từ mạch gửi lên
    if (data && typeof data.temperature === 'number') {
      // Tìm vị trí ngày hôm nay trong mảng lịch sử
      const todayIndex = currentHistory.findIndex((item: any) => item.date === todayStr)
      
      if (todayIndex !== -1) {
        // Cập nhật số liệu thật vào ngày hôm nay
        currentHistory[todayIndex] = {
          date: todayStr,
          temp: Number(data.temperature.toFixed(1)),
          humidity: Number(data.humidity.toFixed(1)),
          light: data.light ? Number(data.light.toFixed(1)) : currentHistory[todayIndex].light
        }
        
        // Lưu lại vào bộ nhớ
        setHistoryData([...currentHistory])
        localStorage.setItem('iot_weekly_history', JSON.stringify(currentHistory))
      }
    } else if (savedHistory) {
      setHistoryData(currentHistory)
    }
    
    setMounted(true)
  }, [data])

  // ==========================================
  // TÍNH TOÁN TRUNG BÌNH & NHẬN XÉT
  // ==========================================
  // Chỉ tính những ngày có dữ liệu thật (temp > 0)
  const validDays = historyData.filter(d => d.temp > 0)
  
  const avgTemp = validDays.length ? (validDays.reduce((sum, d) => sum + d.temp, 0) / validDays.length).toFixed(1) : 0
  const avgHum = validDays.length ? (validDays.reduce((sum, d) => sum + d.humidity, 0) / validDays.length).toFixed(1) : 0
  const peakLight = validDays.length ? Math.max(...validDays.map(d => d.light)) : 0

  // AI Tự động nhận xét dựa trên nhiệt độ trung bình
  const getRemark = () => {
    const temp = Number(avgTemp)
    if (temp >= 35) return { 
      text: "Cảnh báo rủi ro! Nhiệt độ trung bình tuần đang ở mức quá cao. Cần kiểm tra hệ thống làm mát hoặc phòng chống cháy nổ ngay lập tức.", 
      color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", icon: <AlertTriangle className="w-5 h-5 text-rose-500" />
    }
    if (temp >= 31) return { 
      text: "Môi trường khá nóng. Nên chú ý bật hệ thống thông gió (Relay) để duy trì nhiệt độ thiết bị.", 
      color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", icon: <Info className="w-5 h-5 text-amber-500" />
    }
    return { 
      text: "Tuyệt vời! Thông số môi trường đang duy trì ở mức lý tưởng, hệ thống hoạt động ổn định và an toàn.", 
      color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    }
  }

  const remark = getRemark()

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử & Phân tích</h1>
          <p className="text-muted-foreground">
            Báo cáo tự động về các thông số môi trường từ trạm cảm biến.
          </p>
        </div>

        {/* Khung Nhận xét tự động */}
        <div className={`p-4 rounded-xl border flex items-start gap-4 ${remark.bg} border-border/50 transition-colors`}>
          <div className="mt-0.5">{remark.icon}</div>
          <div>
            <h3 className={`font-semibold ${remark.color}`}>Đánh giá hệ thống tuần này</h3>
            <p className="text-sm text-muted-foreground mt-1">{remark.text}</p>
          </div>
        </div>

        {/* Thẻ Thống kê */}
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
              <p className="text-xs text-muted-foreground mt-1">Mức sáng cao nhất tuần</p>
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ Gradient */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Biểu đồ biến thiên môi trường</CardTitle>
            <CardDescription>Đường cong xu hướng của Nhiệt độ và Độ ẩm trong tuần</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {/* Đổ bóng màu Đỏ cho Nhiệt độ */}
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    {/* Đổ bóng màu Xanh cho Độ ẩm */}
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
                  />
                  
                  {/* Đường cong mượt mà (monotone) */}
                  <Area type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bảng dữ liệu chi tiết */}
        <Card>
          <CardHeader>
            <CardTitle>Bản ghi chi tiết</CardTitle>
            <CardDescription>Số liệu trung bình từng ngày được lưu trữ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Thứ trong tuần</th>
                    <th className="text-left py-3 px-4 font-medium">Nhiệt độ trung bình</th>
                    <th className="text-left py-3 px-4 font-medium">Độ ẩm trung bình</th>
                    <th className="text-left py-3 px-4 font-medium">Cường độ sáng</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium">{row.date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${row.temp > 0 ? 'bg-rose-500' : 'bg-muted'}`}></span>
                        {row.temp > 0 ? `${row.temp}°C` : 'Chưa có data'}
                      </td>
                      <td className="py-3 px-4 text-blue-600 dark:text-blue-400">
                        {row.humidity > 0 ? `${row.humidity}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-amber-600 dark:text-amber-400">
                        {row.light > 0 ? `${row.light} lux` : '-'}
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