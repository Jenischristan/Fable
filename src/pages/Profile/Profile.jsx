import "./Profile.css";
import { useRef, useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { countFormatter } from "../../utils/countFormatter";
import React from "react";
import {
  IconDots,
  IconDotsVertical,
  IconDownload,
  IconFlag,
  IconShare3,
} from "@tabler/icons-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import {
  getCreatedPostsById,
  getCurrentUser,
  getSavedPostsById,
  getUserByUsername,
  isFollowedBy,
  isPostSavedBy,
} from "../../mocks/api";
import { Masonry } from "masonic";

function MorePopUp({ position, ignoreRef, handler }) {
  const popUpRef = useRef(null);
  useClickOutside(popUpRef, handler, ignoreRef);
  const handlePopUpClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div
      className="home-more-popup"
      onClick={handlePopUpClick}
      style={{
        top: position.top,
        left: position.left,
      }}
      ref={popUpRef}
    >
      <button>
        <IconDownload />
        Download image
      </button>
      <button>
        <IconFlag />
        Report image
      </button>
    </div>
  );
}

const PostCard = React.memo(function PostCard({ data: post }) {
  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const user = getCurrentUser();
  const btnRef = useRef(null);

  const [popUpPos, setPopUpPos] = useState({
    top: 0,
    left: 0,
  });

  const [isSaved, setIsSaved] = useState(() =>
    isPostSavedBy(user?.id, post.id),
  );
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const calculatePopUpPos = () => {
    if (!btnRef.current) return null;
    const rect = btnRef.current.getBoundingClientRect();
    const popupWidth = 230;
    const popupHeight = 150;
    const spacing = 8;
    const padding = 8;

    const buttonCenterX = rect.left + rect.width / 2;
    let left = buttonCenterX - popupWidth / 2;

    let top = rect.bottom + spacing;
    if (top + popupHeight > window.innerHeight - padding) {
      top = rect.top - popupHeight - spacing;
    }

    top = Math.max(padding, top);

    if (left < padding) {
      left = padding;
    } else if (left + popupWidth > window.innerWidth - padding) {
      left = window.innerWidth - popupWidth - padding;
    }

    return { top, left };
  };

  useEffect(() => {
    if (!isPopUpActive) return;

    let ticking = false;

    const updatePosition = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();

        const isOutOfView =
          rect.bottom < 0 ||
          rect.top > window.innerHeight ||
          rect.right < 0 ||
          rect.left > window.innerWidth;

        if (isOutOfView) {
          setIsPopUpActive(false);
          return;
        }

        const pos = calculatePopUpPos();
        if (pos) setPopUpPos(pos);
      });
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isPopUpActive]);

  if (!post) return null;

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(true);
  };

  const handleMore = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (btnRef.current && !isPopUpActive) {
      const pos = calculatePopUpPos();
      if (pos) setPopUpPos(pos);
    }
    setIsPopUpActive((prev) => !prev);
  };

  const handleImageLoading = (e) => {
    setIsLandscape(e.target.naturalWidth > e.target.naturalHeight);
    setIsImageLoaded(true);
  };

  return (
    <div className="home-masonry-item">
      <NavLink to={`/post/${post.id}`} state={{ post }}>
        {!isImageLoaded && (
          <div
            className="home-image-skeleton"
            style={{
              aspectRatio: post.aspectRatio || "16/9",
            }}
          />
        )}

        <img
          src={post.imageUrl}
          alt={post.description || "Post"}
          loading="lazy"
          onLoad={handleImageLoading}
        />
      </NavLink>
      {isImageLoaded && (
        <>
          <div className="home-masonry-item-overlay">
            <button
              type="button"
              onClick={handleSave}
              className="home-overlay-save-btn"
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            {!isLandscape && (
              <button className="home-masonry-item-share">
                <IconShare3 />
              </button>
            )}
          </div>

          <div className="home-masonry-item-bottom">
            <button
              type="button"
              ref={btnRef}
              className="home-masonry-item-bottom-button"
              title="More actions"
              onClick={handleMore}
            >
              <IconDots size={25} />
            </button>
          </div>
        </>
      )}

      {isPopUpActive && (
        <MorePopUp
          position={popUpPos}
          ignoreRef={btnRef}
          handler={() => setIsPopUpActive(false)}
        />
      )}
    </div>
  );
});

export default function Profile() {
  const user = getCurrentUser();
  const { username, tab } = useParams();
  const targetUsername = username || user?.username;
  const displayUser = getUserByUsername(username);

  const [isActionsPopupActive, setIsActionsPopupActive] = useState(false);
  const activeTab = tab === "saved" ? "saved" : "created";
  const morePopupBtnRef = useRef(null);
  const morePopupRef = useRef(null);
  const sectionRef = useRef(null);

  const [sectionWidth, setSectionWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    if (!sectionRef.current) return;

    const initialWidth = sectionRef.current.getBoundingClientRect().width;
    if (initialWidth > 0) {
      setSectionWidth(initialWidth);
    }

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setSectionWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useClickOutside(
    morePopupRef,
    () => setIsActionsPopupActive(false),
    morePopupBtnRef,
  );

  if (!displayUser) {
    return <div>User not found</div>;
  }

  const isFollwingDisplayUser = isFollowedBy(user?.id, displayUser.id);
  const isOwnProfile = user?.username === displayUser?.username;
  const isPrivate =
    displayUser?.visibility === "private" &&
    !isOwnProfile &&
    !isFollwingDisplayUser;
const rawPosts =
    activeTab === "created"
      ? getCreatedPostsById(displayUser.id)
      : getSavedPostsById(displayUser.id);
  const postsToDisplay = (Array.isArray(rawPosts) ? rawPosts : []).filter(
    (post) => post && typeof post === "object",
  );

  let targetColumns = 4;
  if (sectionWidth < 820) {
    targetColumns = 2;
  } else if (sectionWidth <= 1120) {
    targetColumns = 3;
  }

  const columnGutter = 16;
  const computedColumnWidth = Math.max(
    80,
    Math.floor(
      (sectionWidth - (targetColumns - 1) * columnGutter) / targetColumns,
    ),
  );

  return (
    <main className="profile-page">
      <div className="profile-page-card">
        <div className="profile-page-section-wrapper">
          <div className="profile-page-avatar-container">
            <img
              className="profile-page-user-avatar-image"
              src={displayUser.avatarUrl}
              alt={`${displayUser.username}'s avatar`}
            />

            <div className="profile-page-card-info">
              <span className="profile-page-card-username">
                {`${displayUser.firstName} ${displayUser.lastName}`}
              </span>
              <span className="profile-page-card-handle">{`@${displayUser.username}`}</span>

              <div className="profile-card-follow">
                <button type="button">
                  <span className="profile-followers-count">
                    {countFormatter(displayUser.followersCount)}
                  </span>{" "}
                  <p className="profile-page-follow-text">Followers</p>
                </button>
                <span className="dot" />
                <button type="button">
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
              type="button"
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
                <button type="button">Block</button>
                <button type="button">Report</button>
              </div>
            )}
          </div>
        </div>
        <p className="profile-page-card-bio">{displayUser.bio}</p>

        <div className="profile-follow-actions">
          {isFollwingDisplayUser ? (
            <button type="button">UnFollow</button>
          ) : isPrivate ? (
            <button type="button">Send Request</button>
          ) : (
            <button type="button">Follow</button>
          )}

          <button type="button" className="profile-follow-actions-share-btn">
            Share profile
          </button>
        </div>
      </div>

     <div className="profile-page-navigation">
        <NavLink
          to={`/user/${targetUsername}/created`}
          className={({ isActive }) => 
            (isActive || !tab || tab === "created") ? "profile-btn-active" : ""
          }
        >
          Created
        </NavLink>
        <NavLink
          to={`/user/${targetUsername}/saved`}
          className={({ isActive }) => (isActive ? "profile-btn-active" : "")}
        >
          Saved
        </NavLink>
      </div>

      <div className="profile-page-section" ref={sectionRef}>
        <Masonry
          key={`${activeTab}-${targetColumns}`}
          items={postsToDisplay}
          render={PostCard}
          itemKey={(data, index) => data?.id ?? index}
          columnGutter={columnGutter}
          columnWidth={computedColumnWidth}
          maxColumnCount={targetColumns}
        />
      </div>
    </main>
  );
}
