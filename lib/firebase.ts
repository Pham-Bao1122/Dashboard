// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Cấu hình chìa khóa Firebase của huynh đệ
// (Lấy đoạn config này trong phần Project Settings (Cài đặt dự án) trên web Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCoDZzSTvz7byzoA-s163N7ZGVuQa18lwk",
  authDomain: "dht11-4de0f.firebaseapp.com",
  // Đệ nhớ URL database của huynh đệ ở ảnh trước là cái này:
  databaseURL: "https://dht11-4de0f-default-rtdb.firebaseio.com",
  projectId: "dht11-4de0f",
  storageBucket: "ĐIỀN_STORAGE_BUCKET_VÀO_ĐÂY",
  messagingSenderId: "ĐIỀN_MESSAGING_SENDER_ID_VÀO_ĐÂY",
  appId: "ĐIỀN_APP_ID_VÀO_ĐÂY"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và xuất (export) biến database để các file khác (như control-panel) có thể dùng chung
export const database = getDatabase(app);