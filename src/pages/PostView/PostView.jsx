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
import { useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import {
  getCurrentUser,
  getUserById,
  getPostById,
  isPostLikedBy,
  isPostSavedBy,
  isFollowedBy,
  getPostCommentsById,
} from "../../mocks/api";
import defaultProfileImage from "/src/assets/default_profile.jpg"
export default function PostView() {
  const user = getCurrentUser();
  const location = useLocation();
  const { id } = useParams();
  const post = location.state?.post || (id ? getPostById(String(id)) : null);
  const postUploader = post?.authorId ? getUserById(post.authorId) : null;
  console.log(defaultProfileImage);
  const [isPostLiked, setIsPostLiked] = useState(() =>
    user && post ? isPostLikedBy(user.id, post.id) : false,
  );
  const [postLikeCount, setPostLikeCount] = useState(post?.likesCount ?? 0);
  const [isPostSaved, setIsPostSaved] = useState(() =>
    user && post ? isPostSavedBy(user.id, post.id) : false,
  );
  const [isFollowingPostUploader, setIsFollowingPostUploader] = useState(() =>
    user && post ? isFollowedBy(user.id, post.authorId) : false,
  );
  const [commentInput, setCommentInput] = useState("");
  const [postComments, setPostComments] = useState(
    getPostCommentsById(post.id),
  );
  const [isSortPopupOn, setIsSortPopupOn] = useState(false);
  const [isImageMaximized, setIsImageMaximized] = useState(false);
  const [isMorePopupOn, setIsMorePopupOn] = useState(false);
  const [moreBtnCenter, setMoreBtnCenter] = useState(0);
  const sortPopupRef = useRef(null);
  const sortPopupBtn = useRef(null);
  const imageFrameRef = useRef(null);
  const morePopupRef = useRef(null);
  const morePopupBtn = useRef(null);
  const commentInputRef = useRef(null);

  const backNavigate = useNavigate();
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

  if (!user) {
    return <div>Please log in</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  const tags = post.tags || [];
  const name = `${postUploader?.firstName} ${postUploader?.lastName}`;

  const handlePostLike = () => {
    setIsPostLiked(!isPostLiked);
    if (isPostLiked) {
      setPostLikeCount(postLikeCount - 1);
    } else {
      setPostLikeCount(postLikeCount + 1);
    }
  };

  const handleSave = () => {
    setIsPostSaved(!isPostSaved);
  };

  const handleFollow = () => {
    setIsFollowingPostUploader(!isFollowingPostUploader);
  };

  const handleCommentLike = () => {};

  const handleSortByPopularity = () => {
    setIsSortPopupOn(false);
    setPostComments((prevComments) =>
      [...prevComments].sort((a, b) => b.likesCount - a.likesCount),
    );
  };
  const handleSortByLatest = () => {
    setIsSortPopupOn(false);
    setPostComments((prevComments) =>
      [...prevComments].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    );
  };

  const handleCommentSend = () => {
    if (!commentInput) return;
    const totalComment = {
      id: `user_${Date.now()}`,
      postId: post.id,
      authorId: user.id,
      content: commentInput,
      createdAt: new Date(),
      likesCount: 0,
      likedBy: [],
      isDeleted: false,
    };
    setCommentInput("");
    setPostComments([totalComment, ...postComments]);
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (imageFrameRef.current && naturalWidth && naturalHeight) {
      imageFrameRef.current.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
    }
  };

  return (
    <main className="postview-page">
      <div className="postview-image-container">
        <button
          className="postview-back-btn"
          onClick={() => {
            backNavigate(-1);
          }}
        >
          <IconArrowLeft size={30} />
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
              {isFollowingPostUploader ? (
                <button
                  className="postview-unfollow-btn"
                  onClick={handleFollow}
                >
                  Unfollow
                </button>
              ) : (
                <button onClick={handleFollow}>Follow</button>
              )}
            </div>

            <div className="postview-main-desc">
              <p className="postview-main-desc-heading">{post.title}</p>
              <p>{post.description}</p>
            </div>

            <div className="postview-main-actions">
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
              <div className="postview-actions-div">
                <button
                  aria-label="Comments"
                  onClick={() => {
                    commentInputRef.current.focus();
                  }}
                >
                  <IconMessages />
                </button>
                <p>{countFormatter(post.commentsCount)}</p>
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
                  }
                  setIsMorePopupOn(!isMorePopupOn);
                }}
                ref={morePopupBtn}
              >
                <IconDots />
              </button>
              {isMorePopupOn && (
                <div
                  className="postview-more-popup-window"
                  ref={morePopupRef}
                  style={{
                    left: `${moreBtnCenter}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div>
                    <button>Download image</button>
                    <button>Share image</button>
                    <button>See less</button>
                    <button>See more</button>
                    <button>Report image</button>
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
              <span>Comments ({countFormatter(post.commentsCount)})</span>
              <button
                onClick={() => {
                  setIsSortPopupOn(!isSortPopupOn);
                }}
                ref={sortPopupBtn}
              >
                <IconFilter2 size={18} className="comments-sort-btn" />
                <p>Sort by</p>
              </button>
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
              {postComments.map((prev) => {
                const commenter = getUserById(prev.authorId);
                return (
                  <div
                    key={prev.id}
                    className="postview-total-comment-container"
                  >
                    <div className="postview-comment-wrapper">
                      <img
                  src={commenter?.avatarUrl || defaultProfileImage}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.src = defaultProfileImage;
                  }}
                />
                      <div className="postview-comment-box">
                        <div className="postview-commenter-details">
                          <Link to={`/user/${commenter.username}`}>
                            <span className="postview-comment-username">{`@${commenter.username}`}</span>
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
                      <button onClick={handleCommentLike}>
                        {prev.isLiked ? (
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

        <div className="postview-comments-input-wrapper">
          <div className="postview-comments-input-section">
            <input
              type="text"
              placeholder="Add a comment..."
              onChange={(e) => {
                setCommentInput(e.target.value);
              }}
              ref={commentInputRef}
              value={commentInput}
            />
            <button aria-label="Send comment" onClick={handleCommentSend}>
              <IconSend size={25} stroke={2} />
            </button>
          </div>
        </div>
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
    </main>
  );
}
