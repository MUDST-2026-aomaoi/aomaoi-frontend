import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import WorkerLayout from './components/layout/WorkerLayout';

// Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้า Login (รอทำทีหลัง) */}
        <Route path="/login" element={<div className="flex h-screen items-center justify-center bg-farm-bg text-2xl font-bold">Login Page (รอก่อนน้า)</div>} />

        {/* เส้นทางของ Worker */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="history" element={<div className="p-4 bg-white rounded-lg">หน้า History (เดี๋ยวมาทำต่อ)</div>} />
          <Route path="balance" element={<div className="p-4 bg-white rounded-lg">หน้า Balance (เดี๋ยวมาทำต่อ)</div>} />
        </Route>

        {/* เส้นทางของ Admin (หน้าเพื่อน) */}
        <Route path="/admin" element={<div className="p-4">นี่คือที่ดินของ Admin (รอเพื่อนมาเขียน)</div>}>
          <Route path="dashboard" element={<div>Admin Dashboard</div>} />
        </Route>
        
        {/* เส้นทางของ Superadmin (หน้าเพื่อน) */}
        <Route path="/superadmin" element={<div className="p-4">นี่คือที่ดินของ Superadmin (รอเพื่อนมาเขียน)</div>}>
          <Route path="admins" element={<div>Manage Admins</div>} />
        </Route>

        {/* ค่าเริ่มต้น ถ้าเปิดเว็บมาให้โยงไปหน้า Dashboard เลย */}
        <Route path="*" element={<Navigate to="/worker/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
