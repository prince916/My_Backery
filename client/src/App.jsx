import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout            from './components/layout/Layout';
import ProtectedRoute    from './components/common/ProtectedRoute';
import AdminRoute        from './components/common/AdminRoute';

// Pages
import HomePage           from './pages/HomePage';
import ProductsPage       from './pages/ProductsPage';
import ProductDetailPage  from './pages/ProductDetailPage';
import CartPage           from './pages/CartPage';
import CheckoutPage       from './pages/CheckoutPage';
import OrderFromHerePage  from './pages/OrderFromHerePage';
import OrderTrackingPage  from './pages/OrderTrackingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import ContactPage        from './pages/ContactPage';
import NotFoundPage       from './pages/NotFoundPage';

// Dashboard
import DashboardPage   from './pages/dashboard/DashboardPage';
import ProfilePage     from './pages/dashboard/ProfilePage';
import OrderHistoryPage from './pages/dashboard/OrderHistoryPage';
import WishlistPage    from './pages/dashboard/WishlistPage';
import AddressesPage   from './pages/dashboard/AddressesPage';
import SettingsPage    from './pages/dashboard/SettingsPage';

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard';
import ManageProducts   from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import ManageOrders     from './pages/admin/ManageOrders';
import ManageUsers      from './pages/admin/ManageUsers';
import ManageCoupons    from './pages/admin/ManageCoupons';
import ManageReviews    from './pages/admin/ManageReviews';
import Analytics        from './pages/admin/Analytics';

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes inside main Layout */}
        <Route element={<Layout />}>
          <Route index                       element={<HomePage />} />
          <Route path="products"             element={<ProductsPage />} />
          <Route path="products/:idOrSlug"   element={<ProductDetailPage />} />
          <Route path="order-from-here"      element={<OrderFromHerePage />} />
          <Route path="contact"              element={<ContactPage />} />
          <Route path="login"                element={<LoginPage />} />
          <Route path="register"             element={<RegisterPage />} />
          <Route path="forgot-password"      element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="cart"              element={<CartPage />} />
            <Route path="checkout"          element={<CheckoutPage />} />
            <Route path="orders/:id"        element={<OrderTrackingPage />} />
            <Route path="dashboard"         element={<DashboardPage />} />
            <Route path="dashboard/profile"  element={<ProfilePage />} />
            <Route path="dashboard/orders"   element={<OrderHistoryPage />} />
            <Route path="dashboard/wishlist" element={<WishlistPage />} />
            <Route path="dashboard/addresses" element={<AddressesPage />} />
            <Route path="dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="admin"                   element={<AdminDashboard />} />
          <Route path="admin/products"          element={<ManageProducts />} />
          <Route path="admin/categories"        element={<ManageCategories />} />
          <Route path="admin/orders"            element={<ManageOrders />} />
          <Route path="admin/users"             element={<ManageUsers />} />
          <Route path="admin/coupons"           element={<ManageCoupons />} />
          <Route path="admin/reviews"           element={<ManageReviews />} />
          <Route path="admin/analytics"         element={<Analytics />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
