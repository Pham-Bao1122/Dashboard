// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Cấu hình chìa khóa Firebase của huynh đệ
// (Lấy đoạn config này trong phần Project Settings (Cài đặt dự án) trên web Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBff0KyIuNtXQtlvf98Ds-23MdRG1ZhqOE",
  authDomain: "doantotnghiep-808e9.firebaseapp.com",
  // Đệ nhớ URL database của huynh đệ ở ảnh trước là cái này:
  databaseURL: "https://doantotnghiep-808e9-default-rtdb.firebaseio.com/",
  projectId: "doantotnghiep-808e9",
  storageBucket: "doantotnghiep-808e9.firebasestorage.app",
  messagingSenderId: "318631141510",
  appId: "1:318631141510:web:be8a0465e305fde673f107"  
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và xuất (export) biến database để các file khác (như control-panel) có thể dùng chung
export const database = getDatabase(app);