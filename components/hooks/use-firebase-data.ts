'use client'

import { useState, useEffect } from 'react'

// ==========================================
// 1. CẬP NHẬT CẤU TRÚC KIỂU DỮ LIỆU MỚI TỪ FIREBASE
// ==========================================
export interface ControlData {
  DEVICE_STATE: number; // 1 là ON, 0 là OFF
  MODE: string;         // "AUTO" hoặc "MANUAL"
}

export interface NodeSensorData {
  DOOR: number;         // 1 là Mở, 0 là Đóng
  HUM: number;          // Độ ẩm
  LIGHT: number;        // Ánh sáng
  NODE_STATE: number;   // Trạng thái Node (1 là Online)
  TEMP: number;         // Nhiệt độ
  TIMESTAMP: number;    // Dấu thời gian Unix
  TIMESTRING: string;   // Chuỗi thời gian
}

export interface NodeInfo {
  LOCATION: string;
  NAME: string;
}

// Cấu trúc tổng hợp của toàn bộ hệ thống
export interface SystemData {
  CONTROL: Record<string, ControlData>;
  NODES: Record<string, NodeSensorData>;
  NODE_INFO: Record<string, NodeInfo>;
}

// LINK FIREBASE MỚI NHẤT
const FIREBASE_BASE_URL = 'https://doantotnghiep-808e9-default-rtdb.firebaseio.com'

export function useFirebaseData() {
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tải toàn bộ dữ liệu từ rễ Firebase (chỉ tải .json, tự động bỏ qua nhánh admin nếu phân quyền đúng)
        const res = await fetch(`${FIREBASE_BASE_URL}/.json`)
        if (!res.ok) throw new Error('Lỗi kết nối Firebase')
        const result = await res.json()
        
        if (result) {
          setData(result)
        }
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Tự động quét lại mỗi 2 giây
    const intervalId = setInterval(fetchData, 2000)
    return () => clearInterval(intervalId)
  }, [])

  // ==========================================
  // 2. CÁC HÀM ĐIỀU KHIỂN THIẾT BỊ (ĐÃ NÂNG CẤP)
  // ==========================================
  
  // Hàm bật/tắt thiết bị của một Node cụ thể
  const toggleDevice = async (nodeId: string, state: number) => {
    try {
      await fetch(`${FIREBASE_BASE_URL}/CONTROL/${nodeId}/.json`, {
        method: 'PATCH', // Chỉ cập nhật đúng trường DEVICE_STATE, giữ nguyên MODE
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DEVICE_STATE: state })
      })
    } catch (err) {
      console.error(`Lỗi khi bật/tắt thiết bị Node ${nodeId}:`, err)
    }
  }

  // Hàm chuyển đổi chế độ AUTO / MANUAL
  const changeMode = async (nodeId: string, mode: 'AUTO' | 'MANUAL') => {
    try {
      await fetch(`${FIREBASE_BASE_URL}/CONTROL/${nodeId}/.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MODE: mode })
      })
    } catch (err) {
      console.error(`Lỗi khi chuyển chế độ Node ${nodeId}:`, err)
    }
  }

  return { data, loading, error, toggleDevice, changeMode }
}