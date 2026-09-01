import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<div className="flex h-screen items-center justify-center">Login Page</div>} />

        {/* Worker Routes */}
        <Route path="/worker" element={<div className="p-4">Worker Layout</div>}>
          <Route path="dashboard" element={<div>Worker Dashboard</div>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<div className="p-4">Admin Layout</div>}>
          <Route path="dashboard" element={<div>Admin Dashboard</div>} />
        </Route>
        
        {/* Superadmin Routes */}
        <Route path="/superadmin" element={<div className="p-4">Superadmin Layout</div>}>
          <Route path="admins" element={<div>Manage Admins</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
