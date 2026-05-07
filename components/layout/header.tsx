'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// Đã import thêm Menu (nút 3 gạch)
import { Bell, Settings, AlertTriangle, Flame, Info, CheckCircle2, Trash2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Đã khai báo thêm biến onOpenSidebar để hứng lệnh từ LayoutWrapper
export function Header({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    const savedAlerts = localStorage.getItem('iot_alerts')
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts))

    const handleNewAlert = () => {
      const updatedAlerts = localStorage.getItem('iot_alerts')
      if (updatedAlerts) setAlerts(JSON.parse(updatedAlerts))
    }
    window.addEventListener('iot_alerts_updated', handleNewAlert)
    return () => window.removeEventListener('iot_alerts_updated', handleNewAlert)
  }, [])

  const updateAlerts = (newAlerts: any[]) => {
    setAlerts(newAlerts)
    localStorage.setItem('iot_alerts', JSON.stringify(newAlerts))
  }

  const unreadCount = alerts.filter(a => a.isNew).length
  const handleClearAlerts = () => updateAlerts([])
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
    // ĐÃ SỬA CHỖ NÀY: left-0 trên mobile, left-64 trên máy tính
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-card border-b border-border h-16 z-40 shadow-sm transition-all duration-300">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          {/* NÚT HAMBURGER MOBILE NẰM Ở ĐÂY */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar}>
            <Menu className="w-6 h-6" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground tracking-tight hidden sm:block">System Overview</h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
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
                <Button variant="ghost" size="sm" onClick={handleClearAlerts} className="h-auto p-1 text-xs text-muted-foreground hover:text-rose-500">
                  <Trash2 className="w-3 h-3 mr-1" /> Xóa tất cả
                </Button>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2 bg-background">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/30" /> Chưa có cảnh báo nào!
                  </div>
                ) : (
                  <div className="flex flex-col bg-background">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`flex gap-3 p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors ${alert.isNew ? 'bg-indigo-500/5' : ''}`}>
                        <div className="mt-0.5 shrink-0">{getIcon(alert.type)}</div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none flex items-center justify-between">
                            <span className={alert.type === 'danger' ? 'text-rose-500' : 'text-foreground'}>{alert.title}</span>
                            <span className="text-[10px] text-muted-foreground font-normal shrink-0 ml-2">{alert.time}</span>
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {alerts.length > 0 && unreadCount > 0 && (
                <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-500 hover:text-indigo-600 font-medium" onClick={handleMarkAllAsRead}>
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
              <DropdownMenuItem asChild className="cursor-pointer"><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer"><Link href="/setting">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-rose-500 focus:text-rose-600 font-medium" onClick={() => { alert('Đã đăng xuất!'); router.push('/login') }}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}