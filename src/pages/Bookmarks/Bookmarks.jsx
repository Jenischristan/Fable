import "./Bookmarks.css";
import React, { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Masonry } from "masonic";
import {
  IconDots,
  IconShare3,
} from "@tabler/icons-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import {
  getCurrentUser,
  getSavedPostsById,
  isPostSavedBy,
  togglePostSaved,
} from "../../mocks/api";
import Toast from "../../components/ui/Toast/Toast";
import { shareContent, shareMessageFor } from "../../utils/shareActions";

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
    isPostSavedBy(user?.id, post.id),
  );
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
          onShare={handleShare}
        />
      )}
    </div>
  );
});

export default function Bookmarks() {
  const user = getCurrentUser();
  const [toastMessage, setToastMessage] = useState("");
  const [saveTick, setSaveTick] = useState(0);

  const posts = getSavedPostsById(user?.id);

  return (
    <main className="bookmarks-page">
      <div className="bookmarks-header">
        <h1>Bookmarks</h1>
        <p>Your saved posts, all in one place.</p>
      </div>

      <div className="bookmarks-container">
        {posts.length === 0 ? (
          <div className="bookmarks-empty">
            <p>Nothing saved yet.</p>
            <p>Tap Save on any post to keep it here.</p>
          </div>
        ) : (
          <Masonry
            key={saveTick}
            items={posts}
            render={({ data, index }) => (
              <PostCard
                data={data}
                index={index}
                onToast={(msg) => {
                  setToastMessage(msg);
                  setSaveTick((t) => t + 1);
                }}
              />
            )}
            itemKey={(data, index) => data?.id ?? index}
            columnGutter={16}
            columnWidth={180}
            maxColumnCount={5}
          />
        )}
      </div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </main>
  );
}
