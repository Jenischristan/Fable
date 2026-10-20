import { IconPhotoUp, IconX } from "@tabler/icons-react";
import "./Create.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPost, getCurrentUser } from "../../mocks/api";
import Toast from "../../components/ui/Toast/Toast";

export default function Create() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [toastMessage, setToastMessage] = useState("");

  function handleChange(e) {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewFile(file);
      setPreviewUrl(fileUrl);
    }
  }

  function handleRemove() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewFile(null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const tagsRaw = form["tag-topics"].value.trim();

    if (!previewFile) {
      setToastMessage("Please upload an image first.");
      return;
    }
    if (!title || !description || !tagsRaw) {
      setToastMessage("Please fill in all fields.");
      return;
    }

    const tagList = tagsRaw
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);

    addPost({
      id: `post_${Date.now()}`,
      authorId: user?.id || "user_001",
      title,
      visibility,
      imageUrl: previewUrl,
      aspectRatio: 1,
      tags: tagList,
      likesCount: 0,
      likedBy: [],
      savedBy: [],
      commentsCount: 0,
      description,
      isCommentsDisabled: false,
      isLikesHidden: false,
      createdAt: new Date().toISOString(),
    });

    setToastMessage("Your post is live!");
    form.reset();
    setPreviewUrl(null);
    setPreviewFile(null);
    setVisibility("public");

    setTimeout(() => {
      navigate("/home");
    }, 1200);
  }


  return (
    <main className="create-page">
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="create-img-upload-container">
          <input
            type="file"
            accept="image/png, image/jpeg"
            id="createImgUpload"
            hidden
            onChange={handleChange}
          />
          {!previewUrl ? (
            <label htmlFor="createImgUpload" className="create-page-img-label">
              <div>
                <h4>Upload your media</h4>
                <p>You can only upload a single picture</p>
              </div>
              <IconPhotoUp size={100} />
              <p>JPG, PNG up to 2MB</p>
            </label>
          ) : (
            <div className="create-preview-card">
              <img
                src={previewUrl}
                alt="Preview"
                className="create-preview-image"
              />
              <button
                type="button"
                className="create-remove-img-btn"
                onClick={handleRemove}
                title="Remove image"
              >
                <IconX size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="create-inputs-container">
          <div className="create-form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Give a title"
              required
            />
          </div>
          <div className="create-form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              className="create-desc-input"
              placeholder="Describe your image"
              required
            />
          </div>
          <div className="create-form-group">
            <label htmlFor="tag-topics">Tagged Topics</label>
            <input
              type="text"
              name="tag-topics"
              id="tag-topics"
              placeholder="Add some tags"
              required
            />
          </div>
          <div className="create-visibility-input">
            <label>Visibility</label>
            <div className="create-radio">
              <label className="create-radio-label">
                <input
                  type="radio"
                  name="visibility"
                  id="public"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                />
                <span className="create-radio-title">Public</span>
              </label>
              <label htmlFor="private" className="create-radio-label">
                <input
                  type="radio"
                  name="visibility"
                  id="private"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                />
                <span className="create-radio-title">Private</span>
              </label>
            </div>
          </div>

          <button type="submit" className="create-submit-btn">
            Upload Image
          </button>
        </div>
      </form>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </main>
  );
}
