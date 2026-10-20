import "./Home.css";
import { getCurrentUser, getHomePostFeed, isPostSavedBy, togglePostSaved } from "../../mocks/api";
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
import { useMockData } from "../../hooks/useMockData";
import { useMasonryColumnWidth } from "../../hooks/useMasonryColumnWidth";
import Toast from "../../components/ui/Toast/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { REPORT_REASONS } from "../../utils/reportReasons";
import { downloadImage, shareContent, shareMessageFor } from "../../utils/shareActions";

function MorePopUp({ position, ignoreRef, handler, onShowMore, onShowLess, onDownload, onReport }) {
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
      <button onClick={onShowMore}>
        <IconThumbUp />
        Show more
      </button>
      <button onClick={onShowLess}>
        <IconThumbDown />
        Show less
      </button>
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

const PostCard = React.memo(function PostCard({ data: post, onToast }) {
  const [isPopUpActive, setIsPopUpActive] = useState(false);
  const user = getCurrentUser()
  const btnRef = useRef(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [popUpPos, setPopUpPos] = useState({
    top: 0,
    left: 0,
  });

  const [isSaved, setIsSaved] = useState(() => isPostSavedBy(user?.id,post.id));
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const calculatePopUpPos = () => {
    if (!btnRef.current) return null;
    const rect = btnRef.current.getBoundingClientRect();
    const popupWidth = 280;
    const popupHeight = 240;
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

  const closePopUp = () => setIsPopUpActive(false);

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

  const handleShowMore = () => {
    closePopUp();
    onToast?.("We'll show more like this.");
  };

  const handleShowLess = () => {
    closePopUp();
    onToast?.("We'll show fewer like this.");
  };

  const handleDownload = async () => {
    closePopUp();
    const ok = await downloadImage(
      post.imageUrl,
      `${(post.title || "post").replace(/\s+/g, "-").toLowerCase()}.jpg`,
    );
    onToast?.(
      ok ? "Download started." : "Opened image in a new tab.",
    );
  };

  const handleReport = () => {
    closePopUp();
    setIsReportOpen(true);
  };

  return (
    <div className="home-masonry-item">
      <NavLink to={`/post/${post.id}`} state={{ post }}>
        {!isImageLoaded && (
          <div
            className="home-image-skeleton"
            style={{
              aspectRatio: post.aspectRatio || "16/9"
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
          onShowMore={handleShowMore}
          onShowLess={handleShowLess}
          onDownload={handleDownload}
          onReport={handleReport}
        />
      )}

      <Toast message="" onClose={() => {}} />
      <ConfirmDialog
        open={isReportOpen}
        title="Report this image?"
        message="Why are you reporting this? Your report is anonymous."
        options={REPORT_REASONS}
        confirmLabel="Submit report"
        onConfirm={() => onToast?.("Report submitted. Thank you.")}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
});

function Home() {
  useMockData();
  const containerRef = useRef(null);
  const posts = getHomePostFeed();
  const columnWidth = useMasonryColumnWidth(containerRef);
  const [toastMessage, setToastMessage] = useState("");

  return (
    <main className="home-page" ref={containerRef}>
      <Masonry
        items={posts}
        render={({ data, index }) => (
          <PostCard data={data} index={index} onToast={setToastMessage} />
        )}
        itemKey={(data, index) => data?.id ?? index}
        columnGutter={16}
        columnWidth={columnWidth}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </main>
  );
}

export default Home;