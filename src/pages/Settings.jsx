import {
  IconLock,
  IconLockFilled,
  IconUser,
  IconUserFilled,
} from "@tabler/icons-react";
import defaultAvatar from "../assets/profile.jpg";
import "./Settings.css";
import { useState } from "react";

function ProfileSection() {
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };


  return (
    <section className="settings-profile-section">
      <div className="settings-profile-header">
        <h2>Edit Profile</h2>
        <p>Update your public details. Anything saved here can be viewed by anyone on the platform.</p>
      </div>

      <form className="settings-profile-form">
        <div className="settings-profile-avatar-group">
          <img
            src={avatarPreview}
            alt="Profile preview"
            className="settings-profile-avatar"
          />
          <div className="settings-profile-avatar-actions">
            <label htmlFor="avatar-upload" className="settings-avatar-upload-btn">
              Upload new
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/jpeg, image/png"
              onChange={handleImageChange}
              hidden
            />
          </div>
        </div>

        <div className="settings-profile-form-row">
          <div className="settings-profile-form-group">
            <label htmlFor="first-name">First Name</label>
            <input
              type="text"
              name="firstName"
              id="first-name"
              placeholder=""
            />
          </div>

          <div className="settings-profile-form-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              name="lastName"
              id="last-name"
              placeholder=""
            />
          </div>
        </div>

        <div className="settings-profile-form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder=""
          />
        </div>

        <div className="settings-profile-form-group">
          <label htmlFor="bio">Bio</label>
          <input
            className="settings-profile-bio-input"
            type="text"
            name="bio"
            id="bio"
            placeholder=""
          />
        </div>

        <div className="settings-profile-form-actions">
          <button type="reset" className="settings-btn-reset">
            Reset
          </button>
          <button type="submit" className="settings-btn-submit">
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="settings-security-section">
      <div className="settings-security-header">
        <h2>Account management</h2>
        <p>Make changes to your account here.</p>
      </div>
      <form className="settings-security-credentials">
        <div className="settings-security-input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder=""
          />
        </div>
        <div className="settings-security-input-group">
          <label htmlFor="new-password">New password</label>
          <input
            type="password"
            name="new-password"
            id="new-password"
            placeholder=""
          />
        </div>
        <div className="settings-security-input-group">
          <label htmlFor="dob">Date of birth</label>
          <input
            type="date"
            name="dob"
            id="dob"
          />
        </div>
        <div className="settings-profile-visibility-input">
          <label>Account visibility</label>
          <div className="settings-security-radio">
            <label htmlFor="public" className="settings-security-radio-label">
              <input
                type="radio"
                name="visibility"
                id="public"
                value="public"
                defaultChecked
              />
              <span className="settings-security-radio-title">Public</span>
            </label>
            <label htmlFor="private" className="settings-security-radio-label">
              <input
                type="radio"
                name="visibility"
                id="private"
                value="private"
              />
              <span className="settings-security-radio-title">Private</span>
            </label>
          </div>
        </div>
        <h2>Deactivation and deletion</h2>
        <div className="settings-security-danger-zone">
          <div className="settings-security-danger-item">
            <div>
              <h3>Deactivate account</h3>
              <p>Temporarily disable your account. You can reactivate it anytime by logging back in.</p>
            </div>
            <button type="button" className="settings-btn-deactivate">Deactivate</button>
          </div>
          <div className="settings-security-danger-item">
            <div>
              <h3>Delete account</h3>
              <p>Permanently delete your data and account. This action cannot be undone.</p>
            </div>
            <button type="button" className="settings-btn-delete">Delete Account</button>
          </div>
        </div>
        <div className="settings-profile-form-actions">
          <button type="reset" className="settings-btn-reset">
            Reset
          </button>
          <button type="submit" className="settings-btn-submit">
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}

export default function Settings() {
  const [activeNav, setActiveNav] = useState("profile");

  return (
    <main className="settings-page">
      <div className="settings-container">
        <aside className="settings-navigation">
          <button
            className={activeNav === "profile" ? "settings-nav-active" : ""}
            onClick={() => setActiveNav("profile")}
          >
            {activeNav === "profile" ? <IconUserFilled /> : <IconUser />}
            Edit profile
          </button>
          <button
            className={activeNav === "security" ? "settings-nav-active" : ""}
            onClick={() => setActiveNav("security")}
          >
            {activeNav === "security" ? <IconLockFilled /> : <IconLock />}
            Account
          </button>
        </aside>

        {activeNav === "profile" ? <ProfileSection /> : <SecuritySection />}
      </div>
    </main>
  );
}