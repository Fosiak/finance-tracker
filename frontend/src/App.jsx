import { BrowserRouter, Routes, Route } from "react-router-dom";
/* Layouts Import */
import MainLayout from "./layouts/MainLayout";
/* Pages Import */
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Statistics from "./pages/Statistics";
import Profile from "./pages/Profile";
/* Context Import */
import { FinanceProvider } from "./context/FinanceContext";

function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/expenses" element={<Expenses />} />

            <Route path="/statistics" element={<Statistics />} />

            <Route path="/budget" element={<Budget />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </FinanceProvider>
  );
}

export default App;
