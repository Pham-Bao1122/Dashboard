'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lock, User, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import emailjs from '@emailjs/browser'

// LINK FIREBASE
const FIREBASE_AUTH_URL = "https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/auth.json"
const FIREBASE_PROFILE_URL = "https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/profile.json" 

// MÃ EMAILJS (Đã cấu hình sẵn theo mã của huynh đệ)
const EMAILJS_SERVICE_ID = 'service_3d371vc' 
const EMAILJS_TEMPLATE_ID = 'template_pxvsibc' 
const EMAILJS_PUBLIC_KEY = 'a2_oFc1ngj4-lSal9'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  // 1. HÀM ĐĂNG NHẬP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(FIREBASE_AUTH_URL)
      const data = await response.json()

      const realUsername = data?.username || 'admin'
      const realPassword = data?.password || '123456'

      if (credentials.username === realUsername && credentials.password === realPassword) {
        localStorage.setItem('is_logged_in', 'true') 
        toast.success('Đăng nhập thành công!')
        router.push('/') 
      } else {
        toast.error('Sai tên đăng nhập hoặc mật khẩu!')
      }
    } catch (error) {
      toast.error('Lỗi kết nối đến máy chủ Firebase!')
    } finally {
      setIsLoading(false)
    }
  }

  // 2. HÀM KHÔI PHỤC MẬT KHẨU
  const handleForgotPassword = async () => {
    const inputEmail = window.prompt('Bảo mật hệ thống: Nhập Email bạn đã đăng ký trong hồ sơ để nhận lại mật khẩu:')
    
    if (!inputEmail) return

    setIsRecovering(true)
    toast.info('Đang xác minh danh tính...')

    try {
      // BƯỚC 1: Lấy Email từ Profile trên Firebase
      const profileRes = await fetch(FIREBASE_PROFILE_URL)
      const profileData = await profileRes.json()

      // Biến 'email' phải khớp với tên trường huynh đệ lưu trên Firebase nhánh profile
      const savedEmail = profileData?.email

      if (!savedEmail) {
        toast.error('Hệ thống chưa ghi nhận Email nào trong Profile. Vui lòng liên hệ Admin gốc!')
        setIsRecovering(false)
        return
      }

      // So sánh Email nhập vào và Email trên Firebase
      if (inputEmail.toLowerCase().trim() !== savedEmail.toLowerCase().trim()) {
        toast.error('Email không khớp với hồ sơ gốc! Từ chối truy cập.')
        setIsRecovering(false)
        return
      }

      // BƯỚC 2: Kéo Mật khẩu về
      const authRes = await fetch(FIREBASE_AUTH_URL)
      const authData = await authRes.json()
      const realUsername = authData?.username || 'admin'
      const realPassword = authData?.password || '123456'

      // BƯỚC 3: Gửi EmailJS
      const messageStr = `YÊU CẦU KHÔI PHỤC TÀI KHOẢN TỪ HỆ THỐNG IoT.\n\n- Tên đăng nhập: ${realUsername}\n- Mật khẩu hiện tại: ${realPassword}\n\nKhuyến cáo: Vui lòng đổi mật khẩu mới ngay sau khi đăng nhập thành công để đảm bảo an toàn!`

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: savedEmail,
          message: messageStr,
        },
        EMAILJS_PUBLIC_KEY
      )

      toast.success('Đã gửi thông tin đăng nhập vào Email của bạn. Vui lòng kiểm tra hộp thư!')
    } catch (error) {
      console.error(error)
      toast.error('Lỗi đường truyền! Không thể gửi email khôi phục.')
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-indigo-500">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">IoT Monitor</CardTitle>
          <CardDescription className="text-base">
            Nhập tài khoản và mật khẩu để truy cập hệ thống giám sát.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  placeholder="Nhập 'admin'"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Nhập '123456'"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col pt-4 space-y-4">
            <Button type="submit" className="w-full text-base py-6 bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || isRecovering}>
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-sm text-muted-foreground hover:text-indigo-600 font-medium"
              onClick={handleForgotPassword}
              disabled={isLoading || isRecovering}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {isRecovering ? 'Đang gửi thông tin...' : 'Quên mật khẩu?'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}