import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Outlet />
    </main>
  );
}

export default AuthLayout;
