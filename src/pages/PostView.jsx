import { useLocation, useParams } from "react-router-dom";
import "./PostView.css";
import { posts } from "../mocks/postsData";
import {
  IconBookmark,
  IconDots,
  IconFilter2,
  IconHeart,
  IconMessages,
  IconSend,
} from "@tabler/icons-react";

export default function PostView() {
  const location = useLocation();
  const { id } = useParams();

  const post =
    location.state?.post || posts.find((p) => String(p.id) === String(id));

  if (!post) {
    return (
      <div className="postview-not-found">
        <h1>Post not found.</h1>
      </div>
    );
  }

  const tags = post.tags || [];
  const name = `${post.author.firstName} ${post.author.lastName}`;
  const comments = post.comments;

  const handleClick = () => {
    console.log(comments);
  };

  return (
    <main className="postview-page">
      <div className="postview-image-container">
        <img src={post.url} alt={post.description || post.title} />
      </div>

      <div className="postview-main-container">
        <div className="postview-scrollable-content">
          <section className="postview-main-info-section">
            <div className="postview-header">
              <div className="postview-avatar">
                <img src={post.author.avatar} alt={name} />
                <div>
                  <p className="postview-avatar-name">{name}</p>
                  <p>{"@" + post.author.username}</p>
                </div>
              </div>
              <button>Follow</button>
            </div>

            <div className="postview-main-desc">
              <p className="postview-main-desc-heading">{post.title}</p>
              <p>{post.description}</p>
            </div>

            <div className="postview-main-actions">
              <div className="postview-actions-div">
                <button aria-label="Like">
                  <IconHeart />
                </button>
                <p>{post.likesCount}</p>
              </div>
              <div className="postview-actions-div">
                <button aria-label="Comments">
                  <IconMessages />
                </button>
                <p>{post.commentsCount}</p>
              </div>

              <button aria-label="Bookmark">
                <IconBookmark />
              </button>
              <button aria-label="More options" onClick={handleClick}>
                <IconDots />
              </button>
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
              <span>Comments ({post.commentsCount})</span>
              <button>
                <IconFilter2 size={18} className="comments-sort-btn" />
                <p>Sort by</p>
              </button>
            </div>
            <div className="postview-comments-container">
              {comments.map((prev) => {
                return (
                  <div className="postview-total-comment-container">
                    <div key={prev.id} className="postview-comment-wrapper">
                      <img src={prev.author.avatar} alt="image" />
                      <div className="postview-comment-box">
                        <div className="postview-commenter-details">
                          <span className="postview-comment-username">{`@${prev.author.username}`}</span>
                          <span className="postview-commenter-details-date">
                            3 months ago
                          </span>
                        </div>
                        <span className="postview-comment-content">
                          {prev.content}
                        </span>
                      </div>
                    </div>
                    <div className="postview-comment-like-icon">
                      <button>
                        <IconHeart size={20} />
                      </button>
                      <p>{prev.likesCount}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="postview-comments-input-wrapper">
          <div className="postview-comments-input-section">
            <input type="text" placeholder="Add a comment..." />
            <button aria-label="Send comment">
              <IconSend size={25} stroke={2} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
