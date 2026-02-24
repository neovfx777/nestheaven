import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Layout from './components/layout/Layout';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import ApartmentsPage from './pages/apartments/ApartmentsPage';
import ApartmentDetailPage from './pages/apartments/ApartmentDetailPage';
import ComplexesPage from './pages/ComplexesPage';
import ComplexDetailPage from './pages/ComplexDetailPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import UserDashboard from './pages/dashboard/UserDashboard';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import OwnerSettingsPage from './pages/dashboard/owner/OwnerSettingsPage';
import OwnerBillingPage from './pages/dashboard/owner/OwnerBillingPage';
import FavoritesPage from './pages/dashboard/FavoritesPage';

// Admin dashboard pages
import { ComplexList } from './pages/dashboard/admin/ComplexList';
import { ComplexFormNew } from './pages/dashboard/admin/ComplexFormNew';
import { ComplexManagement } from './pages/dashboard/admin/ComplexManagement';
import { AnalyticsDashboard } from './pages/dashboard/admin/AnalyticsDashboard';
import { UserManagement } from './pages/dashboard/admin/UserManagement';

// Seller dashboard pages
import { SellerApartmentList } from './pages/dashboard/seller/ApartmentList';
import { ApartmentForm } from './pages/dashboard/seller/ApartmentForm';

// Misc
import NotFoundPage from './pages/NotFoundPage';
import ModerationLogsPage from './pages/dashboard/manager/ModerationLogsPage';

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
          <Route path="complexes">
            <Route index element={<ComplexesPage />} />
            <Route path=":id" element={<ComplexDetailPage />} />
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
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
          <Route index element={<DashboardPage />} />
          <Route path="user" element={<UserDashboard />} />
          <Route path="seller" element={<SellerDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="manager" element={<ManagerDashboard />} />
          <Route path="owner" element={<OwnerDashboard />} />
          <Route path="favorites" element={<FavoritesPage />} />
          
          {/* Manager / Owner: Admin management & moderation logs */}
          <Route
            path="manager/admins"
            element={
              <ProtectedRoute requireRole={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <UserManagement mode="admins" />
              </ProtectedRoute>
            }
          />
          <Route
            path="manager/logs"
            element={
              <ProtectedRoute requireRole={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <ModerationLogsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Seller routes */}
          <Route
            path="seller/listings"
            element={
              <ProtectedRoute requireRole={['SELLER', 'OWNER_ADMIN']}>
                <SellerApartmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="seller/apartments/new"
            element={
              <ProtectedRoute requireRole={['SELLER', 'OWNER_ADMIN']}>
                <ApartmentForm mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="seller/apartments/:id/edit"
            element={
              <ProtectedRoute requireRole={['SELLER', 'OWNER_ADMIN']}>
                <ApartmentForm mode="edit" />
              </ProtectedRoute>
            }
          />
          <Route
            path="seller/apartments/edit/:id"
            element={
              <ProtectedRoute requireRole={['SELLER', 'OWNER_ADMIN']}>
                <ApartmentForm mode="edit" />
              </ProtectedRoute>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute requireRole={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <UserManagement mode="users" />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute requireRole={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/complexes"
            element={
              <ProtectedRoute requireRole={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <ComplexManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/complexes/new"
            element={
              <ProtectedRoute requireRole={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <ComplexFormNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/complexes/:id/edit"
            element={
              <ProtectedRoute requireRole={['MANAGER_ADMIN', 'OWNER_ADMIN']}>
                <ComplexFormNew />
              </ProtectedRoute>
            }
          />

          {/* Owner admin routes */}
          <Route
            path="owner/settings"
            element={
              <ProtectedRoute requireRole={['OWNER_ADMIN']}>
                <OwnerSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/billing"
            element={
              <ProtectedRoute requireRole={['OWNER_ADMIN']}>
                <OwnerBillingPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Direct protected routes without dashboard layout */}
        <Route
          path="/apartments/:id"
          element={
            <Layout>
              <ApartmentDetailPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
