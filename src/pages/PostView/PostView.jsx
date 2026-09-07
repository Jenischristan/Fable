import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./PostView.css";
import { getPostById } from "../../mocks/api";
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
import {  getUserById } from "../../mocks/api";
import { useClickOutside } from "../../hooks/useClickOutside";
import { getCurrentUser } from "../../mocks/api";

export default function PostView() {
  const currentUser = getCurrentUser()
  const location = useLocation();
  const { id } = useParams();
  const post =
    location.state?.post || getPostById(String(id));

  const [isPostLiked, setIsPostLiked] = useState(post.isLiked);
  const [postLikeCount, setPostLikeCount] = useState(post.likesCount);
  const [isPostBookmarked, setIsPostBookmarked] = useState(post.isBookmarked);
  const postUploader = post ? getUserById(post.author.id) : null;
  const [isFollowingPoster, setIsFollowingPoster] = useState(
    postUploader.isFollowing,
  );
  const [commentInput, setCommentInput] = useState("");
  const [allComments, setAllComments] = useState([...post.comments]);
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

  if (!post) {
    return (
      <div className="postview-not-found">
        <h1>Post not found.</h1>
      </div>
    );
  }

  const tags = post.tags || [];
  const name = `${post.author.firstName} ${post.author.lastName}`;

  const handlePostLike = () => {
    setIsPostLiked(!isPostLiked);
    if (isPostLiked) {
      setPostLikeCount(postLikeCount - 1);
    } else {
      setPostLikeCount(postLikeCount + 1);
    }
  };

  const handleBookmark = () => {
    setIsPostBookmarked(!isPostBookmarked);
  };

  const handleFollow = () => {
    setIsFollowingPoster(!isFollowingPoster);
  };

  const handleCommentLike = () => {};

  const handleSortByPopularity = () => {
    setIsSortPopupOn(false);
    setAllComments((prevComments) =>
      [...prevComments].sort((a, b) => b.likesCount - a.likesCount),
    );
  };
  const handleSortByLatest = () => {
    setIsSortPopupOn(false);
    setAllComments((prevComments) =>
      [...prevComments].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    );
  };

  const handleCommentSend = () => {
    if (!commentInput) return;
    console.log(allComments);
    const totalComment = {
      id: "comment_99999",
      author: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      content: commentInput,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date(),
    };
    setCommentInput("");
    setAllComments([totalComment, ...allComments]);
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
       <button className="postview-back-btn" onClick={() => {
        backNavigate(-1)
       }}><IconArrowLeft size={30}/></button>
        <div className="postview-image-frame" ref={imageFrameRef}>
          <img
            src={post.url}
            alt={post.description || post.title}
            onLoad={handleImageLoad}
          />
          <button
            className="postview-maximize-btn"
            onClick={() => {
              setIsImageMaximized(true);
            }}
          >
            <IconMaximize  size={25}/>
          </button>
        </div>
      </div>
      <div className="postview-main-container">
        <div className="postview-scrollable-content">
          <section className="postview-main-info-section">
            <div className="postview-header">
              <div className="postview-avatar">
                <img src={post.author.avatar} alt={name} />
                <div>
                  <p className="postview-avatar-name">{name}</p>
                  <Link to={`/user/${post.author.username}`}>
                    <p className="postview-avatar-username">
                      {"@" + post.author.username}
                    </p>
                  </Link>
                </div>
              </div>
              {isFollowingPoster ? (
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
                <button aria-label="Comments"  onClick={() => {commentInputRef.current.focus()}}>
                  <IconMessages />
                </button>
                <p>{countFormatter(allComments.length)}</p>
              </div>

              <button aria-label="Bookmark" onClick={handleBookmark}>
                {isPostBookmarked ? <IconBookmarkFilled /> : <IconBookmark />}
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
                <div className="postview-more-popup-window" ref={morePopupRef}  style={{ left: `${moreBtnCenter}px`, transform: "translateX(-50%)" }}>
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
              <span>Comments ({countFormatter(allComments.length)})</span>
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
              {allComments.map((prev) => {
                return (
                  <div
                    key={prev.id}
                    className="postview-total-comment-container"
                  >
                    <div className="postview-comment-wrapper">
                      <img src={prev.author.avatar} alt="image" />
                      <div className="postview-comment-box">
                        <div className="postview-commenter-details">
                          <Link to={`/user/${prev.author.username}`}>
                            <span className="postview-comment-username">{`@${prev.author.username}`}</span>
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
          <img src={post.url} alt={post.title} />
          <button
            onClick={() => {
              setIsImageMaximized(false);
            }}
          >
            <IconX size={30}/>
          </button>
        </div>
      )}
    </main>
  );
}
