import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Suspense, lazy } from "react";

// Eagerly loaded: landing + auth + core public pages (needed for first paint / SEO).
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Lazy-loaded public pages (not needed on initial load)
const PricingPage = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const Community = lazy(() => import("./pages/Community"));
const Bundles = lazy(() => import("./pages/Bundles"));
const BundleDetail = lazy(() => import("./pages/BundleDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Cart = lazy(() => import("./pages/Cart"));
const FAQ = lazy(() => import("./pages/FAQ"));

// Lazy-loaded user dashboard
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardOrders = lazy(() => import("./pages/DashboardOrders"));
const DashboardWallet = lazy(() => import("./pages/DashboardWallet"));
const DashboardAccount = lazy(() => import("./pages/DashboardAccount"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));

// Lazy-loaded admin bundle (separate chunk – only loaded when an admin visits /admin/*)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminBundles = lazy(() => import("./pages/admin/AdminBundles"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminAgents = lazy(() => import("./pages/admin/AdminAgents"));
const AdminPayouts = lazy(() => import("./pages/admin/AdminPayouts"));

// Lazy-loaded agent bundle (separate chunk – only loaded when an agent visits /agent/*)
const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard"));
const AgentApply = lazy(() => import("./pages/agent/AgentApply"));

const queryClient = new QueryClient();

// Lightweight fallback while a route chunk loads
const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="netlovers-theme">
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/orders" element={<DashboardOrders />} />
                  <Route path="/dashboard/orders/:provider" element={<DashboardOrders />} />
                  <Route path="/dashboard/order/:orderId" element={<OrderTracking />} />
                  <Route path="/dashboard/wallet" element={<DashboardWallet />} />
                  <Route path="/dashboard/account" element={<DashboardAccount />} />
                  <Route path="/dashboard/transactions" element={<DashboardWallet />} />
                  <Route path="/bundles" element={<Bundles />} />
                  <Route path="/bundles/:providerId" element={<BundleDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/bundles" element={<AdminBundles />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                  <Route path="/admin/agents" element={<AdminAgents />} />
                  <Route path="/admin/payouts" element={<AdminPayouts />} />
                  <Route path="/agent/dashboard" element={<AgentDashboard />} />
                  <Route path="/agent/apply" element={<AgentApply />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
