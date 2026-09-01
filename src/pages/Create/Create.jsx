import { IconPhotoUp, IconX } from "@tabler/icons-react";
import "./Create.css";
import { useState } from "react";

export default function Create() {

  const [previewUrl,setPreviewUrl] = useState(null);

  function handleChange(e) {
    const file = e.target.files[0]
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl)
    }
  }

  function handleRemove() {
    if(previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    
  }


  return (
    <main className="create-page">
      <form className="create-form">
        <div className="create-img-upload-container">
          <input
            type="file"
            accept="image/png, image/jpeg"
            id="createImgUpload"
            hidden
            onChange={handleChange}
          />
          {!previewUrl ?    <label htmlFor="createImgUpload" className="create-page-img-label">
            <div>
              <h4>Upload your media</h4>
              <p>
                You can only upload a single picture
              </p>
            </div>
            <IconPhotoUp size={100} />
            <p>JPG, PNG up to 2MB</p>
          </label> : 
          <div className="create-preview-card">
              <img src={previewUrl} alt="Preview" className="create-preview-image" />
              <button 
                type="button" 
                className="create-remove-img-btn" 
                onClick={handleRemove}
                title="Remove image"
              >
                <IconX size={20}/>
              </button>
            </div>}
       
        </div>

        {/* <div className="create-page-divider"></div> */}

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
                  defaultChecked
                />
                <span className="create-radio-title">Public</span>
              </label>
              <label htmlFor="" className="create-radio-label">
                <input
                  type="radio"
                  name="visibility"
                  id="private"
                  defaultChecked
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
    </main>
  );
}
