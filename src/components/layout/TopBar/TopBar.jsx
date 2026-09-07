import "./TopBar.css";
import {
  IconChevronDown,
  IconLogout,
  IconSearch,
  IconSettingsFilled,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { Link, NavLink } from "react-router-dom";
import { getCurrentUser } from "../../../mocks/api";


const user = getCurrentUser()

function TopAccountPopUP() {
  return (
    <div className="topbar-account-popup">
      <p>Logged in as</p>
      <div className="top-popup-account-container">
        <img src={user.avatar} alt="Profile image" />
        <div className="top-popup-account-texts">
          <h4>{`${user.firstName} ${user.lastName}`}</h4>
          <p>{`${user.visibility}`}</p>
          <p>{`${user.email}`}</p>
        </div>
      </div>
      <div className="topbar-popup-profile-settings">
        {/* <button type="button">
          <IconUserFilled />
          View profile
        </button> */}
        <NavLink to="/settings" className="topbar-settings-nav">
          <IconSettingsFilled />
          Account settings
        </NavLink>

        <button type="button" className="topbar-popup-logout">
          <IconLogout />
          Log out
        </button>
      </div>
    </div>
  );
}

export default function TopBar() {
  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const popupRef = useRef(null);

  useClickOutside(popupRef, () => {
    setIsPopUpActive(false);
  });

  return (
    <div className="topbar-div">
      <div className="topbar-search-container">
        <IconSearch className="search-icon" color="#38383a" size={25} />
        <input type="text" placeholder="Search" />
      </div>

      <div className="topbar-profile-container" ref={popupRef}>
        <Link to="/profile" title="Profile">
          <img title="Your profile" src={user.avatar} alt="profile-img" />
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

        {isPopUpActive && <TopAccountPopUP />}
      </div>
    </div>
  );
}
