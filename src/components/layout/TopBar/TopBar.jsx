import "./TopBar.css";
import {
  IconChevronDown,
  IconLogout,
  IconSearch,
  IconSettingsFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../mocks/api";


const user = getCurrentUser()

function TopAccountPopUP({ onLogout, onClose }) {
  return (
    <div className="topbar-account-popup">
      <p>Logged in as</p>
      <div className="top-popup-account-container">
        <img src={user.avatarUrl} alt="Profile image" />
        <div className="top-popup-account-texts">
          <h4>{`${user.firstName} ${user.lastName}`}</h4>
          <p>{`${user.visibility}`}</p>
          <p>{`${user.email}`}</p>
        </div>
      </div>
      <div className="topbar-popup-profile-settings">
        <NavLink
          to="/profile"
          className="topbar-settings-nav"
          onClick={onClose}
        >
          <IconUserFilled />
          View profile
        </NavLink>
        <NavLink to="/settings" className="topbar-settings-nav" onClick={onClose}>
          <IconSettingsFilled />
          Account settings
        </NavLink>

        <button type="button" className="topbar-popup-logout" onClick={onLogout}>
          <IconLogout />
          Log out
        </button>
      </div>
    </div>
  );
}

export default function TopBar() {
  const navigate = useNavigate();
  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const popupRef = useRef(null);

  useClickOutside(popupRef, () => {
    setIsPopUpActive(false);
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/explore?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/explore");
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="topbar-div">
      <form className="topbar-search-container" onSubmit={handleSearch}>
        <IconSearch className="search-icon" color="#38383a" size={25} />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="topbar-profile-container" ref={popupRef}>
        <Link
          to="/profile"
          title="Profile"
          onClick={() => setIsPopUpActive(false)}
        >
          <img title="Your profile" src={user.avatarUrl} alt="profile-img" />
        </Link>

        <button
          type="button"
          title="Account"
          className={
            isPopUpActive
              ? "topbar-profile-btn topbar-profile-btn-active"
              : "topbar-profile-btn"
          }
          onClick={() => {
            setIsPopUpActive((prev) => !prev);
          }}
        >
          <IconChevronDown color="white" size={25} />
        </button>

        {isPopUpActive && (
          <TopAccountPopUP
            onLogout={handleLogout}
            onClose={() => setIsPopUpActive(false)}
          />
        )}
      </div>
    </div>
  );
}
