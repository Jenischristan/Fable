import "./Profile.css";
import { useRef, useState, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
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
  getUserById,
  getUserByUsername,
  isFollowedBy,
  isPostSavedBy,
  togglePostSaved,
} from "../../mocks/api";
import { Masonry } from "masonic";
import Toast from "../../components/ui/Toast/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { REPORT_REASONS } from "../../utils/reportReasons";
import Modal from "../../components/ui/Modal/Modal";
import {
  downloadImage,
  shareContent,
  shareMessageFor,
} from "../../utils/shareActions";
import defaultProfileImage from "../../assets/default_profile.jpg";

function MorePopUp({ position, ignoreRef, handler, onDownload, onReport }) {
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
      <button onClick={onDownload}>
        <IconDownload />
        Download image
      </button>
      <button onClick={onReport}>
        <IconFlag />
        Report image
      </button>
    </div>
  );
}

const PostCard = React.memo(function PostCard({ data: post, onToast, onReport }) {
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

  const closePopUp = () => setIsPopUpActive(false);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = togglePostSaved(user?.id, post.id);
    setIsSaved(nowSaved);
    onToast?.(nowSaved ? "Saved to bookmarks." : "Removed from bookmarks.");
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await shareContent({
      title: post.title,
      text: post.description,
      url: `${window.location.origin}/post/${post.id}`,
    });
    const msg = shareMessageFor(result);
    if (msg) onToast?.(msg);
  };

  const handleDownload = async () => {
    closePopUp();
    const ok = await downloadImage(
      post.imageUrl,
      `${(post.title || "post").replace(/\s+/g, "-").toLowerCase()}.jpg`,
    );
    onToast?.(ok ? "Download started." : "Opened image in a new tab.");
  };

  const handleReport = () => {
    closePopUp();
    onReport?.(post);
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
              <button
                type="button"
                className="home-masonry-item-share"
                aria-label="Share"
                onClick={handleShare}
              >
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
          handler={closePopUp}
          onDownload={handleDownload}
          onReport={handleReport}
        />
      )}
    </div>
  );
});

export default function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { username, tab } = useParams();
  const targetUsername = username || user?.username;
  const displayUser = username ? getUserByUsername(username) : user;

  const [isActionsPopupActive, setIsActionsPopupActive] = useState(false);
  const activeTab = tab === "saved" ? "saved" : "created";
  const morePopupBtnRef = useRef(null);
  const morePopupRef = useRef(null);
  const sectionRef = useRef(null);

  const [sectionWidth, setSectionWidth] = useState(() => window.innerWidth);
  const [isFollowing, setIsFollowing] = useState(() =>
    user && displayUser ? isFollowedBy(user.id, displayUser.id) : false,
  );
  const [prevDisplayUserId, setPrevDisplayUserId] = useState(
    displayUser?.id ?? null,
  );
  const [toastMessage, setToastMessage] = useState("");
  const [dialog, setDialog] = useState(null);
  const [listModal, setListModal] = useState(null);

  if (displayUser?.id !== prevDisplayUserId) {
    setPrevDisplayUserId(displayUser?.id ?? null);
    setIsFollowing(
      user && displayUser ? isFollowedBy(user.id, displayUser.id) : false,
    );
    setDialog(null);
    setListModal(null);
    setIsActionsPopupActive(false);
  }

  const handlePostToast = (msg) => setToastMessage(msg);
  const handlePostReport = (post) => setDialog({ type: "report-post", post });

  const closeActionsPopup = () => setIsActionsPopupActive(false);

  const openUserList = (kind) => {
    closeActionsPopup();
    const ids =
      kind === "followers"
        ? displayUser?.followerList || []
        : displayUser?.followingList || [];
    setListModal({
      kind,
      title: kind === "followers" ? "Followers" : "Following",
      users: ids.map((id) => getUserById(id)).filter(Boolean),
    });
  };

  const handleFollowClick = () => {
    if (isFollowing) {
      setDialog({ type: "unfollow" });
    } else {
      setIsFollowing(true);
      setToastMessage(`Following @${displayUser.username}.`);
    }
  };

  const handleSendRequest = () => {
    setDialog({ type: "follow-request" });
  };

  const handleShareProfile = async () => {
    const result = await shareContent({
      title: `${displayUser.firstName} ${displayUser.lastName}`,
      text: `Check out @${displayUser.username}'s profile`,
      url: `${window.location.origin}/user/${displayUser.username}`,
    });
    const msg = shareMessageFor(result);
    if (msg) setToastMessage(msg);
  };

  const handleBlock = () => {
    closeActionsPopup();
    setDialog({ type: "block" });
  };

  const handleReportProfile = () => {
    closeActionsPopup();
    setDialog({ type: "report-profile" });
  };

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
    return (
      <main className="profile-page">
        <div className="profile-not-found">
          <p>User not found.</p>
        </div>
      </main>
    );
  }

  const isOwnProfile = user?.username === displayUser?.username;
  const isPrivate =
    displayUser?.visibility === "private" && !isOwnProfile && !isFollowing;
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
                <button type="button" onClick={() => openUserList("followers")}>
                  <span className="profile-followers-count">
                    {countFormatter(displayUser.followersCount)}
                  </span>{" "}
                  <p className="profile-page-follow-text">Followers</p>
                </button>
                <span className="dot" />
                <button type="button" onClick={() => openUserList("following")}>
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
                {isOwnProfile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        closeActionsPopup();
                        handleShareProfile();
                      }}
                    >
                      Share profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeActionsPopup();
                        navigate("/settings");
                      }}
                    >
                      Account settings
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={handleBlock}>Block</button>
                    <button type="button" onClick={handleReportProfile}>Report</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="profile-page-card-bio">{displayUser.bio}</p>

        <div className="profile-follow-actions">
          {isOwnProfile ? null : isFollowing ? (
            <button type="button" onClick={handleFollowClick}>
              UnFollow
            </button>
          ) : isPrivate ? (
            <button type="button" onClick={handleSendRequest}>
              Send Request
            </button>
          ) : (
            <button type="button" onClick={handleFollowClick}>
              Follow
            </button>
          )}

          <button
            type="button"
            className="profile-follow-actions-share-btn"
            onClick={handleShareProfile}
          >
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
          render={(props) => (
            <PostCard
              {...props}
              onToast={handlePostToast}
              onReport={handlePostReport}
            />
          )}
          itemKey={(data, index) => data?.id ?? index}
          columnGutter={columnGutter}
          columnWidth={computedColumnWidth}
          maxColumnCount={targetColumns}
        />
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      <ConfirmDialog
        open={dialog?.type === "unfollow"}
        title={`Unfollow @${displayUser.username}?`}
        message={`${displayUser.firstName} won't be notified, and their posts will stop appearing in your feed. You can follow again anytime.`}
        confirmLabel="Unfollow"
        danger
        onConfirm={() => {
          setIsFollowing(false);
          setToastMessage(`Unfollowed @${displayUser.username}.`);
        }}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "follow-request"}
        title="Send follow request?"
        message={`@${displayUser.username} has a private profile. They'll need to approve your request before you can see their posts.`}
        confirmLabel="Send request"
        onConfirm={() =>
          setToastMessage(`Follow request sent to @${displayUser.username}.`)
        }
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "block"}
        title={`Block @${displayUser.username}?`}
        message="They won't be able to follow you, message you, or see your posts. They won't be notified."
        confirmLabel="Block"
        danger
        onConfirm={() =>
          setToastMessage(`Blocked @${displayUser.username}.`)
        }
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "report-profile"}
        title={`Report @${displayUser.username}?`}
        message="Why are you reporting this profile? Your report is anonymous."
        options={REPORT_REASONS}
        confirmLabel="Submit report"
        onConfirm={() => setToastMessage("Report submitted. Thank you.")}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "report-post"}
        title="Report this image?"
        message="Why are you reporting this? Your report is anonymous."
        options={REPORT_REASONS}
        confirmLabel="Submit report"
        onConfirm={() => setToastMessage("Report submitted. Thank you.")}
        onClose={() => setDialog(null)}
      />

      <Modal
        open={!!listModal}
        onClose={() => setListModal(null)}
        title={listModal?.title || ""}
      >
        {listModal && listModal.users.length === 0 ? (
          <p className="profile-user-list-empty">No users to show yet.</p>
        ) : (
          <div className="profile-user-list">
            {listModal?.users.map((u) => (
              <button
                key={u.id}
                type="button"
                className="profile-user-list-item"
                onClick={() => {
                  setListModal(null);
                  navigate(
                    u.username === user?.username
                      ? "/profile"
                      : `/user/${u.username}`,
                  );
                }}
              >
                <img
                  src={u.avatarUrl || defaultProfileImage}
                  alt={`${u.username}'s avatar`}
                  onError={(e) => {
                    e.currentTarget.src = defaultProfileImage;
                  }}
                />
                <div className="profile-user-list-info">
                  <span className="profile-user-list-name">
                    {u.firstName} {u.lastName}
                  </span>
                  <span className="profile-user-list-handle">
                    @{u.username}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </main>
  );
}
