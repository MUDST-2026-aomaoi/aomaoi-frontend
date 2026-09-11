import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/auth/AuthGuard';

import { AdminLayout } from './layouts/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Workers from './pages/admin/Workers';
import WorkLog from './pages/admin/WorkLog';
import Overview from './pages/admin/Overview';

import { SuperAdminLayout } from './layouts/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import AllFarms from './pages/superadmin/AllFarms';
import AdminsManagement from './pages/superadmin/AdminsManagement';

import WorkerLayout from './layouts/worker/WorkerLayout';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerHistory from './pages/worker/WorkerHistory';
import Login from './pages/auth/Login';
import { useAuthStore } from './controller/authController';

// A dynamic layout selector that renders the correct layout and dashboard
// based on the logged-in user's role.
function RoleBasedDashboard() {
  const currentUser = useAuthStore(state => state.currentUser);
  
  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.role === 'superadmin') {
    return (
      <SuperAdminLayout>
        <SuperAdminDashboard />
      </SuperAdminLayout>
    );
  }
  
  if (currentUser.role === 'admin') {
    return (
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    );
  }
  
  if (currentUser.role === 'worker') {
    return (
      <WorkerLayout>
        <WorkerDashboard />
      </WorkerLayout>
    );
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Unified Dashboard Route */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <RoleBasedDashboard />
          </AuthGuard>
        } />

        {/* Worker-Only Routes */}
        <Route element={<AuthGuard allowedRoles={['worker']}><WorkerLayout /></AuthGuard>}>
          <Route path="/history" element={<WorkerHistory />} />
        </Route>

        {/* Admin-Only Routes */}
        <Route element={<AuthGuard allowedRoles={['admin']}><AdminLayout /></AuthGuard>}>
          <Route path="/workers" element={<Workers />} />
          <Route path="/work" element={<WorkLog />} />
          <Route path="/overview" element={<Overview />} />
        </Route>

        {/* SuperAdmin-Only Routes */}
        <Route element={<AuthGuard allowedRoles={['superadmin']}><SuperAdminLayout /></AuthGuard>}>
          <Route path="/farms" element={<AllFarms />} />
          <Route path="/admins" element={<AdminsManagement />} />
        </Route>

        {/* Default Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
