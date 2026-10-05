import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main className="min-h-screen bg-surface-secondary text-white">
      <Outlet />
    </main>
  );
}

export default AuthLayout;
