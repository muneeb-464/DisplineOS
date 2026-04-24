import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Planner from "./pages/Planner";
import LogScreen from "./pages/LogScreen";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Reflect from "./pages/Reflect";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AppShell><Outlet /></AppShell>}>
                <Route path="/" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
                <Route path="/log" element={<ProtectedRoute><LogScreen /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/reflect" element={<ProtectedRoute><Reflect /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
