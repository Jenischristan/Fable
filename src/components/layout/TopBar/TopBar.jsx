import "./TopBar.css";
import {
  IconChevronDown,
  IconHash,
  IconLogout,
  IconPhoto,
  IconSearch,
  IconSettingsFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  logout,
  searchPosts,
  searchTags,
  searchUsers,
} from "../../../mocks/api";
import { useMockData } from "../../../hooks/useMockData";
import { countFormatter } from "../../../utils/countFormatter";

function TopAccountPopUP({ user, onLogout, onClose }) {
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
  useMockData();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const urlQuery = new URLSearchParams(location.search).get("q") || "";
  const [searchDraft, setSearchDraft] = useState(null);
  const [prevSearch, setPrevSearch] = useState(location.search);
  if (prevSearch !== location.search) {
    setPrevSearch(location.search);
    setSearchDraft(null);
  }
  const searchQuery = searchDraft ?? urlQuery;
  const popupRef = useRef(null);
  const searchContainerRef = useRef(null);

  useClickOutside(popupRef, () => {
    setIsPopUpActive(false);
  });

  useClickOutside(searchContainerRef, () => {
    setIsSearchOpen(false);
  });

  const trimmedQuery = searchQuery.trim();
  const matchingTopics = trimmedQuery ? searchTags(trimmedQuery, 3) : [];
  const matchingUsers = trimmedQuery ? searchUsers(trimmedQuery, 3) : [];
  const matchingPosts = trimmedQuery ? searchPosts(trimmedQuery).slice(0, 3) : [];
  const hasDropdownResults =
    matchingTopics.length > 0 || matchingUsers.length > 0 || matchingPosts.length > 0;

  const handleSearch = (e) => {
    e?.preventDefault();
    setIsSearchOpen(false);
    const q = searchQuery.trim();
    if (q) {
      navigate(`/explore?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/explore");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="topbar-div">
      <form
        className="topbar-search-container"
        ref={searchContainerRef}
        onSubmit={handleSearch}
      >
        <IconSearch className="search-icon" color="#38383a" size={25} />
        <input
          type="text"
          placeholder="Search for posts, topics, users..."
          value={searchQuery}
          onFocus={() => {
            if (trimmedQuery) setIsSearchOpen(true);
          }}
          onChange={(e) => {
            setSearchDraft(e.target.value);
            if (e.target.value.trim()) {
              setIsSearchOpen(true);
            } else {
              setIsSearchOpen(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsSearchOpen(false);
          }}
        />

        {isSearchOpen && trimmedQuery && (
          <div className="topbar-search-dropdown">
            {matchingTopics.length > 0 && (
              <div className="search-dropdown-group">
                <div className="search-dropdown-label">
                  <IconHash size={15} /> Topics
                </div>
                {matchingTopics.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="search-dropdown-item"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchDraft(tag.name);
                      navigate(`/explore?q=${encodeURIComponent(tag.name)}`);
                    }}
                  >
                    <span className="search-topic-tag">#{tag.name}</span>
                    <span className="search-item-meta">
                      {countFormatter(tag.postsCount)} posts
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchingUsers.length > 0 && (
              <div className="search-dropdown-group">
                <div className="search-dropdown-label">
                  <IconUserFilled size={15} /> Users
                </div>
                {matchingUsers.map((u) => (
                  <NavLink
                    key={u.id}
                    to={`/user/${u.username}`}
                    className="search-dropdown-item"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.username}
                      className="search-user-avatar"
                    />
                    <div className="search-user-text">
                      <span className="search-user-name">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="search-user-handle">@{u.username}</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}

            {matchingPosts.length > 0 && (
              <div className="search-dropdown-group">
                <div className="search-dropdown-label">
                  <IconPhoto size={15} /> Posts
                </div>
                {matchingPosts.map((post) => (
                  <NavLink
                    key={post.id}
                    to={`/post/${post.id}`}
                    state={{ post }}
                    className="search-dropdown-item"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="search-post-thumb"
                    />
                    <div className="search-post-text">
                      <span className="search-post-title">
                        {post.title || "Untitled Post"}
                      </span>
                      <span className="search-item-meta">
                        {post.tags?.slice(0, 2).map((t) => `#${t}`).join(" ")}
                      </span>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}

            {hasDropdownResults ? (
              <button
                type="submit"
                className="search-dropdown-all-btn"
                onClick={handleSearch}
              >
                <IconSearch size={16} />
                <span>View all results for "{trimmedQuery}"</span>
              </button>
            ) : (
              <div className="search-dropdown-empty">
                <p>No quick suggestions for "{trimmedQuery}".</p>
                <span>Press Enter to explore all matching content.</span>
              </div>
            )}
          </div>
        )}
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
            user={user}
            onLogout={handleLogout}
            onClose={() => setIsPopUpActive(false)}
          />
        )}
      </div>
    </div>
  );
}
