'use client'

import { useState, useEffect, useRef } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' 
import { Thermometer, Droplets, Sun, AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

// ==========================================
// HÀM TẠO LỊCH SỬ 14 NGÀY TRỐNG SẠCH
// ==========================================
const generateEmpty14Days = () => {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

    days.push({ 
      date: dateStr, 
      temp: 0, 
      humidity: 0, 
      light: 0, 
      count: 0
    })
  }
  return days
}

export default function HistoryPage() {
  const { data } = useFirebaseData()
  
  // Khởi tạo trạng thái ban đầu là 14 ngày trống
  const [historyData, setHistoryData] = useState(generateEmpty14Days())
  const [mounted, setMounted] = useState(false)
  
  // BIẾN CỜ NGĂN CHẶN DỮ LIỆU TĨNH KHI BOARD TẮT
  const isInitialLoad = useRef(true)
  const previousSensorsStrRef = useRef("") // Quản lý nghiêm ngặt chỉ số cảm biến thật

  const currentYear = new Date().getFullYear()

  // ==========================================
  // LOGIC LƯU LỊCH SỬ THẬT TỪ FIREBASE (ĐỒNG BỘ ĐÁM MÂY)
  // ==========================================
  useEffect(() => {
    const syncCloudHistory = async () => {
      if (!data || !data.NODES) return

      // --- PHẦN 1: ĐỒNG BỘ HÓA ĐÁM MÂY (Thay thế LocalStorage) ---
      let cloudHistory = []
      try {
        const res = await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/history.json')
        const resData = await res.json()
        cloudHistory = resData ? resData : []
      } catch (err) {
        console.error("Lỗi lấy lịch sử từ Firebase:", err)
      }

      let current14Days = generateEmpty14Days()

      // Bê dữ liệu cũ từ Cloud Firebase đắp vào khung 14 ngày mới (nếu có)
      current14Days = current14Days.map(templateDay => {
        const foundOldData = cloudHistory.find((old: any) => old.date === templateDay.date)
        return foundOldData ? foundOldData : templateDay
      })
      // ------------------------------------------------------------

      const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

      // TRÍCH XUẤT CHUỖI SỐ LIỆU THÔ ĐỂ LOẠI BỎ TIMESTAMP/TRẠNG THÁI MẠNG ĐỔI MÀU GIAO DIỆN
      let sensorsOnlyString = ""
      Object.keys(data.NODES).forEach(id => {
        const n = data.NODES[id] as any
        if (n) {
          sensorsOnlyString += `${id}:${n.TEMP}:${n.HUM}:${n.LIGHT}|`
        }
      })
      
      // Lần đầu load trang: Chụp lại thông số tĩnh trên Cloud và bỏ qua
      if (isInitialLoad.current) {
        isInitialLoad.current = false
        previousSensorsStrRef.current = sensorsOnlyString
        // Cập nhật UI ngay lần đầu từ dữ liệu Cloud
        setHistoryData([...current14Days])
        setMounted(true)
        return
      } 
      // CHỈ TÍNH TOÁN KHI THÔNG SỐ CẢM BIẾN THỰC SỰ NHẢY SỐ (BOARD ĐANG BẬT)
      else if (sensorsOnlyString !== previousSensorsStrRef.current) {
        previousSensorsStrRef.current = sensorsOnlyString

        // 1. TIẾN HÀNH QUÉT VÀ TÍNH TRUNG BÌNH CỘNG TẤT CẢ CÁC TRẠM NODE ONLINE
        const nodeIds = Object.keys(data.NODES)
        let totalTemp = 0
        let totalHum = 0
        let totalLight = 0
        let validNodesCount = 0

        nodeIds.forEach(nodeId => {
          const nodeSensor = data.NODES[nodeId] as any
          if (nodeSensor && nodeSensor.TEMP != null && nodeSensor.HUM != null) {
            totalTemp += Number(nodeSensor.TEMP)
            totalHum += Number(nodeSensor.HUM)
            totalLight += Number(nodeSensor.LIGHT)
            validNodesCount++
          }
        })

        // 2. NẾU CÓ ÍT NHẤT 1 TRẠM HOẠT ĐỘNG THÌ ĐƯA VÀO CỘNG DỒN LỊCH SỬ
        if (validNodesCount > 0) {
          const currentAvgTemp = totalTemp / validNodesCount
          const currentAvgHum = totalHum / validNodesCount
          const currentAvgLight = totalLight / validNodesCount

          const todayIndex = current14Days.findIndex((item: any) => item.date === todayStr)
          
          if (todayIndex !== -1) {
            const currentDay = current14Days[todayIndex]
            
            const newCount = (currentDay.count || 0) + 1
            const newTemp = ((currentDay.temp * (newCount - 1)) + currentAvgTemp) / newCount
            const newHum = ((currentDay.humidity * (newCount - 1)) + currentAvgHum) / newCount
            const newLight = ((currentDay.light * (newCount - 1)) + currentAvgLight) / newCount

            current14Days[todayIndex] = {
              date: todayStr,
              temp: Number(newTemp.toFixed(1)),
              humidity: Number(newHum.toFixed(1)),
              light: Number(newLight.toFixed(0)),
              count: newCount
            }

            // --- ĐỒNG BỘ LÊN ĐÁM MÂY (Thay thế LocalStorage) ---
            try {
              await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/history.json', {
                method: 'PUT',
                body: JSON.stringify(current14Days)
              })
            } catch (err) {
              console.error("Lỗi cập nhật lịch sử lên Firebase:", err)
            }
            // ----------------------------------------------------
          }
        }
      }

      setHistoryData([...current14Days])
      setMounted(true)
    }

    syncCloudHistory()
  }, [data])

  const clearDayData = async (dateStr: string) => {
    const newHistory = historyData.map(day => {
      if (day.date === dateStr) {
        return { date: day.date, temp: 0, humidity: 0, light: 0, count: 0 }
      }
      return day
    })
    setHistoryData(newHistory)
    
    // --- ĐỒNG BỘ XÓA LÊN ĐÁM MÂY ---
    try {
      await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/history.json', {
        method: 'PUT',
        body: JSON.stringify(newHistory)
      })
      toast.success(`Đã xóa dữ liệu ngày ${dateStr} trên đám mây`)
    } catch (err) {
      toast.error("Lỗi đồng bộ Firebase khi xóa")
    }
    // -------------------------------
  }

  // Phân tích nhận xét cho 14 ngày dựa trên các ngày có data
  const validDays = historyData.filter(d => d.temp > 0)
  const avgTempTotal = validDays.length ? (validDays.reduce((sum, d) => sum + d.temp, 0) / validDays.length).toFixed(1) : 0

  // ĐỊNH VỊ DỮ LIỆU RIÊNG CHO NGÀY HÔM NAY ĐỂ HIỂN THỊ LÊN 3 THẺ TỔNG HỢP
  const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  const todayData = historyData.find(item => item.date === todayStr)
  const isTodayActive = todayData && todayData.count > 0

  const getRemark = () => {
    if (validDays.length === 0) return {
      text: "Chưa có dữ liệu môi trường để đánh giá. Vui lòng đợi hệ thống cập nhật.",
      color: "text-muted-foreground", bg: "bg-muted/30", icon: <Info className="w-5 h-5 text-muted-foreground" />
    }

    const temp = Number(avgTempTotal)
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
  const chartData7Days = historyData.slice(-7)

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử & Phân tích</h1>
          <p className="text-muted-foreground">
            Báo cáo tổng hợp số liệu môi trường trung bình từ tất cả các trạm cảm biến (Đồng bộ đám mây).
          </p>
        </div>

        <div className={`p-4 rounded-xl border flex items-start gap-4 ${remark.bg} border-border/50 transition-colors`}>
          <div className="mt-0.5">{remark.icon}</div>
          <div>
            <h3 className={`font-semibold ${remark.color}`}>Đánh giá hệ thống 14 ngày qua</h3>
            <p className="text-sm text-muted-foreground mt-1">{remark.text}</p>
          </div>
        </div>

        {/* Bộ 3 thẻ tổng hợp */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-t-4 border-t-rose-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Trung bình Nhiệt độ</CardTitle>
              <Thermometer className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-500">{isTodayActive ? `${todayData.temp}°C` : '--'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isTodayActive ? `Trung bình trạm hôm nay` : 'Thống kê hôm nay (Mạch offline)'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Trung bình Độ ẩm</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{isTodayActive ? `${todayData.humidity}%` : '--'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isTodayActive ? `Trung bình trạm hôm nay` : 'Thống kê hôm nay (Mạch offline)'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Cường độ ánh sáng</CardTitle>
              <Sun className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{isTodayActive ? `${todayData.light} lux` : '--'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isTodayActive ? `Trung bình trạm hôm nay` : 'Thống kê hôm nay (Mạch offline)'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ biến thiên */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Biểu đồ biến thiên môi trường</CardTitle>
            <CardDescription>Đường cong xu hướng trung bình của hệ thống trong 7 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
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

        {/* Bản ghi chi tiết */}
        <Card>
          <CardHeader>
            <CardTitle>Bản ghi chi tiết 14 ngày (Năm {currentYear})</CardTitle>
            <CardDescription>Số liệu trung bình tổng hợp từ hệ thống trạm. Bạn có thể xóa dữ liệu nếu bị sai lệch.</CardDescription>
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