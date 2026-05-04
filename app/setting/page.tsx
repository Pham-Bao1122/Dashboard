'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun, Save, Mail, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const FB_SETTINGS_URL = 'https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/settings.json'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 1. Trạng thái cấu hình lưu trên Firebase (Cảnh báo cơ bản)
  const [settings, setSettings] = useState({
    alertEmail: 'doan.iot@example.com',
    enableEmailAlerts: true,
    enablePushAlerts: true
  })

  // 2. Trạng thái cấu hình Nâng cao (Lưu trên LocalStorage)
  const [emailConfig, setEmailConfig] = useState({
    serviceId: '',
    templateAlertId: '', 
    templateAuthId: '',
    publicKey: ''
  })
  const [autoClearDays, setAutoClearDays] = useState('7')

  // Tải toàn bộ cấu hình khi mở trang
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Tải từ Firebase
        const res = await fetch(FB_SETTINGS_URL)
        const data = await res.json()
        if (data) {
          setSettings({
            alertEmail: data.alertEmail || '',
            enableEmailAlerts: data.enableEmailAlerts !== false, 
            enablePushAlerts: data.enablePushAlerts !== false
          })
        }
      } catch (e) {
        console.error("Lỗi tải Settings", e)
      } finally {
        setIsMounted(true)
      }
    }

    // Tải từ LocalStorage
    const savedEmailConfig = localStorage.getItem('iot_emailjs_config')
    if (savedEmailConfig) setEmailConfig(JSON.parse(savedEmailConfig))

    const savedAutoClear = localStorage.getItem('iot_autoclear_days')
    if (savedAutoClear) setAutoClearDays(savedAutoClear)

    fetchSettings()
  }, [])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailConfig({ ...emailConfig, [e.target.name]: e.target.value })
  }

  // Lưu toàn bộ cấu hình
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // 1. Lưu cấu hình cơ bản lên Firebase
      await fetch(FB_SETTINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      // 2. Lưu cấu hình Nâng cao vào LocalStorage
      localStorage.setItem('iot_emailjs_config', JSON.stringify(emailConfig))
      localStorage.setItem('iot_autoclear_days', autoClearDays)
      
      // Kích hoạt Event để Radar ngầm nhận biết thay đổi
      window.dispatchEvent(new Event('iot_settings_updated'))

      toast.success('Đã lưu toàn bộ cấu hình hệ thống!')
    } catch (e) {
      toast.error('Lỗi khi lưu cấu hình!')
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
          <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>

        {/* ĐÃ THÊM TAB "ADVANCED" VÀO ĐÂY */}
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Alerts & Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                </div>

                <div className="h-px bg-border/50 w-full" />

                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Gửi Email Tự động</Label>
                  </div>
                  <Switch
                    checked={settings.enableEmailAlerts}
                    onCheckedChange={(val) => setSettings({...settings, enableEmailAlerts: val})}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Thông báo màn hình (Popup)</Label>
                  </div>
                  <Switch
                    checked={settings.enablePushAlerts}
                    onCheckedChange={(val) => setSettings({...settings, enablePushAlerts: val})}
                  />
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB NÂNG CAO CHỨA CẤU HÌNH EMAILJS VÀ DỌN RÁC */}
          <TabsContent value="advanced" className="space-y-4">
            <Card className="border-t-4 border-t-indigo-500 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  EmailJS API Configuration
                </CardTitle>
                <CardDescription>
                  Thiết lập mã API để hệ thống gửi mail. Dữ liệu được lưu an toàn tại LocalStorage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service ID</Label>
                    <Input 
                      name="serviceId" 
                      placeholder="VD: service_xxxxx" 
                      value={emailConfig.serviceId} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input 
                      name="publicKey" 
                      placeholder="VD: ptZwMtQLtm..." 
                      value={emailConfig.publicKey} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-rose-500 font-semibold">Template ID (Báo động Radar)</Label>
                    <Input 
                      name="templateAlertId" 
                      placeholder="VD: template_abc123" 
                      value={emailConfig.templateAlertId} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-500 font-semibold">Template ID (Khôi phục Mật khẩu)</Label>
                    <Input 
                      name="templateAuthId" 
                      placeholder="VD: template_xyz987" 
                      value={emailConfig.templateAuthId} 
                      onChange={handleEmailChange} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                  Auto-Clear History
                </CardTitle>
                <CardDescription>
                  Tự động dọn dẹp các thông báo cũ trên cái chuông để giải phóng bộ nhớ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Clock className="w-8 h-8 text-muted-foreground opacity-50" />
                  <div className="flex-1 space-y-2">
                    <Label>Xóa thông báo cũ hơn (Ngày)</Label>
                    <select 
                      className="flex h-10 w-full md:w-1/3 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={autoClearDays}
                      onChange={(e) => setAutoClearDays(e.target.value)}
                    >
                      <option value="1">1 Ngày</option>
                      <option value="3">3 Ngày</option>
                      <option value="7">7 Ngày</option>
                      <option value="30">30 Ngày</option>
                      <option value="never">Không bao giờ xóa</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  )
}