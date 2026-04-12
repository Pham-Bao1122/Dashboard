'use client'

import { Switch } from '@/components/ui/switch'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(true)
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState('doan.iot@example.com')
  const [isSaving, setIsSaving] = useState(false)

  // Hàm xử lý khi bấm nút Lưu Email
  const handleSaveEmail = () => {
    setIsSaving(true)
    // Giả lập thời gian chờ gọi API lên server mất 1 giây
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Đã cập nhật Email thành công!') // Bật thông báo màu xanh
    }, 1000)
  }
  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          {/* Thanh chọn Menu Tabs */}
          <TabsList className="bg-muted/50">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* 1. Tab Giao diện (Sáng/Tối) */}
<TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Đệ đã thay dòng chữ cũ bằng cụm 3 nút bấm ở đây */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex gap-2 w-32"
                  >
                    <Sun className="w-4 h-4" /> Sáng
                  </Button>
                  
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex gap-2 w-32"
                  >
                    <Moon className="w-4 h-4" /> Tối
                  </Button>
                  
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="flex gap-2 w-32"
                  >
                    <Monitor className="w-4 h-4" /> Theo Hệ thống
                  </Button>
                </div>
              </CardContent>
              
            </Card>
          </TabsContent>

          {/* 2. Tab Tài khoản (Đổi Email) */}
<TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your email and personal details.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-4">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="max-w-[400px]"
                      />
                      <Button onClick={handleSaveEmail} disabled={isSaving}>
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email này sẽ được dùng để nhận các cảnh báo khi nhiệt độ/độ ẩm vượt ngưỡng.
                  </p>
                </div>
              </CardContent>
              
            </Card>
          </TabsContent>

          {/* 3. Tab Thông báo */}
<TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose what alerts you want to receive when sensor values exceed thresholds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                
                {/* Công tắc 1: Cảnh báo qua Email */}
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận email cảnh báo khi phát hiện nhiệt độ cao hoặc có khí gas (MQ2).
                    </p>
                  </div>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>

                {/* Công tắc 2: Cảnh báo trên màn hình (Push) */}
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị thông báo popup trực tiếp trên màn hình Dashboard này.
                    </p>
                  </div>
                  <Switch
                    checked={pushAlerts}
                    onCheckedChange={setPushAlerts}
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