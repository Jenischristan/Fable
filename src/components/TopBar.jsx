import "./TopBar.css";
import profileImage from "../assets/profile.jpg";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";

export default function TopBar() {
  return (
    <div className="topbar-div">
      <div className="topbar-search-container">
        <IconSearch color="#9ca3af" className="search-icon" size={20} />
        <input type="text" placeholder="Search" />
      </div>

      <div className="topbar-profile-container">
        <img title="Your profile" src={profileImage} alt="profile-img" />

        <button title="Account" className="topbar-profile-btn">
          <IconChevronDown color="white" size={20} />
        </button>
      </div>
    </div>
  );
}
