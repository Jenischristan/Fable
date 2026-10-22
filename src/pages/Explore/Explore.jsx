import "./Explore.css";
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Masonry } from "masonic";
import { IconDots, IconHash, IconShare3 } from "@tabler/icons-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useMockData } from "../../hooks/useMockData";
import { useMasonryColumnWidth } from "../../hooks/useMasonryColumnWidth";
import {
  getCurrentUser,
  getRecommendedCreators,
  getTrendingTags,
  isPostSavedBy,
  searchPosts,
  searchTags,
  searchUsers,
  togglePostSaved,
} from "../../mocks/api";
import { countFormatter } from "../../utils/countFormatter";
import Toast from "../../components/ui/Toast/Toast";
import { shareContent, shareMessageFor } from "../../utils/shareActions";
import { isImageCached, markImageCached } from "../../utils/imageCache";

function MorePopUp({ position, ignoreRef, handler, onShare }) {
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
      <p>The image is shown based on your interests</p>
      <button onClick={onShare}>
        <IconShare3 />
        Share image
      </button>
    </div>
  );
}

const PostCard = React.memo(function PostCard({ data: post, onToast }) {
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

  useEffect(() => {
    if (isImageCached(post?.imageUrl)) {
      setIsImageLoaded(true);
    }
  }, [post?.imageUrl]);

  const calculatePopUpPos = () => {
    if (!btnRef.current) return null;
    const rect = btnRef.current.getBoundingClientRect();
    const popupWidth = 280;
    const popupHeight = 120;
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
    const nowSaved = togglePostSaved(user?.id, post.id);
    setIsSaved(nowSaved);
    onToast?.(nowSaved ? "Saved to bookmarks." : "Removed from bookmarks.");
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

  const handleImageLoading = () => {
    markImageCached(post?.imageUrl);
    setIsImageLoaded(true);
  };

  const handleShare = async () => {
    setIsPopUpActive(false);
    const result = await shareContent({
      title: post.title,
      text: post.description,
      url: `${window.location.origin}/post/${post.id}`,
    });
    const msg = shareMessageFor(result);
    if (msg) onToast?.(msg);
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
          handler={() => setIsPopUpActive(false)}
          onShare={handleShare}
        />
      )}
    </div>
  );
});

export default function Explore() {
  const storeVersion = useMockData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toastMessage, setToastMessage] = useState("");
  const postsSectionRef = useRef(null);
  const { columnWidth, columnCount } = useMasonryColumnWidth(postsSectionRef);

  const query = (searchParams.get("q") || "").trim();
  const trendingTags = getTrendingTags(10);
  const creators = getRecommendedCreators(6);
  const posts = useMemo(() => searchPosts(query), [query, storeVersion]);

  const matchingTags = query ? searchTags(query, 10) : [];
  const matchingUsers = query ? searchUsers(query, 6) : [];

  const handleClearSearch = () => {
    setSearchParams({});
  };

  const hasAnyResults = !query || posts.length > 0 || matchingTags.length > 0 || matchingUsers.length > 0;

  const renderItem = useCallback(
    ({ data, index }) => (
      <PostCard data={data} index={index} onToast={setToastMessage} />
    ),
    [setToastMessage],
  );

  return (
    <main className="explore-page">
      {/* When no search query: show Trending Topics */}
      {!query && (
        <section className="explore-tags-section">
          <h2>Trending Topics</h2>
          <div className="explore-tags-grid">
            {trendingTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="explore-tag-card"
                onClick={() => setSearchParams({ q: tag.name })}
              >
                <img src={tag.coverImageUrl} alt={tag.displayName} />
                <div className="explore-tag-card-overlay">
                  <IconHash size={20} />
                  <span className="explore-tag-name">{tag.name}</span>
                  <span className="explore-tag-count">
                    {countFormatter(tag.postsCount)} posts
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* When searching: show Matching Topics if any */}
      {query && matchingTags.length > 0 && (
        <section className="explore-tags-section">
          <h2>Matching Topics ({matchingTags.length})</h2>
          <div className="explore-tags-grid">
            {matchingTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="explore-tag-card"
                onClick={() => setSearchParams({ q: tag.name })}
              >
                <img src={tag.coverImageUrl} alt={tag.displayName} />
                <div className="explore-tag-card-overlay">
                  <IconHash size={20} />
                  <span className="explore-tag-name">{tag.name}</span>
                  <span className="explore-tag-count">
                    {countFormatter(tag.postsCount)} posts
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* When no search query: show Recommended Creators */}
      {!query && creators.length > 0 && (
        <section className="explore-creators-section">
          <h2>Creators to Follow</h2>
          <div className="explore-creators-grid">
            {creators.map((creator) => (
              <NavLink
                key={creator.id}
                to={`/user/${creator.username}`}
                className="explore-creator-card"
              >
                <img src={creator.avatarUrl} alt={creator.username} />
                <div className="explore-creator-info">
                  <span className="explore-creator-name">
                    {`${creator.firstName} ${creator.lastName}`}
                  </span>
                  <span className="explore-creator-handle">
                    @{creator.username}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        </section>
      )}

      {/* When searching: show Matching Users if any */}
      {query && matchingUsers.length > 0 && (
        <section className="explore-creators-section">
          <h2>Matching Users ({matchingUsers.length})</h2>
          <div className="explore-creators-grid">
            {matchingUsers.map((creator) => (
              <NavLink
                key={creator.id}
                to={`/user/${creator.username}`}
                className="explore-creator-card"
              >
                <img src={creator.avatarUrl} alt={creator.username} />
                <div className="explore-creator-info">
                  <span className="explore-creator-name">
                    {`${creator.firstName} ${creator.lastName}`}
                  </span>
                  <span className="explore-creator-handle">
                    @{creator.username}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        </section>
      )}

      {/* Posts Section */}
      <section className="explore-posts-section" ref={postsSectionRef}>
        <div className="explore-posts-header">
          <h2>
            {query
              ? `Matching Posts (${posts.length})`
              : "All Posts"}
          </h2>
          {query && (
            <button
              type="button"
              className="explore-clear-btn"
              onClick={handleClearSearch}
            >
              Clear search
            </button>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="explore-empty">
            <p>No posts found{query ? ` for "${query}"` : ""}.</p>
            <p>Try searching for a different keyword or topic.</p>
          </div>
        ) : (
          <Masonry
            items={posts}
            render={renderItem}
            itemKey={(data, index) => data?.id ?? index}
            columnGutter={16}
            columnWidth={columnWidth}
            columnCount={columnCount}
            maxColumnCount={5}
          />
        )}
      </section>

      {!hasAnyResults && (
        <div className="explore-empty">
          <p>No results found for "{query}".</p>
          <button
            type="button"
            className="explore-clear-btn"
            onClick={handleClearSearch}
            style={{ marginTop: "1rem" }}
          >
            Clear search
          </button>
        </div>
      )}

      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </main>
  );
}
