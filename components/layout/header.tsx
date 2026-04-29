'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

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
  
  // KHỞI TẠO STATE RỖNG TRƯỚC KHI LOAD DỮ LIỆU THẬT
  const [alerts, setAlerts] = useState<any[]>([])

  // DÙNG EFFECT ĐỂ TẢI DỮ LIỆU TỪ BỘ NHỚ KHI MỞ WEB VÀ LẮNG NGHE RADAR
  useEffect(() => {
    // Tải lịch sử cũ
    const savedAlerts = localStorage.getItem('iot_alerts')
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts))
    }

    // Lắng nghe tín hiệu từ Radar khi có biến mới
    const handleNewAlert = () => {
      const updatedAlerts = localStorage.getItem('iot_alerts')
      if (updatedAlerts) {
        setAlerts(JSON.parse(updatedAlerts))
      }
    }
    
    // Tạo "đường dây nóng" kết nối với Radar
    window.addEventListener('iot_alerts_updated', handleNewAlert)
    return () => window.removeEventListener('iot_alerts_updated', handleNewAlert)
  }, [])

  // HÀM LƯU DỮ LIỆU KHI CÓ THAO TÁC XÓA HOẶC ĐÃ ĐỌC
  const updateAlerts = (newAlerts: any[]) => {
    setAlerts(newAlerts)
    localStorage.setItem('iot_alerts', JSON.stringify(newAlerts))
  }

  const unreadCount = alerts.filter(a => a.isNew).length

  // Xóa toàn bộ
  const handleClearAlerts = () => updateAlerts([])

  // Đánh dấu đã đọc
  const handleMarkAllAsRead = () => {
    const readAlerts = alerts.map(a => ({...a, isNew: false}))
    updateAlerts(readAlerts)
  }

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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-card animate-pulse"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-xl rounded-xl border-border/50">
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
              
              <div className="max-h-[350px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2 bg-background">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/30" />
                    Chưa có cảnh báo nào!
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
              
              {alerts.length > 0 && unreadCount > 0 && (
                <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                    onClick={handleMarkAllAsRead}
                  >
                    Đánh dấu đã đọc tất cả
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-semibold text-indigo-500">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/setting">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-rose-500 focus:text-rose-600 font-medium"
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