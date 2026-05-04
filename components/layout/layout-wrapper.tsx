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

// ĐÃ GIẢM XUỐNG 10 GIÂY ĐỂ DỄ TEST. (Khi nào nộp đồ án thì đổi lại thành 300000 nhé)
const ALERT_COOLDOWN = 10000; 

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const isAuth = localStorage.getItem('is_logged_in')
    if (isAuth !== 'true') {
      router.push('/login')
    } else {
      setIsAuthorized(true)
    }
  }, [router])

// ... (giữ nguyên phần trên) ...

  const { data } = useFirebaseData()
  const lastAlertTime = useRef<Record<string, number>>({})
  
  // THÊM BIẾN NÀY ĐỂ NHẬN BIẾT LẦN LOAD ĐẦU TIÊN
  const isInitialLoad = useRef(true) 
  const previousData = useRef<any>(null) // Lưu dữ liệu nhịp trước để so sánh sự thay đổi

  // ==========================================
  // RADAR NGẦM: TỰ ĐỘNG PHÁT HIỆN, LƯU LỊCH SỬ VÀ GỬI MAIL
  // ==========================================
  useEffect(() => {
    if (!isAuthorized || !data?.NODES) return;

    // KHI VỪA MỞ WEB: Chỉ lưu trạng thái ban đầu, tuyệt đối không báo động để chống Spam
    if (isInitialLoad.current) {
      previousData.current = JSON.parse(JSON.stringify(data.NODES));
      isInitialLoad.current = false;
      return;
    }

    Object.keys(data.NODES).forEach(async (nodeId) => {
      const nodeData = data.NODES[nodeId];
      const prevNodeData = previousData.current?.[nodeId] || {}; // Lấy dữ liệu nhịp trước ra so sánh
      
      const now = Date.now();
      const lastAlert = lastAlertTime.current[nodeId] || 0;

      let alertMsg = '';
      let alertType = 'info';
      let alertTitle = 'Thông báo hệ thống';

      // 1. PHÂN LOẠI CẢNH BÁO (Chỉ báo khi trạng thái vọt qua ngưỡng so với nhịp trước)
      if (nodeData.TEMP > 40 && prevNodeData.TEMP <= 40) {
        alertMsg = `🔥 NGUY HIỂM: Nhiệt độ tại trạm ${nodeId} đang rất cao (${nodeData.TEMP}°C)! Nguy cơ cháy nổ!`;
        alertType = 'danger';
        alertTitle = 'Cảnh báo Nhiệt độ';
      } else if (nodeData.DOOR === 1 && prevNodeData.DOOR === 0) {
        alertMsg = `🚨 AN NINH: Phát hiện cửa mở trái phép tại trạm ${nodeId}!`;
        alertType = 'danger';
        alertTitle = 'Cảnh báo An ninh';
      } else if (nodeData.LIGHT > 800 && prevNodeData.LIGHT <= 800) { 
        alertMsg = `☀️ CẢNH BÁO: Cường độ ánh sáng tại trạm ${nodeId} vượt ngưỡng (${nodeData.LIGHT} lux)!`;
        alertType = 'warning';
        alertTitle = 'Cảnh báo Ánh sáng';
      } else if (nodeData.HUM > 80 && prevNodeData.HUM <= 80) {
        alertMsg = `💧 CẢNH BÁO: Độ ẩm tại trạm ${nodeId} quá cao (${nodeData.HUM}%)!`;
        alertType = 'info';
        alertTitle = 'Cảnh báo Độ ẩm';
      }

      // 2. NẾU CÓ BIẾN VÀ ĐÃ QUA THỜI GIAN COOLDOWN
      if (alertMsg && (now - lastAlert > ALERT_COOLDOWN)) {
        
        lastAlertTime.current[nodeId] = now; 

        const newAlertObj = {
          id: Date.now(),
          type: alertType,
          title: alertTitle,
          message: alertMsg,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isNew: true
        };

        const existingAlerts = JSON.parse(localStorage.getItem('iot_alerts') || '[]');
        const updatedAlerts = [newAlertObj, ...existingAlerts].slice(0, 50); 
        localStorage.setItem('iot_alerts', JSON.stringify(updatedAlerts));
        
        window.dispatchEvent(new Event('iot_alerts_updated'));

        // 3. THỰC THI GỬI EMAIL VÀ POPUP
        try {
          const res = await fetch('https://doantotnghiep-808e9-default-rtdb.firebaseio.com/admin/settings.json');
          const settings = await res.json();
          if (!settings) return;

          const { alertEmail, enableEmailAlerts, enablePushAlerts } = settings;

          if (enablePushAlerts) {
            if (alertType === 'danger') toast.error(alertMsg, { duration: 10000 }); 
            else toast.warning(alertMsg, { duration: 10000 });
          }

          if (enableEmailAlerts && alertEmail) {
            const emailConfigStr = localStorage.getItem('iot_emailjs_config');
            if (emailConfigStr) {
               const emailConfig = JSON.parse(emailConfigStr);
               if (!emailConfig.serviceId.includes('XXXX')) {
                 emailjs.send(
                   emailConfig.serviceId, emailConfig.templateId, { to_email: alertEmail, message: alertMsg }, emailConfig.publicKey
                 ).catch(err => console.error(err));
               }
            }
          }
        } catch (err) {
          console.error('Lỗi khi kích hoạt báo động:', err);
        }
      }
    });

    // Cập nhật lại dữ liệu "nhịp trước" để dùng cho nhịp quét tiếp theo
    previousData.current = JSON.parse(JSON.stringify(data.NODES));

  }, [data, isAuthorized]);

  // ... (giữ nguyên phần return ở dưới) ...

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