import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

function MainLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app text-white">
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onOpenMobileNav={() => setIsMobileNavOpen(true)} />

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
