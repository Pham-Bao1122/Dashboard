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

const ALERT_COOLDOWN = 10000; 

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // MỚI: State quản lý Sidebar Mobile
  
  const { data } = useFirebaseData()
  const lastAlertTime = useRef<Record<string, number>>({})
  const isInitialLoad = useRef(true) 
  const previousData = useRef<any>(null) 

  useEffect(() => {
    const isAuth = localStorage.getItem('is_logged_in')
    if (isAuth !== 'true') router.push('/login')
    else setIsAuthorized(true)
  }, [router])

  // Dọn rác tự động
  useEffect(() => {
    const cleanupHistory = () => {
      const savedAutoClear = localStorage.getItem('iot_autoclear_days') || '7';
      if (savedAutoClear === 'never') return;
      const days = parseInt(savedAutoClear);
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000); 
      const existingAlerts = JSON.parse(localStorage.getItem('iot_alerts') || '[]');
      const validAlerts = existingAlerts.filter((alert: any) => alert.id > cutoffTime);
      if (validAlerts.length !== existingAlerts.length) {
        localStorage.setItem('iot_alerts', JSON.stringify(validAlerts));
        window.dispatchEvent(new Event('iot_alerts_updated'));
      }
    };
    cleanupHistory(); 
    window.addEventListener('iot_settings_updated', cleanupHistory); 
    return () => window.removeEventListener('iot_settings_updated', cleanupHistory);
  }, []);

  // Radar Ngầm
  useEffect(() => {
    if (!isAuthorized || !data?.NODES) return;

    if (isInitialLoad.current) {
      previousData.current = JSON.parse(JSON.stringify(data.NODES));
      isInitialLoad.current = false;
      return;
    }

    Object.keys(data.NODES).forEach(async (nodeId) => {
      const nodeData = data.NODES[nodeId];
      const prevNodeData = previousData.current?.[nodeId] || {}; 
      
      const now = Date.now();
      const lastAlert = lastAlertTime.current[nodeId] || 0;

      let alertMsg = '';
      let alertType = 'info';
      let alertTitle = 'Thông báo hệ thống';

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

      if (alertMsg && (now - lastAlert > ALERT_COOLDOWN)) {
        lastAlertTime.current[nodeId] = now; 

        const newAlertObj = {
          id: Date.now(), type: alertType, title: alertTitle, message: alertMsg,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isNew: true
        };

        const existingAlerts = JSON.parse(localStorage.getItem('iot_alerts') || '[]');
        const updatedAlerts = [newAlertObj, ...existingAlerts].slice(0, 50); 
        localStorage.setItem('iot_alerts', JSON.stringify(updatedAlerts));
        window.dispatchEvent(new Event('iot_alerts_updated'));

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
                   emailConfig.serviceId, emailConfig.templateAlertId || emailConfig.templateId, { to_email: alertEmail, message: alertMsg }, emailConfig.publicKey
                 ).catch(err => console.error(err));
               }
            }
          }
        } catch (err) {
          console.error('Lỗi khi kích hoạt báo động:', err);
        }
      }
    });

    previousData.current = JSON.parse(JSON.stringify(data.NODES));
  }, [data, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      {/* 1. LỚP NỀN ĐEN CHỐNG CHÓI KHI MỞ MENU MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. KHUNG TRƯỢT MENU BÊN TRÁI (Trượt ra khi isSidebarOpen = true) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-64 h-full bg-card shadow-xl md:shadow-none" onClick={() => setIsSidebarOpen(false)}>
          <Sidebar />
        </div>
      </div>

      {/* 3. HEADER ĐƯỢC GẮN LỆNH MỞ MENU */}
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
      
      {/* 4. MAIN CONTENT: Không còn bị ép ml-64 trên điện thoại nữa */}
      <main className="ml-0 md:ml-64 mt-16 p-4 md:p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}