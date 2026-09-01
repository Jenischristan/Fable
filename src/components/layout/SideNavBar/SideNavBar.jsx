import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  IconBell,
  IconPlus,
  IconHome,
  IconSettings,
  IconCompass,
  IconBookmark,
  IconHomeFilled,
  IconCompassFilled,
  IconBookmarkFilled,
  IconBellFilled,
  IconSettingsFilled,
  IconPlusFilled,
  IconX,
} from "@tabler/icons-react";
import "./SideNavBar.css";
import logo from "../../../assets/logo.svg"

export default function SideNavBar() {
  const [showNotificationTab, setShowNotificationTab] = useState(false);

  const getNavClass = ({ isActive }) =>
    isActive ? "side-nav-btn nav-btn-active" : "side-nav-btn";

  return (
    <div className="nav-wrapper">
      <nav className="side-nav">
        <div className="side-nav-container">
          <div className="side-logo-container">
            <Link to="/home" className="side-nav-logo" aria-label="Home">
             <img src={logo} alt="logo" />
            </Link>
          </div>

          <div className="nav-divider"></div>

          <ul className="side-nav-main">
            {/* Home */}
            <li>
              <NavLink
                to="/home"
                title="Home"
                className={getNavClass}
                onClick={() => setShowNotificationTab(false)}
              >
                {({ isActive }) =>
                  isActive ? (
                    <IconHomeFilled size={20} />
                  ) : (
                    <IconHome size={20} />
                  )
                }
              </NavLink>
            </li>

            {/* Explore */}
            <li>
              <NavLink
                to="/explore"
                title="Explore"
                className={getNavClass}
                onClick={() => setShowNotificationTab(false)}
              >
                {({ isActive }) =>
                  isActive ? (
                    <IconCompassFilled size={20} />
                  ) : (
                    <IconCompass size={20} />
                  )
                }
              </NavLink>
            </li>

            {/* Create */}
            <li>
              <NavLink
                to="/create"
                title="Create"
                className={getNavClass}
                onClick={() => setShowNotificationTab(false)}
              >
                {({ isActive }) =>
                  isActive ? (
                    <IconPlusFilled size={20} />
                  ) : (
                    <IconPlus size={20} />
                  )
                }
              </NavLink>
            </li>

            {/* Bookmarks */}
            <li>
              <NavLink
                to="/bookmarks"
                title="Bookmarks"
                className={getNavClass}
                onClick={() => setShowNotificationTab(false)}
              >
                {({ isActive }) =>
                  isActive ? (
                    <IconBookmarkFilled size={20} />
                  ) : (
                    <IconBookmark size={20} />
                  )
                }
              </NavLink>
            </li>

            {/* Updates / Notifications Toggle (Not a page navigation) */}
            <li>
              <button
                title="Updates"
                className={`side-nav-btn ${showNotificationTab ? "nav-btn-active" : ""}`}
                onClick={() => setShowNotificationTab((prev) => !prev)}
              >
                {showNotificationTab ? (
                  <IconBellFilled size={20} />
                ) : (
                  <IconBell size={20} />
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Settings */}
        <div className="side-nav-last">
          <NavLink
            to="/settings"
            title="Settings"
            className={getNavClass}
            onClick={() => setShowNotificationTab(false)}
          >
            {({ isActive }) =>
              isActive ? (
                <IconSettingsFilled size={20} />
              ) : (
                <IconSettings size={20} />
              )
            }
          </NavLink>
        </div>
      </nav>

      {/* Notifications Drawer */}
      {showNotificationTab && (
        <aside className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button
              className="close-panel-btn"
              onClick={() => setShowNotificationTab(false)}
            >
              <IconX size={22} />
            </button>
          </div>
          <div className="notifications-content">
            <p className="notification-item">You have no new updates.</p>
          </div>
        </aside>
      )}
    </div>
  );
}
