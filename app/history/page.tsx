'use client'

import { useState, useEffect, useRef } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useFirebaseData } from '@/components/hooks/use-firebase-data'
import { Thermometer, Droplets, Sun, AlertTriangle, CheckCircle2, Info, Trash2, Search, Filter, BarChart2 } from 'lucide-react'
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

const [historyData, setHistoryData] = useState(generateEmpty14Days())
const [mounted, setMounted] = useState(false)

// ==========================================
// THÊM STATE CHO TÌM KIẾM VÀ LỌC
// ==========================================
const [searchTerm, setSearchTerm] = useState('')
const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'active' | 'inactive'

const isInitialLoad = useRef(true)
const previousSensorsStrRef = useRef("")

const currentYear = new Date().getFullYear()

// ==========================================
// LOGIC LƯU LỊCH SỬ THẬT TỪ FIREBASE (ĐỒNG BỘ ĐÁM MÂY)
// ==========================================
useEffect(() => {
const syncCloudHistory = async () => {
if (!data || !data.NODES) return

  let cloudHistory = []
  try {
    const res = await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/history.json')
    const resData = await res.json()
    cloudHistory = resData ? resData : []
  } catch (err) {
    console.error("Lỗi lấy lịch sử từ Firebase:", err)
  }

  let current14Days = generateEmpty14Days()
  current14Days = current14Days.map(templateDay => {
    const foundOldData = cloudHistory.find((old: any) => old.date === templateDay.date)
    return foundOldData ? foundOldData : templateDay
  })

  const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

  let sensorsOnlyString = ""
  Object.keys(data.NODES).forEach(id => {
    const n = data.NODES[id] as any
    if (n) {
      sensorsOnlyString += `${id}:${n.TEMP}:${n.HUM}:${n.LIGHT}|`
    }
  })
  
  if (isInitialLoad.current) {
    isInitialLoad.current = false
    previousSensorsStrRef.current = sensorsOnlyString
    setHistoryData([...current14Days])
    setMounted(true)
    return
  } 
  else if (sensorsOnlyString !== previousSensorsStrRef.current) {
    previousSensorsStrRef.current = sensorsOnlyString

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

        try {
          await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/history.json', {
            method: 'PUT',
            body: JSON.stringify(current14Days)
          })
        } catch (err) {
          console.error("Lỗi cập nhật lịch sử lên Firebase:", err)
        }
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

try {
  await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/history.json', {
    method: 'PUT',
    body: JSON.stringify(newHistory)
  })
  toast.success(`Đã xóa dữ liệu ngày ${dateStr} trên đám mây`)
} catch (err) {
  toast.error("Lỗi đồng bộ Firebase khi xóa")
}


}

// ==========================================
// XỬ LÝ DỮ LIỆU LỌC (FILTER) & TÌM KIẾM (SEARCH)
// ==========================================
const filteredHistoryData = historyData.filter(day => {
const matchesSearch = day.date.includes(searchTerm);
const matchesFilter =
filterStatus === 'all' ? true :
filterStatus === 'active' ? day.temp > 0 :
filterStatus === 'inactive' ? day.temp === 0 : true;

return matchesSearch && matchesFilter;


});

// TÍNH THỐNG KÊ TRÊN DỮ LIỆU ĐÃ LỌC
const activeFilteredDays = filteredHistoryData.filter(d => d.temp > 0);

const stats = {
avgTemp: activeFilteredDays.length ? (activeFilteredDays.reduce((sum, d) => sum + d.temp, 0) / activeFilteredDays.length).toFixed(1) : 0,
maxTemp: activeFilteredDays.length ? Math.max(...activeFilteredDays.map(d => d.temp)).toFixed(1) : 0,
minTemp: activeFilteredDays.length ? Math.min(...activeFilteredDays.map(d => d.temp)).toFixed(1) : 0,
avgHum: activeFilteredDays.length ? (activeFilteredDays.reduce((sum, d) => sum + d.humidity, 0) / activeFilteredDays.length).toFixed(1) : 0,
maxLight: activeFilteredDays.length ? Math.max(...activeFilteredDays.map(d => d.light)).toFixed(0) : 0,
};

// Các logic tổng hợp toàn bộ 14 ngày (Cho biểu đồ và remark)
const validDays = historyData.filter(d => d.temp > 0)
const avgTempTotal = validDays.length ? (validDays.reduce((sum, d) => sum + d.temp, 0) / validDays.length).toFixed(1) : 0

const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
const todayData = historyData.find(item => item.date === todayStr)
const isTodayActive = todayData && todayData.count > 0

const getRemark = () => {
  if (validDays.length === 0) return {
    text: "Chưa có dữ liệu môi trường để đánh giá. Vui lòng đợi hệ thống cập nhật.",
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    icon: <Info className="h-5 w-5" />
  }

  const temp = Number(avgTempTotal)

  if (temp >= 35) return {
    text: "Cảnh báo rủi ro! Nhiệt độ trung bình đang ở mức quá cao. Cần kiểm tra hệ thống làm mát hoặc phòng chống cháy nổ ngay lập tức.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    icon: <AlertTriangle className="h-5 w-5" />
  }

  if (temp >= 31) return {
    text: "Môi trường khá nóng. Nên chú ý bật hệ thống thông gió để duy trì nhiệt độ thiết bị.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: <Info className="h-5 w-5" />
  }

  return {
    text: "Tuyệt vời! Thông số môi trường đang duy trì ở mức lý tưởng, hệ thống hoạt động ổn định và an toàn.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: <CheckCircle2 className="h-5 w-5" />
  }
}

const remark = getRemark()
const chartData7Days = historyData.slice(-7)

if (!mounted) return null

return (
  <LayoutWrapper>
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Lịch sử & Phân tích</h1>
      <p className="text-muted-foreground">
        Báo cáo tổng hợp số liệu môi trường trung bình từ tất cả các trạm cảm biến (Đồng bộ đám mây).
      </p>
    </div>

    <div className={`p-4 rounded-xl border flex items-start gap-4 ${remark.bg} border-border/50 transition-colors`}>
      <div className="mt-0.5">{remark.icon}</div>
      <div>
        <h3 className={`font-semibold ${remark.color}`}>Đánh giá hệ thống trong ngày</h3>
        <p className="text-sm text-muted-foreground mt-1">{remark.text}</p>
      </div>
    </div>

    {/* BỘ 3 THẺ TỔNG HỢP TRONG NGÀY */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-t-4 border-t-rose-500">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Trung bình Nhiệt độ</CardTitle>
          <Thermometer className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          {/* ĐÃ SỬA: Thêm dấu ? vào sau todayData */}
          <div className="text-3xl font-bold text-rose-500">{isTodayActive ? `${todayData?.temp}°C` : '--'}</div>
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
          {/* ĐÃ SỬA: Thêm dấu ? vào sau todayData */}
          <div className="text-3xl font-bold text-blue-500">{isTodayActive ? `${todayData?.humidity}%` : '--'}</div>
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
          {/* ĐÃ SỬA: Thêm dấu ? vào sau todayData */}
          <div className="text-3xl font-bold text-amber-500">{isTodayActive ? `${todayData?.light} lux` : '--'}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {isTodayActive ? `Trung bình trạm hôm nay` : 'Thống kê hôm nay (Mạch offline)'}
          </p>
        </CardContent>
      </Card>
    </div>

    {/* BIỂU ĐỒ BIẾN THIÊN */}
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

    {/* QUẢN LÝ BẢN GHI: TÌM KIẾM, LỌC VÀ THỐNG KÊ */}
    <Card>
      <CardHeader>
        <CardTitle>Tra cứu & Quản lý Bản ghi (Năm {currentYear})</CardTitle>
        <CardDescription>Bộ công cụ lọc và tra cứu dữ liệu quá khứ của hệ thống.</CardDescription>
      </CardHeader>
      <CardContent>
        
        {/* CÔNG CỤ TÌM KIẾM VÀ LỌC */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo ngày (VD: 25/06)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="relative sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Tất cả bản ghi</option>
              <option value="active">Chỉ ngày có hoạt động</option>
              <option value="inactive">Ngày mạch Offline</option>
            </select>
          </div>
        </div>

        {/* BẢNG THỐNG KÊ TỰ ĐỘNG THEO KẾT QUẢ LỌC */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border/50 flex flex-wrap gap-x-8 gap-y-4 items-center">
          <div className="flex items-center gap-2 text-primary font-medium w-full md:w-auto mb-2 md:mb-0">
            <BarChart2 className="w-5 h-5" />
            <span>Thống kê theo kết quả lọc:</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Nhiệt độ (Avg/Max/Min)</span>
            <span className="text-sm font-semibold">{stats.avgTemp}°C / <span className="text-rose-500">{stats.maxTemp}°C</span> / <span className="text-blue-500">{stats.minTemp}°C</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Độ ẩm (Avg)</span>
            <span className="text-sm font-semibold">{stats.avgHum}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Đỉnh sáng</span>
            <span className="text-sm font-semibold">{stats.maxLight} lux</span>
          </div>
          <div className="flex flex-col ml-auto">
            <span className="text-xs text-muted-foreground">Tổng kết quả</span>
            <span className="text-sm font-semibold text-right">{filteredHistoryData.length} ngày</span>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm relative">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/95 backdrop-blur border-b border-border text-muted-foreground shadow-sm">
                <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Ngày/Tháng</th>
                <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Nhiệt độ trung bình</th>
                <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Độ ẩm trung bình</th>
                <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Cường độ sáng</th>
                <th className="text-right py-3 px-4 font-medium whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistoryData.length > 0 ? (
                filteredHistoryData.map((row, idx) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Không tìm thấy bản ghi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </LayoutWrapper>
)
}