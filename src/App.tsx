// src/App.tsx  
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navigation } from './components/Navigation';
import { PrivateRoute } from './components/PrivateRoute';
import { EquipmentInstallation } from './pages/EquipmentInstallation';
import { Login } from './pages/Login';
import { TenderDetails } from './pages/TenderDetails';
import { TenderList } from './pages/TenderList';
import { Unauthorized } from './pages/unauthorized';
import { UserRoleAccess } from './pages/UserRoleAccess';
import { AccessoryConsumableManagement } from './pages/AccessoryConsumableManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                  <Navigation />
                  <Navigate to="/tenders" replace />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-items"
            element={
              <PrivateRoute adminOnly requiredRoles={['admin', 'super_admin']}>
                <>
                  <Navigation />
                  <AccessoryConsumableManagement />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly requiredRoles={['super_admin']}>
                <UserRoleAccess />
              </PrivateRoute>
            }
          />

          <Route
            path="/tenders"
            element={
              <PrivateRoute>
                <>
                  <Navigation />
                  <TenderList />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/tenders/:id"
            element={
              <PrivateRoute>
                <>
                  <Navigation />
                  <TenderDetails />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/equipment-installation"
            element={
              <PrivateRoute adminOnly requiredRoles={['admin', 'super_admin']}>
                <>
                  <Navigation />
                  <EquipmentInstallation />
                </>
              </PrivateRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
}

export default App;  