'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' // Nối mây lấy dữ liệu
import emailjs from '@emailjs/browser' // Thư viện gửi Mail
import { toast } from 'sonner' // Thư viện hiển thị Popup

interface LayoutWrapperProps {
  children: ReactNode
}

// Chống spam email: Sau khi báo động, chờ 5 phút (300000ms) mới được gửi mail báo động tiếp cho cùng 1 phòng
const ALERT_COOLDOWN = 300000; 

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  // Nối vào bộ não Firebase để Radar quét
  const { data } = useFirebaseData()
  
  // Cuốn sổ tay ghi nhớ thời gian báo động cuối cùng của từng trạm
  const lastAlertTime = useRef<Record<string, number>>({})

  // TRẠM GÁC: Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const isAuth = localStorage.getItem('is_logged_in')
    if (isAuth !== 'true') {
      router.push('/login')
    } else {
      setIsAuthorized(true)
    }
  }, [router])

  // ==========================================
  // RADAR NGẦM: TỰ ĐỘNG PHÁT HIỆN VÀ GỬI MAIL
  // ==========================================
  useEffect(() => {
    // Chỉ hoạt động khi đã đăng nhập và Firebase có dữ liệu các trạm
    if (!isAuthorized || !data?.NODES) return;

    Object.keys(data.NODES).forEach(async (nodeId) => {
      const nodeData = data.NODES[nodeId];
      const now = Date.now();
      const lastAlert = lastAlertTime.current[nodeId] || 0;

      // 1. Đặt ra các quy tắc báo động
      let alertMsg = '';
      if (nodeData.TEMP > 40) {
        alertMsg = `Nhiệt độ tại trạm ${nodeId} đang ở mức NGUY HIỂM: ${nodeData.TEMP}°C!`;
      } else if (nodeData.DOOR === 1) {
        alertMsg = `Cảnh báo an ninh: Phát hiện có người mở cửa tại trạm ${nodeId}!`;
      }

      // 2. Nếu có biến VÀ đã qua 5 phút kể từ cái mail cuối cùng
      if (alertMsg && (now - lastAlert > ALERT_COOLDOWN)) {
        
        // Khóa mỏ spam ngay lập tức
        lastAlertTime.current[nodeId] = now;

        // Lấy chìa khóa EmailJS từ trong túi ra (Đã lưu ở trang Setting)
        const emailConfigStr = localStorage.getItem('iot_emailjs_config');
        if (!emailConfigStr) return; 
        const emailConfig = JSON.parse(emailConfigStr);

        try {
          // Lấy cấu hình Bật/Tắt từ Firebase xuống
          const res = await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/settings.json');
          const settings = await res.json();
          if (!settings) return;

          const { alertEmail, enableEmailAlerts, enablePushAlerts } = settings;

          // HÀNH ĐỘNG 1: Bật Popup chớp đỏ lên màn hình nếu cho phép
          if (enablePushAlerts) {
            toast.error(`🚨 CẢNH BÁO KHẨN: ${alertMsg}`, { duration: 10000 }); // Đỏ chóe 10 giây
          }

          // HÀNH ĐỘNG 2: Gửi Email nếu cho phép
          if (enableEmailAlerts && alertEmail) {
            emailjs.send(
              emailConfig.serviceId,
              emailConfig.templateId,
              {
                to_email: alertEmail,
                message: alertMsg,
              },
              emailConfig.publicKey
            ).then(() => {
              console.log(`Đã gửi email báo động cho trạm ${nodeId} thành công!`);
            }).catch((err) => {
              console.error('Lỗi khi bắn mail:', err);
            });
          }
        } catch (err) {
          console.error('Lỗi khi kích hoạt báo động:', err);
        }
      }
    });
  }, [data, isAuthorized]);

  // Hiện vòng xoay loading trong lúc kiểm tra vé
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