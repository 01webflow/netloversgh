import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Eagerly loaded: landing + auth + core public pages (needed for first paint / SEO).
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Lazy-loaded public pages (not needed on initial load)
const PricingPage = lazyWithRetry(() => import("./pages/Pricing"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Community = lazyWithRetry(() => import("./pages/Community"));
const Bundles = lazyWithRetry(() => import("./pages/Bundles"));
const BundleDetail = lazyWithRetry(() => import("./pages/BundleDetail"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const Cart = lazyWithRetry(() => import("./pages/Cart"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const Services = lazyWithRetry(() => import("./pages/Services"));
const ServiceCheckout = lazyWithRetry(() => import("./pages/ServiceCheckout"));

// Lazy-loaded user dashboard
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const DashboardOrders = lazyWithRetry(() => import("./pages/DashboardOrders"));
const DashboardWallet = lazyWithRetry(() => import("./pages/DashboardWallet"));
const DashboardAccount = lazyWithRetry(() => import("./pages/DashboardAccount"));
const OrderTracking = lazyWithRetry(() => import("./pages/OrderTracking"));
const DashboardServices = lazyWithRetry(() => import("./pages/DashboardServices"));

// Lazy-loaded admin bundle (separate chunk – only loaded when an admin visits /admin/*)
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazyWithRetry(() => import("./pages/admin/AdminUsers"));
const AdminOrders = lazyWithRetry(() => import("./pages/admin/AdminOrders"));
const AdminBundles = lazyWithRetry(() => import("./pages/admin/AdminBundles"));
const AdminAuditLogs = lazyWithRetry(() => import("./pages/admin/AdminAuditLogs"));
const AdminAgents = lazyWithRetry(() => import("./pages/admin/AdminAgents"));
const AdminPayouts = lazyWithRetry(() => import("./pages/admin/AdminPayouts"));
const AdminServices = lazyWithRetry(() => import("./pages/admin/AdminServices"));

// Lazy-loaded agent bundle (separate chunk – only loaded when an agent visits /agent/*)
const AgentDashboard = lazyWithRetry(() => import("./pages/agent/AgentDashboard"));
const AgentApply = lazyWithRetry(() => import("./pages/agent/AgentApply"));

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
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:slug" element={<ServiceCheckout />} />
                  <Route path="/dashboard/services" element={<DashboardServices />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/bundles" element={<AdminBundles />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                  <Route path="/admin/agents" element={<AdminAgents />} />
                  <Route path="/admin/payouts" element={<AdminPayouts />} />
                  <Route path="/admin/services" element={<AdminServices />} />
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
