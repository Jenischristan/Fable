import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./PostView.css";
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
  IconDots,
  IconFilter2,
  IconHeart,
  IconHeartFilled,
  IconMaximize,
  IconMessages,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { countFormatter } from "../../utils/countFormatter";
import { timeFormatter } from "../../utils/timeFormatter";
import { useEffect, useMemo, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useMockData } from "../../hooks/useMockData";
import {
  addComment,
  getCurrentUser,
  getUserById,
  getPostById,
  isPostLikedBy,
  isPostSavedBy,
  isFollowedBy,
  getPostCommentsById,
  setFollowUser,
  toggleCommentLiked,
  togglePostLiked,
  togglePostSaved,
} from "../../mocks/api";
import defaultProfileImage from "/src/assets/default_profile.jpg";
import Toast from "../../components/ui/Toast/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { REPORT_REASONS } from "../../utils/reportReasons";
import {
  downloadImage,
  shareContent,
  shareMessageFor,
} from "../../utils/shareActions";

export default function PostView() {
  const storeVersion = useMockData();
  const user = getCurrentUser();
  const location = useLocation();
  const { id } = useParams();
  const post = getPostById(String(id)) || location.state?.post || null;
  const postUploader = post?.authorId ? getUserById(post.authorId) : null;

  const [commentInput, setCommentInput] = useState("");
  const [isSortPopupOn, setIsSortPopupOn] = useState(false);
  const [isImageMaximized, setIsImageMaximized] = useState(false);
  const [isMorePopupOn, setIsMorePopupOn] = useState(false);
  const [moreBtnCenter, setMoreBtnCenter] = useState(0);
  const [popupPlacement, setPopupPlacement] = useState("bottom");
  const [toastMessage, setToastMessage] = useState("");
  const [dialog, setDialog] = useState(null);
  const [sortMode, setSortMode] = useState("default");
  const sortPopupRef = useRef(null);
  const sortPopupBtn = useRef(null);
  const imageFrameRef = useRef(null);
  const morePopupRef = useRef(null);
  const morePopupBtn = useRef(null);
  const commentInputRef = useRef(null);

  const backNavigate = useNavigate();
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const layoutContent = document.querySelector(".app-layout-content");
    if (layoutContent) {
      layoutContent.scrollTop = 0;
      layoutContent.scrollLeft = 0;
    }

    const handleScroll = () => {
      const scrollPos = layoutContent?.scrollTop ?? window.scrollY ?? 0;
      setIsScrolledPast((prev) => {
        const next = scrollPos > 160;
        return prev !== next ? next : prev;
      });
    };

    layoutContent?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      layoutContent?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [id]);
  useClickOutside(
    sortPopupRef,
    () => {
      setIsSortPopupOn(false);
    },
    sortPopupBtn,
  );

  useClickOutside(
    morePopupRef,
    () => {
      setIsMorePopupOn(false);
    },
    morePopupBtn,
  );

  const isPostLiked = user && post ? isPostLikedBy(user.id, post.id) : false;
  const isPostSaved = user && post ? isPostSavedBy(user.id, post.id) : false;
  const isFollowingPostUploader =
    user && post ? isFollowedBy(user.id, post.authorId) : false;
  const rawComments = useMemo(
    () => (post ? getPostCommentsById(post.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post?.id, storeVersion],
  );
  const postComments = useMemo(() => {
    const list = [...rawComments];
    if (sortMode === "popularity") {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortMode === "latest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [rawComments, sortMode]);
  const postLikeCount = post?.likesCount ?? 0;
  const postCommentCount = postComments.length;

  if (!user) {
    return (
      <main className="postview-page">
        <div className="postview-notice">Please log in to view this post.</div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="postview-page">
        <div className="postview-notice">Post not found.</div>
      </main>
    );
  }

  const isOwnPost = post.authorId === user.id;
  if (post.visibility === "private" && !isOwnPost && !isFollowingPostUploader) {
    return (
      <main className="postview-page">
        <div className="postview-notice">This post is private.</div>
      </main>
    );
  }

  if (postUploader?.blockedUsers?.includes(user.id)) {
    return (
      <main className="postview-page">
        <div className="postview-notice">This post is unavailable.</div>
      </main>
    );
  }

  const tags = post.tags || [];
  const name = `${postUploader?.firstName} ${postUploader?.lastName}`;

  const handlePostLike = () => {
    if (post.isLikesHidden && !isOwnPost) return;
    togglePostLiked(user.id, post.id);
  };

  const handleSave = () => {
    const nowSaved = togglePostSaved(user?.id, post.id);
    setToastMessage(
      nowSaved ? "Saved to bookmarks." : "Removed from bookmarks.",
    );
  };

  const handleFollow = () => {
    if (isFollowingPostUploader) {
      setDialog({ type: "unfollow" });
    } else {
      setFollowUser(user.id, post.authorId, true);
      setToastMessage(`Following @${postUploader?.username}.`);
    }
  };

  const handleDownload = async () => {
    setIsMorePopupOn(false);
    const ok = await downloadImage(
      post.imageUrl,
      `${(post.title || "post").replace(/\s+/g, "-").toLowerCase()}.jpg`,
    );
    setToastMessage(ok ? "Download started." : "Opened image in a new tab.");
  };

  const handleShare = async () => {
    setIsMorePopupOn(false);
    const result = await shareContent({
      title: post.title,
      text: post.description,
      url: `${window.location.origin}/post/${post.id}`,
    });
    const msg = shareMessageFor(result);
    if (msg) setToastMessage(msg);
  };

  const handleSeeMore = () => {
    setIsMorePopupOn(false);
    setToastMessage("We'll show more like this.");
  };

  const handleSeeLess = () => {
    setIsMorePopupOn(false);
    setToastMessage("We'll show fewer like this.");
  };

  const handleReport = () => {
    setIsMorePopupOn(false);
    setDialog({ type: "report" });
  };

  const handleCommentLike = (commentId) => {
    toggleCommentLiked(user.id, commentId);
  };

  const handleSortByPopularity = () => {
    setIsSortPopupOn(false);
    setSortMode("popularity");
  };
  const handleSortByLatest = () => {
    setIsSortPopupOn(false);
    setSortMode("latest");
  };

  const handleCommentSend = () => {
    if (!commentInput.trim()) return;
    if (post.isCommentsDisabled && !isOwnPost) return;
    addComment(post.id, user.id, commentInput.trim());
    setCommentInput("");
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommentSend();
    }
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (imageFrameRef.current && naturalWidth && naturalHeight) {
      imageFrameRef.current.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
    }
  };

  const showCommentInput = !post.isCommentsDisabled || isOwnPost;
  const showLikeControl = !post.isLikesHidden || isOwnPost;

  return (
    <main className="postview-page">
      <div className="postview-image-container">
        <button
          className={`postview-back-btn ${isScrolledPast ? "is-floating" : ""}`}
          title="Go back"
          aria-label="Go back"
          onClick={() => {
            backNavigate(-1);
          }}
        >
          <IconArrowLeft size={28} />
        </button>
        <div className="postview-image-frame" ref={imageFrameRef}>
          <img
            src={post.imageUrl}
            alt={post.title || post.description}
            onLoad={handleImageLoad}
          />
          <button
            className="postview-maximize-btn"
            onClick={() => {
              setIsImageMaximized(true);
            }}
          >
            <IconMaximize size={25} />
          </button>
        </div>
      </div>
      <div className="postview-main-container">
        <div className="postview-scrollable-content">
          <section className="postview-main-info-section">
            <div className="postview-header">
              <div className="postview-avatar">
                <img
                  src={postUploader?.avatarUrl || defaultProfileImage}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.src = defaultProfileImage;
                  }}
                />
                <div>
                  <p className="postview-avatar-name">{name}</p>
                  <Link to={`/user/${postUploader?.username}`}>
                    <p className="postview-avatar-username">
                      {`@${postUploader?.username}`}
                    </p>
                  </Link>
                </div>
              </div>
              {!isOwnPost &&
                (isFollowingPostUploader ? (
                  <button
                    className="postview-unfollow-btn"
                    onClick={handleFollow}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button onClick={handleFollow}>Follow</button>
                ))}
            </div>

            <div className="postview-main-desc">
              <p className="postview-main-desc-heading">{post.title}</p>
              <p>{post.description}</p>
            </div>

            <div className="postview-main-actions">
              {showLikeControl && (
                <div className="postview-actions-div">
                  <button aria-label="Like" onClick={handlePostLike}>
                    {isPostLiked ? (
                      <IconHeartFilled className="postview-liked-icon" />
                    ) : (
                      <IconHeart />
                    )}
                  </button>
                  <p>{countFormatter(postLikeCount)}</p>
                </div>
              )}
              <div className="postview-actions-div">
                <button
                  aria-label="Comments"
                  onClick={() => {
                    commentInputRef.current.focus();
                  }}
                >
                  <IconMessages />
                </button>
                <p>{countFormatter(postCommentCount)}</p>
              </div>

              <button aria-label="Bookmark" onClick={handleSave}>
                {isPostSaved ? <IconBookmarkFilled /> : <IconBookmark />}
              </button>
              <button
                aria-label="More options"
                onClick={() => {
                  if (!isMorePopupOn && morePopupBtn.current) {
                    const btnRect =
                      morePopupBtn.current.getBoundingClientRect();
                    const parentRect =
                      morePopupBtn.current.offsetParent.getBoundingClientRect();
                    setMoreBtnCenter(
                      btnRect.left - parentRect.left + btnRect.width / 2,
                    );
                    const spaceBelow = window.innerHeight - btnRect.bottom;
                    setPopupPlacement(spaceBelow < 250 ? "top" : "bottom");
                  }
                  setIsMorePopupOn(!isMorePopupOn);
                }}
                ref={morePopupBtn}
              >
                <IconDots />
              </button>
              {isMorePopupOn && (
                <div
                  className={`postview-more-popup-window placement-${popupPlacement}`}
                  ref={morePopupRef}
                  style={{
                    left: `${moreBtnCenter}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div>
                    <button onClick={handleDownload}>Download image</button>
                    <button onClick={handleShare}>Share image</button>
                    <button onClick={handleSeeLess}>See less</button>
                    <button onClick={handleSeeMore}>See more</button>
                    <button onClick={handleReport}>Report image</button>
                  </div>
                </div>
              )}
            </div>

            <div className="postview-tags-container">
              {tags.map((tag, idx) => (
                <span key={idx} className="postview-tags-span">
                  {"#" + tag}
                </span>
              ))}
            </div>
          </section>

          <section className="postview-comments-section">
            <div className="postview-comments-header">
              <span>
                {postCommentCount > 0
                  ? `Comments (${countFormatter(postCommentCount)})`
                  : "Comments"}
              </span>
              {postCommentCount > 0 && (
                <button
                  onClick={() => {
                    setIsSortPopupOn(!isSortPopupOn);
                  }}
                  ref={sortPopupBtn}
                >
                  <IconFilter2 size={18} className="comments-sort-btn" />
                  <p>Sort by</p>
                </button>
              )}
              {isSortPopupOn && (
                <div className="postview-sort-popup" ref={sortPopupRef}>
                  <button onClick={handleSortByPopularity}>
                    Popularity<p>Show featured comments</p>
                  </button>
                  <button onClick={handleSortByLatest}>
                    Latest<p>Show recent commments</p>
                  </button>
                </div>
              )}
            </div>

            <div className="postview-comments-container">
              {postComments.length === 0 && (
                <p className="postview-comments-empty">No comments yet.</p>
              )}
              {postComments.map((prev) => {
                const commenter = getUserById(prev.authorId);
                const isCommentLiked =
                  user && Array.isArray(prev.likedBy)
                    ? prev.likedBy.includes(user.id)
                    : false;
                return (
                  <div
                    key={prev.id}
                    className="postview-total-comment-container"
                  >
                    <div className="postview-comment-wrapper">
                      <img
                        src={commenter?.avatarUrl || defaultProfileImage}
                        alt={commenter?.username || "User"}
                        onError={(e) => {
                          e.currentTarget.src = defaultProfileImage;
                        }}
                      />
                      <div className="postview-comment-box">
                        <div className="postview-commenter-details">
                          <Link to={`/user/${commenter?.username}`}>
                            <span className="postview-comment-username">{`@${commenter?.username ?? "unknown"}`}</span>
                          </Link>
                          <span className="postview-commenter-details-date">
                            {timeFormatter(prev.createdAt)}
                          </span>
                        </div>
                        <span className="postview-comment-content">
                          {prev.content}
                        </span>
                      </div>
                    </div>
                    <div className="postview-comment-like-icon">
                      <button
                        aria-label="Like comment"
                        onClick={() => handleCommentLike(prev.id)}
                      >
                        {isCommentLiked ? (
                          <IconHeartFilled
                            size={20}
                            className="postview-liked-icon"
                          />
                        ) : (
                          <IconHeart size={20} />
                        )}
                      </button>
                      <p>{countFormatter(prev.likesCount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {showCommentInput && (
          <div
            className={`postview-comments-input-wrapper ${
              isScrolledPast ? "is-floating" : ""
            }`}
          >
            <div className="postview-comments-input-section">
              <input
                type="text"
                placeholder="Add a comment..."
                onChange={(e) => {
                  setCommentInput(e.target.value);
                }}
                onKeyDown={handleCommentKeyDown}
                ref={commentInputRef}
                value={commentInput}
              />
              <button aria-label="Send comment" onClick={handleCommentSend}>
                <IconSend size={25} stroke={2} />
              </button>
            </div>
          </div>
        )}
      </div>
      {isImageMaximized && (
        <div className="postview-image-maximized">
          <img src={post.imageUrl} alt={post.title} />
          <button
            onClick={() => {
              setIsImageMaximized(false);
            }}
          >
            <IconX size={30} />
          </button>
        </div>
      )}

      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      <ConfirmDialog
        open={dialog?.type === "unfollow"}
        title={`Unfollow @${postUploader?.username}?`}
        message={`${postUploader?.firstName} won't be notified, and their posts will stop appearing in your feed. You can follow again anytime.`}
        confirmLabel="Unfollow"
        danger
        onConfirm={() => {
          setFollowUser(user.id, post.authorId, false);
          setToastMessage(`Unfollowed @${postUploader?.username}.`);
        }}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "report"}
        title="Report this image?"
        message="Why are you reporting this? Your report is anonymous."
        options={REPORT_REASONS}
        confirmLabel="Submit report"
        onConfirm={() => setToastMessage("Report submitted. Thank you.")}
        onClose={() => setDialog(null)}
      />
    </main>
  );
}
