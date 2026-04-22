'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useFirebaseData } from '@/components/hooks/use-firebase-data' 
import emailjs from '@emailjs/browser' 
import { toast } from 'sonner' 

interface LayoutWrapperProps {
  children: ReactNode
}

// ĐÃ GIẢM XUỐNG 10 GIÂY ĐỂ HUYNH ĐỆ DỄ TEST. (Khi nào nộp đồ án thì đổi lại thành 300000 nhé)
const ALERT_COOLDOWN = 300000; 

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  const { data } = useFirebaseData()
  const lastAlertTime = useRef<Record<string, number>>({})

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
    if (!isAuthorized || !data?.NODES) return;

    Object.keys(data.NODES).forEach(async (nodeId) => {
      const nodeData = data.NODES[nodeId];
      const now = Date.now();
      const lastAlert = lastAlertTime.current[nodeId] || 0;

      let alertMsg = '';
      if (nodeData.TEMP > 40) {
        alertMsg = `🔥 NGUY HIỂM: Nhiệt độ tại trạm ${nodeId} đang rất cao (${nodeData.TEMP}°C)! Nguy cơ cháy nổ!`;
      } else if (nodeData.DOOR === 1) {
        alertMsg = `🚨 AN NINH: Phát hiện cửa mở trái phép tại trạm ${nodeId}!`;
      } else if (nodeData.LIGHT > 800) { 
        alertMsg = `☀️ CẢNH BÁO: Cường độ ánh sáng tại trạm ${nodeId} vượt ngưỡng (${nodeData.LIGHT} lux)!`;
      } else if (nodeData.HUM > 80) {
        alertMsg = `💧 CẢNH BÁO: Độ ẩm tại trạm ${nodeId} quá cao (${nodeData.HUM}%)!`;
      }

      // Nếu có biến VÀ đã qua thời gian Cooldown (10 giây)
      if (alertMsg && (now - lastAlert > ALERT_COOLDOWN)) {
        
        lastAlertTime.current[nodeId] = now; // Khóa mỏ ngay để chống spam

        try {
          const res = await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/settings.json');
          const settings = await res.json();
          if (!settings) return;

          const { alertEmail, enableEmailAlerts, enablePushAlerts } = settings;

          // HÀNH ĐỘNG 1: Popup chớp đỏ (Luôn chạy nếu được bật)
          if (enablePushAlerts) {
            toast.error(alertMsg, { duration: 10000 }); 
          }

          // HÀNH ĐỘNG 2: Gửi Email (Kèm check lỗi)
          if (enableEmailAlerts && alertEmail) {
            const emailConfigStr = localStorage.getItem('iot_emailjs_config');
            
            if (!emailConfigStr) {
              toast.warning("Chưa thiết lập mã EmailJS trong cài đặt!");
              return;
            }

            const emailConfig = JSON.parse(emailConfigStr);
            
            // Check xem huynh đệ đã thay mã XXXXXXXX chưa
            if (emailConfig.serviceId.includes('XXXX')) {
              toast.error("Lỗi: Bạn chưa thay mã Service ID của EmailJS trong code Settings!");
              return;
            }

            // Tiến hành bắn mail
            emailjs.send(
              emailConfig.serviceId,
              emailConfig.templateId,
              {
                to_email: alertEmail,
                message: alertMsg,
              },
              emailConfig.publicKey
            ).then((res) => {
              console.log("Email gửi thành công!", res.status);
              toast.success(`Đã gửi Email báo động đến ${alertEmail}`);
            }).catch((err) => {
              console.error("Lỗi bắn mail:", err);
              toast.error("Gửi mail thất bại! Hãy check lại API Key của EmailJS (Xem F12).");
            });
          }
        } catch (err) {
          console.error('Lỗi khi kích hoạt báo động:', err);
        }
      }
    });
  }, [data, isAuthorized]);

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