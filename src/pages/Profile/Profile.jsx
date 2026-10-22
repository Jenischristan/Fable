import "./Profile.css";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
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
import { useMockData } from "../../hooks/useMockData";
import {
  blockUser,
  getCreatedPostsById,
  getCurrentUser,
  getSavedPostsById,
  getUserById,
  getUserByUsername,
  hasPendingFollowRequest,
  isFollowedBy,
  isPostSavedBy,
  setFollowUser,
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
import { isImageCached, markImageCached } from "../../utils/imageCache";

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
    isPostSavedBy(user?.id, post?.id),
  );
  const isCached = isImageCached(post?.imageUrl);
  const [isImageLoaded, setIsImageLoaded] = useState(isCached);
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
    markImageCached(post?.imageUrl);
    setIsLandscape(e.target.naturalWidth > e.target.naturalHeight);
    setIsImageLoaded(true);
  };

  const ratio = post.aspectRatio || 0.75;

  return (
    <div className="home-masonry-item">
      <NavLink
        to={`/post/${post.id}`}
        state={{ post }}
        className="home-card-link"
        style={{ aspectRatio: ratio }}
      >
        {!isImageLoaded && <div className="home-image-skeleton" />}

        <img
          src={post.imageUrl}
          alt={post.description || post.title || "Post"}
          decoding="async"
          onLoad={handleImageLoading}
          className={`home-card-img ${isImageLoaded ? "is-loaded" : "is-loading"}`}
          ref={(imgEl) => {
            if (imgEl && imgEl.complete && imgEl.naturalWidth > 0 && !isImageLoaded) {
              markImageCached(post?.imageUrl);
              setIsLandscape(imgEl.naturalWidth > imgEl.naturalHeight);
              setIsImageLoaded(true);
            }
          }}
        />

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
      </NavLink>

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
  const storeVersion = useMockData();
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
  const [toastMessage, setToastMessage] = useState("");
  const [dialog, setDialog] = useState(null);
  const [listModal, setListModal] = useState(null);

  const isOwnProfile = Boolean(
    user && displayUser && user.username === displayUser.username,
  );
  const isFollowing =
    user && displayUser ? isFollowedBy(user.id, displayUser.id) : false;
  const hasPendingRequest =
    user && displayUser ? hasPendingFollowRequest(user.id, displayUser.id) : false;
  const isPrivate = Boolean(
    displayUser?.visibility === "private" && !isOwnProfile && !isFollowing,
  );

  const handlePostToast = useCallback((msg) => setToastMessage(msg), [setToastMessage]);
  const handlePostReport = useCallback((post) => setDialog({ type: "report-post", post }), [setDialog]);

  const renderItem = useCallback(
    (props) => (
      <PostCard
        {...props}
        onToast={handlePostToast}
        onReport={handlePostReport}
      />
    ),
    [handlePostToast, handlePostReport],
  );

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
    } else if (isPrivate) {
      setDialog({ type: "follow-request" });
    } else if (user && displayUser) {
      setFollowUser(user.id, displayUser.id, true);
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

    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const padLeft = parseFloat(style.paddingLeft) || 0;
      const padRight = parseFloat(style.paddingRight) || 0;
      const contentWidth = el.clientWidth - padLeft - padRight;
      if (contentWidth > 0) setSectionWidth(contentWidth);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useClickOutside(
    morePopupRef,
    () => setIsActionsPopupActive(false),
    morePopupBtnRef,
  );

  const postsToDisplay = useMemo(() => {
    if (!displayUser?.id) return [];
    const rawPosts =
      activeTab === "created"
        ? getCreatedPostsById(displayUser.id)
        : getSavedPostsById(displayUser.id);
    return (Array.isArray(rawPosts) ? rawPosts : []).filter(
      (post) => post && typeof post === "object",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, displayUser?.id, storeVersion]);

  if (!displayUser) {
    return (
      <main className="profile-page">
        <div className="profile-not-found">
          <p>User not found.</p>
        </div>
      </main>
    );
  }


  let targetColumns = 4;
  if (sectionWidth < 768) {
    targetColumns = 2;
  } else if (sectionWidth <= 1024) {
    targetColumns = 3;
  } else if (sectionWidth > 1400) {
    targetColumns = 5;
  }
  targetColumns = Math.min(5, Math.max(2, targetColumns));

  const columnGutter = 16;
  const computedColumnWidth = Math.max(
    80,
    Math.floor(
      (sectionWidth - (targetColumns - 1) * columnGutter) / targetColumns,
    ) - 6,
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
          ) : hasPendingRequest ? (
            <button type="button" disabled className="profile-follow-actions-pending">
              Request Sent
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
          render={renderItem}
          itemKey={(data, index) => data?.id ?? index}
          columnGutter={columnGutter}
          columnWidth={computedColumnWidth}
          columnCount={targetColumns}
          maxColumnCount={5}
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
          if (user && displayUser) setFollowUser(user.id, displayUser.id, false);
          setToastMessage(`Unfollowed @${displayUser.username}.`);
        }}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "follow-request"}
        title="Send follow request?"
        message={`@${displayUser.username} has a private profile. They'll need to approve your request before you can see their posts.`}
        confirmLabel="Send request"
        onConfirm={() => {
          if (user && displayUser) setFollowUser(user.id, displayUser.id, true);
          setToastMessage(`Follow request sent to @${displayUser.username}.`);
        }}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "block"}
        title={`Block @${displayUser.username}?`}
        message="They won't be able to follow you, message you, or see your posts. They won't be notified."
        confirmLabel="Block"
        danger
        onConfirm={() => {
          if (user && displayUser) blockUser(user.id, displayUser.id);
          setToastMessage(`Blocked @${displayUser.username}.`);
          navigate("/home");
        }}
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
