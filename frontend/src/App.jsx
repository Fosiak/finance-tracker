import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import CookieNotice from "./components/CookieNotice";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Statistics from "./pages/Statistics";
import Budget from "./pages/Budget";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import LandingPage from "./pages/LandingPage";
import CookiePolicy from "./pages/CookiePolicy";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Protected — FinanceProvider only mounts once ProtectedRoute
              has confirmed the user is authenticated, so its data fetch
              never races the login/session-restore flow. */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <FinanceProvider>
                  <MainLayout />
                </FinanceProvider>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>

        <CookieNotice />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
