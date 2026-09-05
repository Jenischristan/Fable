import "./Home.css";
import { posts } from "../../mocks/postsData";
import { Masonry } from "masonic";
import {
  IconDots,
  IconDownload,
  IconFlag,
  IconShare3,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import React from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

function MorePopUp({ position, ignoreRef, handler }) {
  const popUpRef = useRef(null);
  useClickOutside(popUpRef, handler, ignoreRef);
  const handelPopUpClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div
      className="home-more-popup"
      onClick={handelPopUpClick}
      style={{
        top: position.top,
        left: position.left,
      }}
      ref={popUpRef}
    >
      <p>The image is shown based on your interests</p>
      <button>
        <IconThumbUp />
        Show more
      </button>
      <button>
        <IconThumbDown />
        Show less
      </button>
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

  const btnRef = useRef(null);

  const [popUpPos, setPopUpPos] = useState({
    top: 0,
    left: 0,
  });

  const [isSaved, setIsSaved] = useState(post.isBookmarked)

  const [isLandscape, setIsLandscape] = useState(false);

  const calculatePopUpPos = () => {
    if (!btnRef.current) return null;
    const rect = btnRef.current.getBoundingClientRect();
    const popupWidth = 280;
    const popupHeight = 210;
    const spacing = 8;
    let top = rect.bottom + spacing;
    let left = rect.left;

    if (top + popupHeight > window.innerHeight) {
      top = rect.top - popupHeight - spacing;
    }
    if (left + popupWidth > window.innerWidth) {
      left = rect.right - popupWidth;
    }
    left = Math.max(8, left);
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
    setIsSaved(true)
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

  const handleLandscape = (e) => {
    setIsLandscape(e.target.naturalWidth > e.target.naturalHeight);
  };

  return (
    <div className="home-masonry-item">
      <NavLink to={`/post/${post.id}`} state={{post}}>
        <img
          src={post.url}
          alt={post.description || "Post"}
          loading="lazy"
          onLoad={handleLandscape}
        />
      </NavLink>

      <div className="home-masonry-item-overlay">
        <button type="button" onClick={handleSave} className="home-overlay-save-btn">
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

function Home() {
  return (
    <main className="home-page">
      <Masonry
        items={posts}
        render={PostCard}
        itemKey={(data) => data.id}
        columnGutter={16}
        columnWidth={180}
        maxColumnCount={5}
      />
    </main>
  );
}

export default Home;
