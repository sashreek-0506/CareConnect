import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleShell from '../components/layout/RoleShell';
import { roleHome } from './roleHome';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

import CreateRequestPage from '../pages/customer/CreateRequestPage';
import MyRequestsPage from '../pages/customer/MyRequestsPage';
import RequestDetailPage from '../pages/customer/RequestDetailPage';
import CustomerBookingsPage from '../pages/customer/MyBookingsPage';

import ProviderProfilePage from '../pages/provider/ProviderProfilePage';
import AvailabilityPage from '../pages/provider/AvailabilityPage';
import MatchingRequestsPage from '../pages/provider/MatchingRequestsPage';
import MyQuotesPage from '../pages/provider/MyQuotesPage';
import ProviderBookingsPage from '../pages/provider/MyBookingsPage';

import BookingsOverviewPage from '../pages/ops/BookingsOverviewPage';

import DisputesInboxPage from '../pages/support/DisputesInboxPage';
import DisputeDetailPage from '../pages/support/DisputeDetailPage';

import CategoriesPage from '../pages/admin/CategoriesPage';
import ProviderVerificationPage from '../pages/admin/ProviderVerificationPage';
import UsersPage from '../pages/admin/UsersPage';
import AuditLogPage from '../pages/admin/AuditLogPage';

import AnalyticsPage from '../pages/shared/AnalyticsPage';
import BookingDetailPage from '../pages/shared/BookingDetailPage';

function RoleHomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome(user.role)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RoleHomeRedirect />} />

      {/* Any authenticated role can view a booking or dispute detail; the
          page itself adapts its actions based on req.user role. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleShell />}>
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<RoleShell />}>
          <Route path="/customer/requests/new" element={<CreateRequestPage />} />
          <Route path="/customer/requests" element={<MyRequestsPage />} />
          <Route path="/customer/requests/:id" element={<RequestDetailPage />} />
          <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
        <Route element={<RoleShell />}>
          <Route path="/provider/profile" element={<ProviderProfilePage />} />
          <Route path="/provider/availability" element={<AvailabilityPage />} />
          <Route path="/provider/matching" element={<MatchingRequestsPage />} />
          <Route path="/provider/quotes" element={<MyQuotesPage />} />
          <Route path="/provider/bookings" element={<ProviderBookingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ops', 'admin']} />}>
        <Route element={<RoleShell />}>
          <Route path="/ops/bookings" element={<BookingsOverviewPage />} />
          <Route path="/ops/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['support', 'admin']} />}>
        <Route element={<RoleShell />}>
          <Route path="/support/disputes" element={<DisputesInboxPage />} />
          <Route path="/support/disputes/:id" element={<DisputeDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<RoleShell />}>
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/verification" element={<ProviderVerificationPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
