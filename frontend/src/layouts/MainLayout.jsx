import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import EmailVerificationBanner from "../components/EmailVerificationBanner";

function MainLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileNavTriggerRef = useRef(null);

  return (
    <div className="min-h-screen bg-app text-white">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          triggerRef={mobileNavTriggerRef}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            mobileNavTriggerRef={mobileNavTriggerRef}
          />

          <EmailVerificationBanner />

          <main id="main-content" className="min-w-0 flex-1">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
