import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PricingPage from "./pages/Pricing";
import Contact from "./pages/Contact";
import Community from "./pages/Community";
import Dashboard from "./pages/Dashboard";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardWallet from "./pages/DashboardWallet";
import DashboardAccount from "./pages/DashboardAccount";
import Bundles from "./pages/Bundles";
import BundleDetail from "./pages/BundleDetail";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminPayouts from "./pages/admin/AdminPayouts";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentApply from "./pages/agent/AgentApply";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="netlovers-theme">
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                <Route path="/admin/agents" element={<AdminAgents />} />
                <Route path="/admin/payouts" element={<AdminPayouts />} />
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                <Route path="/agent/apply" element={<AgentApply />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;