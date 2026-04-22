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

// Chống spam email: Sau khi báo động, chờ 5 phút (300000ms) mới được gửi mail tiếp cho cùng 1 phòng
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

      // 1. BỘ QUY TẮC BÁO ĐỘNG ĐÃ ĐƯỢC BỔ SUNG ĐẦY ĐỦ
      let alertMsg = '';
      if (nodeData.TEMP > 40) {
        alertMsg = `🔥 NGUY HIỂM: Nhiệt độ tại trạm ${nodeId} đang rất cao (${nodeData.TEMP}°C)! Nguy cơ cháy nổ!`;
      } else if (nodeData.DOOR === 1) {
        alertMsg = `🚨 AN NINH: Phát hiện cửa mở trái phép tại trạm ${nodeId}!`;
      } else if (nodeData.LIGHT > 800) { 
        // Huynh đệ có thể tự đổi số 800 này thành ngưỡng mong muốn
        alertMsg = `☀️ CẢNH BÁO: Cường độ ánh sáng tại trạm ${nodeId} vượt ngưỡng an toàn (${nodeData.LIGHT} lux)!`;
      } else if (nodeData.HUM > 80) {
        // Cảnh báo thêm độ ẩm nếu cần
        alertMsg = `💧 CẢNH BÁO: Độ ẩm tại trạm ${nodeId} đang quá cao (${nodeData.HUM}%), nguy cơ chập mạch!`;
      }

      // 2. Nếu có biến VÀ đã qua 5 phút kể từ cái mail cuối cùng
      if (alertMsg && (now - lastAlert > ALERT_COOLDOWN)) {
        
        lastAlertTime.current[nodeId] = now;

        const emailConfigStr = localStorage.getItem('iot_emailjs_config');
        if (!emailConfigStr) return; 
        const emailConfig = JSON.parse(emailConfigStr);

        try {
          const res = await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/settings.json');
          const settings = await res.json();
          if (!settings) return;

          const { alertEmail, enableEmailAlerts, enablePushAlerts } = settings;

          // HÀNH ĐỘNG 1: Popup chớp đỏ
          if (enablePushAlerts) {
            toast.error(alertMsg, { duration: 10000 }); 
          }

          // HÀNH ĐỘNG 2: Gửi Email
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