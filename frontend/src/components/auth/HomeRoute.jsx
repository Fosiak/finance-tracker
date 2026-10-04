import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LandingPage from "../../pages/LandingPage";

function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

export default HomeRoute;
