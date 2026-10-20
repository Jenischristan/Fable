import { Navigate, Outlet, useLocation } from "react-router-dom";
import TopBar from "../components/layout/TopBar/TopBar";
import SideNavBar from "../components/layout/SideNavBar/SideNavBar";
import { getCurrentUser } from "../mocks/api";
import "./AppLayout.css";

export default function AppLayout() {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="app-layout">
      <SideNavBar />
      <div className="app-layout-main">
        <TopBar />
        <main className="app-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
