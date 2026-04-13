'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lock, User } from 'lucide-react'
import { toast } from 'sonner'

// LINK FIREBASE CỦA HUYNH ĐỆ
const FIREBASE_AUTH_URL = "https://dht11-4de0f-default-rtdb.firebaseio.com/admin/auth.json"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  // Đổi thành hàm async để gọi lên Firebase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Tải tài khoản/mật khẩu mới nhất từ Firebase về
      const response = await fetch(FIREBASE_AUTH_URL)
      const data = await response.json()

      // Nếu trên Firebase chưa có dữ liệu, dùng mặc định là admin / 123456
      const realUsername = data?.username || 'admin'
      const realPassword = data?.password || '123456'

      // 2. So sánh dữ liệu người dùng nhập
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">IoT Monitor</CardTitle>
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

          <CardFooter className="pt-4">
            <Button type="submit" className="w-full text-base py-6" disabled={isLoading}>
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}