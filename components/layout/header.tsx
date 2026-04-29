'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Đã import thêm các Icon cần thiết cho bảng thông báo
import { Bell, Settings, AlertTriangle, Flame, Info, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const router = useRouter()
  
  // KHỞI TẠO DANH SÁCH LỊCH SỬ CẢNH BÁO
  // (Đệ đang tạo sẵn dữ liệu mẫu. Sau này huynh đệ có thể lấy dữ liệu này từ Firebase)
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'danger', title: 'Cảnh báo Nhiệt độ', message: 'Nhiệt độ trạm AHZ1 vượt ngưỡng (42°C)!', time: 'Vừa xong', isNew: true },
    { id: 2, type: 'warning', title: 'Môi trường', message: 'Độ ẩm trạm BHZ2 khá cao (85%).', time: '30 phút trước', isNew: false },
    { id: 3, type: 'info', title: 'Hệ thống', message: 'Chuyển trạm AHZ1 sang chế độ Tự động.', time: '2 giờ trước', isNew: false },
  ])

  // Đếm số lượng thông báo mới để hiện chấm đỏ
  const unreadCount = alerts.filter(a => a.isNew).length

  // Hàm xóa tất cả thông báo
  const handleClearAlerts = () => setAlerts([])

  // Hàm chọn Icon theo từng loại cảnh báo
  const getIcon = (type: string) => {
    switch(type) {
      case 'danger': return <Flame className="w-5 h-5 text-rose-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'info': return <Info className="w-5 h-5 text-blue-500" />
      default: return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    }
  }

  return (
    <header className="fixed top-0 left-64 right-0 bg-card border-b border-border h-16 z-40 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">System Overview</h2>
        </div>

        <div className="flex items-center gap-4">
          
          {/* === KHU VỰC THÔNG BÁO (BELL) === */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                {/* Chỉ hiện chấm đỏ nhấp nháy khi có thông báo mới (isNew = true) */}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-card animate-pulse"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-xl rounded-xl border-border/50">
              {/* Thanh tiêu đề của bảng thông báo */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                <span className="font-semibold text-sm">Lịch sử Cảnh báo</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAlerts}
                  className="h-auto p-1 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Xóa tất cả
                </Button>
              </div>
              
              {/* Danh sách thông báo (Cuộn được nếu quá dài) */}
              <div className="max-h-[350px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2 bg-background">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/30" />
                    Không có cảnh báo nào!
                  </div>
                ) : (
                  <div className="flex flex-col bg-background">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`flex gap-3 p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors ${alert.isNew ? 'bg-indigo-500/5' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {getIcon(alert.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none flex items-center justify-between">
                            <span className={alert.type === 'danger' ? 'text-rose-500' : 'text-foreground'}>
                              {alert.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-normal shrink-0 ml-2">
                              {alert.time}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Nút ở đáy bảng */}
              {alerts.length > 0 && (
                <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                    onClick={() => setAlerts(alerts.map(a => ({...a, isNew: false})))}
                  >
                    Đánh dấu đã đọc tất cả
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* === KHU VỰC CÀI ĐẶT (SETTINGS) === */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-semibold text-indigo-500">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-950/50">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-950/50">
                <Link href="/setting">Settings</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50 font-medium"
                onClick={() => {
                  alert('Đã đăng xuất thành công!')
                  router.push('/login')
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )
}