export function roleHome(role) {
  switch (role) {
    case 'customer': return '/customer/requests';
    case 'provider': return '/provider/matching';
    case 'ops': return '/ops/bookings';
    case 'support': return '/support/disputes';
    case 'admin': return '/admin/categories';
    default: return '/login';
  }
}
