import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  IconChecks,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import "./SideNavBar.css";
import logo from "../../../assets/icons/logo.svg";
import {
  acceptFollowRequest,
  clearNotifications,
  declineFollowRequest,
  getCommentById,
  getCurrentUser,
  getNotificationsByUserId,
  getUserById,
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification,
} from "../../../mocks/api";
import { NOTIFICATION_TYPE } from "../../../mocks/data/notifications";
import { timeFormatter } from "../../../utils/timeFormatter";
import defaultProfileImage from "../../../assets/default_profile.jpg";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useMockData } from "../../../hooks/useMockData";
import ConfirmDialog from "../../ui/ConfirmDialog/ConfirmDialog";

const formatNotificationMessage = (notif) => {
  const actor = getUserById(notif.actorId);
  const actorName = actor ? `${actor.firstName} ${actor.lastName}` : "Someone";

  switch (notif.type) {
    case NOTIFICATION_TYPE.FOLLOW:
      return `${actorName} started following you.`;
    case NOTIFICATION_TYPE.FOLLOW_REQUEST:
      return `${actorName} sent you a follow request.`;
    case NOTIFICATION_TYPE.FOLLOW_ACCEPT:
      return `${actorName} accepted your follow request.`;
    case NOTIFICATION_TYPE.POST_LIKE:
      return `${actorName} liked your post.`;
    case NOTIFICATION_TYPE.COMMENT_LIKE:
      return `${actorName} liked your comment.`;
    case NOTIFICATION_TYPE.COMMENT:
      return `${actorName} commented on your post.`;
    case NOTIFICATION_TYPE.BOOKMARK:
      return `${actorName} bookmarked your post.`;
    default:
      return `${actorName} interacted with your content.`;
  }
};

export default function SideNavBar() {
  useMockData();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showNotificationTab, setShowNotificationTab] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const closeTimerRef = useRef(null);
  const bellBtnRef = useRef(null);
  const panelRef = useRef(null);

  const items = user ? getNotificationsByUserId(user.id) : [];
  const pendingRequests = user?.pendingFollowRequests || [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  const closeNotifications = () => {
    if (closeTimerRef.current || !showNotificationTab) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setShowNotificationTab(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 280);
  };

  const toggleNotifications = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (showNotificationTab && !isClosing) {
      closeNotifications();
    } else {
      setIsClosing(false);
      setShowNotificationTab(true);
    }
  };

  const markAllRead = () => {
    if (user) markAllNotificationsRead(user.id);
  };

  const removeItem = (e, id) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const clearAll = () => {
    if (user) clearNotifications(user.id);
    setIsClearConfirmOpen(false);
  };

  const handleAcceptRequest = (e, requesterId) => {
    e.stopPropagation();
    if (user) acceptFollowRequest(user.id, requesterId);
  };

  const handleDeclineRequest = (e, requesterId) => {
    e.stopPropagation();
    if (user) declineFollowRequest(user.id, requesterId);
  };

  const handleOpenItem = (notif) => {
    markNotificationRead(notif.id);

    if (notif.targetType === "post" && notif.targetId) {
      closeNotifications();
      navigate(`/post/${notif.targetId}`);
    } else if (notif.targetType === "comment" && notif.targetId) {
      const comment = getCommentById(notif.targetId);
      if (comment?.postId) {
        closeNotifications();
        navigate(`/post/${comment.postId}`);
      }
    } else if (notif.targetType === "user") {
      const actor = getUserById(notif.actorId);
      if (actor?.username) {
        closeNotifications();
        navigate(`/user/${actor.username}`);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  useClickOutside(panelRef, closeNotifications, bellBtnRef);

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
                onClick={closeNotifications}
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
                onClick={closeNotifications}
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
                onClick={closeNotifications}
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
                onClick={closeNotifications}
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
                onClick={toggleNotifications}
                ref={bellBtnRef}
              >
                {showNotificationTab && !isClosing ? (
                  <IconBellFilled size={20} />
                ) : (
                  <IconBell size={20} />
                )}
                {unreadCount > 0 && (
                  <span className="side-nav-badge">{unreadCount}</span>
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
            onClick={closeNotifications}
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
        <aside
          className={`notifications-panel ${
            isClosing ? "panel-closing" : "panel-open"
          }`}
          ref={panelRef}
        >
          <div className="notifications-actions">
            <div className="notifications-actions-left">
              {(items.length > 0 || pendingRequests.length > 0) && (
                <>
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                  >
                    <IconChecks size={16} />
                    Mark all as read
                  </button>
                  <button
                    type="button"
                    className="notifications-action-danger"
                    onClick={() => setIsClearConfirmOpen(true)}
                  >
                    <IconTrash size={16} />
                    Clear all
                  </button>
                </>
              )}
            </div>
            <button
              type="button"
              className="close-panel-btn"
              onClick={closeNotifications}
              aria-label="Close notifications"
              title="Close"
            >
              <IconX size={20} />
            </button>
          </div>

          <div className="notifications-content">
            {pendingRequests.length > 0 && (
              <div className="follow-requests-section">
                <h4 className="follow-requests-title">Follow requests</h4>
                {pendingRequests.map((requesterId) => {
                  const requester = getUserById(requesterId);
                  if (!requester) return null;
                  return (
                    <div key={`req_${requesterId}`} className="notification-item">
                      <img
                        src={requester.avatarUrl || defaultProfileImage}
                        alt={requester.username || "User"}
                        onError={(e) => {
                          e.currentTarget.src = defaultProfileImage;
                        }}
                      />
                      <div className="notification-item-body">
                        <p className="notification-item-message">
                          {`${requester.firstName} ${requester.lastName} wants to follow you.`}
                        </p>
                        <div className="follow-request-actions">
                          <button
                            type="button"
                            className="follow-request-accept"
                            onClick={(e) => handleAcceptRequest(e, requesterId)}
                            aria-label="Accept follow request"
                            title="Accept"
                          >
                            <IconCheck size={16} stroke={2.5} />
                            Accept
                          </button>
                          <button
                            type="button"
                            className="follow-request-decline"
                            onClick={(e) => handleDeclineRequest(e, requesterId)}
                            aria-label="Decline follow request"
                            title="Decline"
                          >
                            <IconX size={16} stroke={2.5} />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {items.length === 0 && pendingRequests.length === 0 ? (
              <p className="notification-empty">You have no new updates.</p>
            ) : (
              items.map((notif) => {
                const actor = getUserById(notif.actorId);
                return (
                  <div
                    key={notif.id}
                    className={`notification-item ${
                      notif.isRead ? "" : "notification-item-unread"
                    }`}
                    onClick={() => handleOpenItem(notif)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOpenItem(notif);
                      }
                    }}
                  >
                    <img
                      src={actor?.avatarUrl || defaultProfileImage}
                      alt={actor?.username || "User"}
                      onError={(e) => {
                        e.currentTarget.src = defaultProfileImage;
                      }}
                    />
                    <div className="notification-item-body">
                      <p className="notification-item-message">
                        {formatNotificationMessage(notif)}
                      </p>
                      <span className="notification-item-time">
                        {timeFormatter(notif.createdAt)}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <span className="notification-item-dot" />
                    )}
                    <button
                      type="button"
                      className="notification-item-remove"
                      onClick={(e) => removeItem(e, notif.id)}
                      aria-label="Remove notification"
                      title="Remove"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      <ConfirmDialog
        open={isClearConfirmOpen}
        title="Clear all notifications?"
        message="This will remove every notification from your list. This action cannot be undone."
        confirmLabel="Clear all"
        danger
        onConfirm={clearAll}
        onClose={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
}
