'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // TRẠM GÁC: Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const isAuth = localStorage.getItem('is_logged_in')
    if (isAuth !== 'true') {
      router.push('/login') // Đuổi ra trang đăng nhập nếu chưa có vé
    } else {
      setIsAuthorized(true) // Cho phép qua cửa
    }
  }, [router])

  // Hiện vòng xoay loading trong lúc kiểm tra vé (tránh bị lộ giao diện Dashboard)
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  )
}