import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar/TopBar";
import SideNavBar from "../components/layout/SideNavBar/SideNavBar";
import "./AppLayout.css";

export default function AppLayout() {
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