import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Workers from './pages/admin/Workers';
import WorkLog from './pages/admin/WorkLog';
import Overview from './pages/admin/Overview';

import { SuperAdminLayout } from './layouts/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import AllFarms from './pages/superadmin/AllFarms';
import AdminsManagement from './pages/superadmin/AdminsManagement';

// Layouts
import WorkerLayout from './layouts/worker/WorkerLayout';

// Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerHistory from './pages/worker/WorkerHistory';
import WorkerBalance from './pages/worker/WorkerBalance';
import Login from './pages/auth/Login';

// Auth Store
import { useAuthStore } from './store/useAuthStore';

// ProtectedRoute: ถ้าไม่ได้ล็อกอิน จะเด้งกลับหน้า Login
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้า Login */}
        <Route path="/login" element={<Login />} />

        {/* เส้นทางของ Worker (ต้องล็อกอินก่อน) */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute>
              <WorkerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="history" element={<WorkerHistory />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workers" element={<Workers />} />
          <Route path="work" element={<WorkLog />} />
          <Route path="overview" element={<Overview />} />
        </Route>
        
        {/* เส้นทางของ Superadmin */}
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="farms" element={<AllFarms />} />
          <Route path="admins" element={<AdminsManagement />} />
        </Route>

        {/* Default: ไปหน้า Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

