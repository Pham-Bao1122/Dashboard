'use client'

import { useState, useEffect } from 'react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
// Đã xóa import Phone
import { User, Mail, MapPin, Camera, Save, Key, Lock } from 'lucide-react'
import { toast } from 'sonner'

// LINK FIREBASE ĐỂ LƯU DỮ LIỆU
const FB_PROFILE_URL = "https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/profile.json"
const FB_AUTH_URL = "https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/auth.json"

export default function ProfilePage() {
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Đã xóa biến phone khỏi state mặc định
  const [profile, setProfile] = useState({
    fullName: 'Admin Hệ Thống',
    role: 'Kỹ sư Điện tử Viễn thông',
    email: 'admin.iot@example.com',
    location: 'Hồ Chí Minh, Việt Nam',
  })

  const [isUpdatingAuth, setIsUpdatingAuth] = useState(false)
  const [credentials, setCredentials] = useState({
    username: 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 1. TẢI DỮ LIỆU TỪ FIREBASE KHI MỞ TRANG
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tải Profile
        const resProfile = await fetch(FB_PROFILE_URL)
        const dataProfile = await resProfile.json()
        if (dataProfile) setProfile(dataProfile)

        // Tải Username
        const resAuth = await fetch(FB_AUTH_URL)
        const dataAuth = await resAuth.json()
        if (dataAuth?.username) {
          setCredentials(prev => ({ ...prev, username: dataAuth.username }))
        }
      } catch (e) {
        console.error("Lỗi tải dữ liệu", e)
      } finally {
        setIsMounted(true)
      }
    }
    fetchData()
  }, [])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  // 2. LƯU THÔNG TIN CÁ NHÂN LÊN FIREBASE
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      await fetch(FB_PROFILE_URL, {
        method: 'PUT', // Lệnh đè dữ liệu mới lên
        body: JSON.stringify(profile)
      })
      toast.success('Đã đồng bộ hồ sơ lên Cloud!')
    } catch (e) {
      toast.error('Lỗi lưu trữ!')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // 3. ĐỔI MẬT KHẨU LÊN FIREBASE
  const handleUpdateAuth = async () => {
    setIsUpdatingAuth(true)
    try {
      // Tải mật khẩu hiện tại từ đám mây xuống để check
      const resAuth = await fetch(FB_AUTH_URL)
      const dataAuth = await resAuth.json()
      const realPassword = dataAuth?.password || '123456'

      if (credentials.currentPassword !== realPassword) {
        toast.error('Mật khẩu hiện tại không đúng!')
        setIsUpdatingAuth(false)
        return 
      }

      if (credentials.newPassword) {
        if (credentials.newPassword !== credentials.confirmPassword) {
          toast.error('Mật khẩu mới không khớp!')
          setIsUpdatingAuth(false)
          return
        }
        if (credentials.newPassword.length < 6) {
          toast.error('Mật khẩu phải có ít nhất 6 ký tự!')
          setIsUpdatingAuth(false)
          return
        }
      }

      // Đẩy tài khoản/mật khẩu mới lên đám mây
      const newPasswordToSave = credentials.newPassword || realPassword
      await fetch(FB_AUTH_URL, {
        method: 'PUT',
        body: JSON.stringify({
          username: credentials.username,
          password: newPasswordToSave
        })
      })

      setCredentials({ ...credentials, currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Đã cập nhật tài khoản và bảo mật lên Cloud!')
    } catch (e) {
      toast.error('Lỗi cập nhật bảo mật!')
    } finally {
      setIsUpdatingAuth(false)
    }
  }

  if (!isMounted) return null

  return (
    <LayoutWrapper>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile & Security</h1>
          <p className="text-muted-foreground">
            Đồng bộ hồ sơ cá nhân và thông tin đăng nhập trên hệ thống Cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-sm overflow-hidden">
                  <User className="w-16 h-16 text-muted-foreground" />
                </div>
                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full w-8 h-8">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{profile.fullName}</h3>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Cập nhật thông tin liên hệ của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" name="fullName" value={profile.fullName} onChange={handleProfileChange} className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" name="role" value={profile.role} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" value={profile.email} onChange={handleProfileChange} className="pl-9" />
                    </div>
                  </div>
                  {/* Kéo Location lên ngang hàng với Email bằng cách xóa class md:col-span-2 */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="location" name="location" value={profile.location} onChange={handleProfileChange} className="pl-9" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-border mt-4">
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="flex gap-2">
                    <Save className="w-4 h-4" />
                    {isSavingProfile ? 'Saving...' : 'Sync Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Cập nhật Tên đăng nhập và Mật khẩu dùng để truy cập Dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (Tên đăng nhập)</Label>
                    <div className="relative max-w-md">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="username" 
                        name="username" 
                        value={credentials.username} 
                        onChange={handleCredentialsChange} 
                        className="pl-9" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="currentPassword" 
                          name="currentPassword" 
                          type="password" 
                          placeholder="••••••••"
                          value={credentials.currentPassword} 
                          onChange={handleCredentialsChange} 
                          className="pl-9" 
                        />
                      </div>
                    </div>
                    <div className="hidden md:block"></div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="newPassword" 
                          name="newPassword" 
                          type="password" 
                          placeholder="••••••••"
                          value={credentials.newPassword} 
                          onChange={handleCredentialsChange} 
                          className="pl-9" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword" 
                          type="password" 
                          placeholder="••••••••"
                          value={credentials.confirmPassword} 
                          onChange={handleCredentialsChange} 
                          className="pl-9" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border mt-4">
                  <Button onClick={handleUpdateAuth} disabled={isUpdatingAuth} className="flex gap-2">
                    <Save className="w-4 h-4" />
                    {isUpdatingAuth ? 'Updating...' : 'Sync Security'}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}