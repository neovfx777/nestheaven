import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts - FIXED IMPORTS
import Layout from './components/layout/Layout';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import ApartmentsPage from './pages/apartments/ApartmentsPage';
import ApartmentDetailPage from './pages/apartments/ApartmentDetailPage';
import ComplexesPage from './pages/ComplexesPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import FavoritesPage from './pages/dashboard/FavoritesPage';
import { Overview } from './pages/dashboard/Overview';

// Admin dashboard pages - FIXED: Changed to named imports
import { ComplexList } from './pages/dashboard/admin/ComplexList';
import { ComplexForm } from './pages/dashboard/admin/ComplexForm';
import { AnalyticsDashboard } from './pages/dashboard/admin/AnalyticsDashboard';
import { UserManagement } from './pages/dashboard/admin/UserManagement';

// vimda kod yozdim

// Misc
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
          },
        }}
      />

      <Routes>
        {/* Public routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="apartments">
            <Route index element={<ApartmentsPage />} />
            <Route path=":id" element={<ApartmentDetailPage />} />
          </Route>
          <Route path="complexes" element={<ComplexesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Dashboard routes (protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="favorites" element={<FavoritesPage />} />
          
          {/* Admin routes */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/complexes"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <ComplexList />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/complexes/new"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <ComplexForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/complexes/:id/edit"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <ComplexForm />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 - Should be outside all layouts */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
