'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Bell, Settings } from 'lucide-react'
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
  const router = useRouter() // Khởi tạo router để dùng cho nút Logout

  return (
    <header className="fixed top-0 left-64 right-0 bg-card border-b border-border h-16 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">System Overview</h2>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Nút Profile chuyển hướng đến /profile */}
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              
              {/* Nút Settings chuyển hướng đến /configuration */}
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/setting">Settings</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Nút Logout xử lý đăng xuất */}
              <DropdownMenuItem 
                className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
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