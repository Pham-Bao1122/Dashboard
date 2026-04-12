'use client'

import { useState, useEffect } from 'react'

export interface SensorData {
  temperature: number
  humidity: number
  light: number       // Sửa lại cho khớp Firebase
  gas: number         // Thêm gas từ Firebase
  auto: boolean       // Khớp với Relay 2
  LORA_ACTIVATE: number // Khớp với Relay 1 (1 là ON, 0 là OFF)
  packet_id?: number;
  timestamp: number
}

const FIREBASE_URL = 'https://dht11-4de0f-default-rtdb.firebaseio.com/.json?auth=O3OxU7Cwp3Jr9wwIgwRaQeL9R8ef7a22BGmVYSr9'
const FIREBASE_BASE_URL = 'https://dht11-4de0f-default-rtdb.firebaseio.com'
const AUTH_KEY = 'O3OxU7Cwp3Jr9wwIgwRaQeL9R8ef7a22BGmVYSr9'

export function useFirebaseData() {
  const [data, setData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(FIREBASE_URL)
        if (!res.ok) throw new Error('Lỗi kết nối Firebase')
        const result = await res.json()
        
        if (result) {
          setData({
            ...result,
            timestamp: Date.now() // Thêm thời gian thực để vẽ biểu đồ
          })
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

  // Hàm gửi lệnh bật/tắt thiết bị lên Firebase
  const toggleRelay = async (relayNumber: 1 | 2, state: boolean) => {
    try {
      // Relay 1 tương ứng với LORA_ACTIVATE (1/0)
      // Relay 2 tương ứng với auto (true/false)
      const payload = relayNumber === 1 
        ? { LORA_ACTIVATE: state ? 1 : 0 } 
        : { auto: state }

      await fetch(`${FIREBASE_BASE_URL}/.json?auth=${AUTH_KEY}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.error('Lỗi khi điều khiển thiết bị', err)
    }
  }

  return { data, loading, error, toggleRelay }
}