'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// --- CẤU HÌNH EMAILJS (THAY ID CỦA HUYNH ĐỆ VÀO ĐÂY) ---
const EMAILJS_SERVICE_ID = 'service_etpxja9' 
const EMAILJS_TEMPLATE_ID = 'template_ju1qkvi' 
const EMAILJS_PUBLIC_KEY = 'ptZwMtQLtmAQ1SKbs' 
// --------------------------------------------------------

const FB_SETTINGS_URL = 'https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/settings.json'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Trạng thái cấu hình lưu trên Firebase
  const [settings, setSettings] = useState({
    alertEmail: 'doan.iot@example.com',
    enableEmailAlerts: true,
    enablePushAlerts: true
  })

  // 1. Tải cấu hình từ Firebase khi mở trang
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(FB_SETTINGS_URL)
        const data = await res.json()
        if (data) {
          setSettings({
            alertEmail: data.alertEmail || '',
            enableEmailAlerts: data.enableEmailAlerts !== false, // Mặc định là true nếu chưa có
            enablePushAlerts: data.enablePushAlerts !== false
          })
        }
      } catch (e) {
        console.error("Lỗi tải Settings", e)
      } finally {
        setIsMounted(true)
      }
    }
    fetchSettings()
  }, [])

  // 2. Lưu toàn bộ cấu hình lên Firebase
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await fetch(FB_SETTINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      // Lưu thông tin EmailJS vào LocalStorage để file LayoutWrapper đọc được và gửi mail
      localStorage.setItem('iot_emailjs_config', JSON.stringify({
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY
      }))

      toast.success('Đã lưu cấu hình cảnh báo thành công!')
    } catch (e) {
      toast.error('Lỗi khi lưu cấu hình lên máy chủ!')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isMounted) return null

  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        <div className="space-y-2 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and alert preferences.
            </p>
          </div>
          {/* Nút lưu tổng cho toàn trang */}
          <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Alerts & Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')} className="flex gap-2 w-32">
                    <Sun className="w-4 h-4" /> Sáng
                  </Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')} className="flex gap-2 w-32">
                    <Moon className="w-4 h-4" /> Tối
                  </Button>
                  <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')} className="flex gap-2 w-32">
                    <Monitor className="w-4 h-4" /> Hệ thống
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="border-t-4 border-t-rose-500">
              <CardHeader>
                <CardTitle>Cấu hình Cảnh báo (Alerts)</CardTitle>
                <CardDescription>
                  Thiết lập hòm thư và cách thức nhận thông báo khi hệ thống phát hiện vượt ngưỡng an toàn.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                
                {/* Email Nhận Cảnh Báo */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-rose-500">Email nhận cảnh báo</Label>
                  <div className="flex gap-4">
                    <Input
                      id="email"
                      type="email"
                      value={settings.alertEmail}
                      onChange={(e) => setSettings({...settings, alertEmail: e.target.value})}
                      className="max-w-[400px]"
                      placeholder="Nhập email của bạn (VD: admin@gmail.com)"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email này sẽ được dùng để nhận các cảnh báo khẩn cấp từ hệ thống. Đừng quên bấm "Lưu cài đặt" ở góc trên.
                  </p>
                </div>

                <div className="h-px bg-border/50 w-full" />

                {/* Công tắc 1: Cảnh báo qua Email */}
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Gửi Email Tự động</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép hệ thống tự động gửi thư điện tử khi nhiệt độ &gt; 40°C hoặc cửa bị mở trái phép.
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableEmailAlerts}
                    onCheckedChange={(val) => setSettings({...settings, enableEmailAlerts: val})}
                  />
                </div>

                {/* Công tắc 2: Cảnh báo trên màn hình (Push) */}
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Thông báo màn hình (Popup)</Label>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị cảnh báo màu đỏ chớp nháy ngay trên giao diện web Dashboard này.
                    </p>
                  </div>
                  <Switch
                    checked={settings.enablePushAlerts}
                    onCheckedChange={(val) => setSettings({...settings, enablePushAlerts: val})}
                  />
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}