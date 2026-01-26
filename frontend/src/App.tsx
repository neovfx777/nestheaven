import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Layout from './layouts/Layout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import ApartmentsPage from './pages/apartments/ApartmentsPage';
import ApartmentDetailPage from './pages/apartments/ApartmentDetailPage';
import ComplexesPage from './pages/complexes/ComplexesPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import FavoritesPage from './pages/dashboard/FavoritesPage';

// Admin dashboard pages (complex management)
import ComplexList from './pages/dashboard/admin/ComplexList';
import ComplexForm from './pages/dashboard/admin/ComplexForm';
import { AnalyticsDashboard } from './pages/dashboard/admin/AnalyticsDashboard';
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
        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="apartments" element={<ApartmentsPage />} />
          <Route path="apartments/:id" element={<ApartmentDetailPage />} />
          <Route path="complexes" element={<ComplexesPage />} />
        </Route>

        {/* Auth routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Dashboard routes (protected) */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          
          {/* Admin routes */}
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

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;