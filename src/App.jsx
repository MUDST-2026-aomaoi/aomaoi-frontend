import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Workers from './pages/admin/Workers';
import WorkLog from './pages/admin/WorkLog';
import Overview from './pages/admin/Overview';

// Layouts
import WorkerLayout from './components/layout/WorkerLayout';

// Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerHistory from './pages/worker/WorkerHistory';

import WorkerBalance from './pages/worker/WorkerBalance';

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
          <Route path="history" element={<WorkerHistory />} />
          <Route path="balance" element={<WorkerBalance />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workers" element={<Workers />} />
          <Route path="work/cutting" element={<WorkLog type="cutting" />} />
          <Route path="work/planting" element={<WorkLog type="planting" />} />
          <Route path="work/watering" element={<WorkLog type="watering" />} />
          <Route path="work/spraying" element={<WorkLog type="spraying" />} />
          <Route path="overview" element={<Overview />} />
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
