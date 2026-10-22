import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import TopBar from "../components/layout/TopBar/TopBar";
import SideNavBar from "../components/layout/SideNavBar/SideNavBar";
import { getCurrentUser } from "../mocks/api";
import "./AppLayout.css";

export default function AppLayout() {
  const user = getCurrentUser();
  const location = useLocation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      contentRef.current.scrollLeft = 0;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="app-layout">
      <SideNavBar />
      <div className="app-layout-main">
        <TopBar />
        <main className="app-layout-content" ref={contentRef}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
