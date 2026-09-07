import "./Profile.css";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {  users } from "../../mocks/data/users";
import { countFormatter } from "../../utils/countFormatter";
import { IconDots, IconDotsVertical } from "@tabler/icons-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { getCurrentUser } from "../../mocks/api";
export default function Profile() {
  const currentUser = getCurrentUser()
  const { username } = useParams();
  const displayUser = username
    ? users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ||
      currentUser
    : currentUser;

  const isOwnProfile = currentUser?.username === displayUser?.username;
  const isPrivate =
    displayUser?.visibility === "private" &&
    !isOwnProfile &&
    !displayUser?.isFollowing;
  const [activeButton, setActiveButton] = useState("left");
  const [isActionsPopupActive, setIsActionsPopupActive] = useState(false);
  const morePopupBtnRef = useRef(null);
  const morePopupRef = useRef(null);

  useClickOutside(
    morePopupRef,
    () => {
      setIsActionsPopupActive(false);
    },
    morePopupBtnRef
  );

  if (isPrivate) {
    return <h1>This account is private.</h1>;
  }

  return (
    <main className="profile-page">
      <div className="profile-page-card">
        <div className="profile-page-section-wrapper">
          <div className="profile-page-avatar-container">
            <img
              className="profile-page-user-avatar-image"
              src={displayUser.avatar}
              alt={`${displayUser.username}'s avatar`}
            />

            <div className="profile-page-card-info">
              <span className="profile-page-card-username">
                {`${displayUser.firstName} ${displayUser.lastName}`}
              </span>
              <span className="profile-page-card-handle">{`@${displayUser.username}`}</span>

              <div className="profile-card-follow">
                <button>
                  <span className="profile-followers-count">
                    {countFormatter(displayUser.followersCount)}
                  </span>{" "}
                  <p className="profile-page-follow-text">Followers</p>
                </button>
                <span className="dot"></span>
                <button>
                  <span className="profile-following-count">
                    {countFormatter(displayUser.followingCount)}
                  </span>{" "}
                  <p className="profile-page-follow-text">Following</p>
                </button>
              </div>
            </div>
          </div>

          <div className="profile-page-more-wrapper">
            <button
              className="profile-page-more-btn"
              onClick={() => setIsActionsPopupActive((prev) => !prev)}
              ref={morePopupBtnRef}
            >
              <IconDots className="profile-page-dots-horizontal" />
              <IconDotsVertical className="profile-page-dots-vertical" />
            </button>

            {isActionsPopupActive && (
              <div className="profile-page-actions-popup" ref={morePopupRef}>
                <p>Profile actions</p>
                <button>Block</button>
                <button>Report</button>
              </div>
            )}
          </div>
        </div>
        <p className="profile-page-card-bio">{displayUser.bio}</p>

        <div className="profile-follow-actions">
          <button>Follow</button>
          <button className="profile-follow-actions-share-btn">
            Share profile
          </button>
        </div>
      </div>

      <div className="profile-page-navigation">
        <button
          className={activeButton === "left" ? "profile-btn-active" : ""}
          onClick={() => setActiveButton("left")}
        >
          Created
        </button>
        <button
          className={activeButton === "right" ? "profile-btn-active" : ""}
          onClick={() => setActiveButton("right")}
        >
          Saved
        </button>
      </div>
    </main>
  );
}
