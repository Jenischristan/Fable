import {
  IconLock,
  IconLockFilled,
  IconUser,
  IconUserFilled,
} from "@tabler/icons-react";
import "./Settings.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deactivateAccount,
  deleteAccount,
  getCurrentUser,
  updateCurrentUser,
} from "../../mocks/api";
import { useMockData } from "../../hooks/useMockData";
import { dateFormatter } from "../../utils/dateFormatter";
import Toast from "../../components/ui/Toast/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";

function ProfileSection({ showToast }) {
  useMockData();
  const user = getCurrentUser();
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);

  const initialProfile = {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio,
  };
  const [formData, setFormData] = useState(initialProfile);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = { ...formData };
    if (avatarPreview && avatarPreview !== user.avatarUrl) {
      updates.avatarUrl = avatarPreview;
    }
    updateCurrentUser(updates);
    showToast("Profile updated.");
  };

  const handleReset = () => {
    const current = getCurrentUser();
    setFormData({
      firstName: current.firstName,
      lastName: current.lastName,
      username: current.username,
      bio: current.bio,
    });
    setAvatarPreview(current.avatarUrl);
  };

  return (
    <section className="settings-profile-section">
      <form className="settings-profile-form" onSubmit={handleSubmit}>
        <div className="settings-profile-avatar-group">
          <img
            src={avatarPreview}
            alt="Profile preview"
            className="settings-profile-avatar"
          />
          <div className="settings-profile-avatar-actions">
            <label
              htmlFor="avatar-upload"
              className="settings-avatar-upload-btn"
            >
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
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="settings-profile-form-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              name="lastName"
              id="last-name"
              placeholder=""
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="settings-profile-form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
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
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="settings-profile-form-actions">
          <button type="button" className="settings-btn-reset" onClick={handleReset}>
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

function SecuritySection({ showToast }) {
  useMockData();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const initialSecurity = {
    email: user.email,
    dob: dateFormatter(user.dob),
    visibility: user.visibility,
    password: "",
  };
  const [formData, setFormData] = useState(initialSecurity);
  const [dialog, setDialog] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = {
      email: formData.email,
      dob: formData.dob,
      visibility: formData.visibility,
    };
    if (formData.password) {
      updates.password = formData.password;
    }
    updateCurrentUser(updates);
    setFormData((prev) => ({ ...prev, password: "" }));
    showToast("Account settings saved.");
  };

  const handleReset = () => {
    const current = getCurrentUser();
    setFormData({
      email: current.email,
      dob: dateFormatter(current.dob),
      visibility: current.visibility,
      password: "",
    });
  };

  return (
    <section className="settings-security-section">
      <form className="settings-security-credentials" onSubmit={handleSubmit}>
        <div className="settings-security-input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=""
          />
        </div>
        <div className="settings-security-input-group">
          <label htmlFor="new-password">New password</label>
          <input
            type="password"
            name="password"
            id="new-password"
            placeholder="Enter a new password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="settings-security-input-group">
          <label htmlFor="dob">Date of birth</label>
          <input
            type="date"
            name="dob"
            id="dob"
            value={formData.dob}
            onChange={handleChange}
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
                checked={formData.visibility === "public"}
                onChange={handleChange}
              />
              <span className="settings-security-radio-title">Public</span>
            </label>
            <label htmlFor="private" className="settings-security-radio-label">
              <input
                type="radio"
                name="visibility"
                id="private"
                value="private"
                checked={formData.visibility === "private"}
                onChange={handleChange}
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
              <p>
                Temporarily disable your account. You can reactivate it anytime
                by logging back in.
              </p>
            </div>
            <button
              type="button"
              className="settings-btn-deactivate"
              onClick={() => setDialog("deactivate")}
            >
              Deactivate
            </button>
          </div>
          <div className="settings-security-danger-item">
            <div>
              <h3>Delete account</h3>
              <p>
                Permanently delete your data and account. This action cannot be
                undone.
              </p>
            </div>
            <button
              type="button"
              className="settings-btn-delete"
              onClick={() => setDialog("delete")}
            >
              Delete Account
            </button>
          </div>
        </div>
        <div className="settings-profile-form-actions">
          <button type="button" className="settings-btn-reset" onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className="settings-btn-submit">
            Save Changes
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={dialog === "deactivate"}
        title="Deactivate your account?"
        message="Your profile and posts will be hidden until you log back in. Nothing is deleted."
        confirmLabel="Deactivate"
        danger
        onConfirm={() => {
          deactivateAccount();
          navigate("/login");
        }}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === "delete"}
        title="Delete your account?"
        message="This permanently deletes your account, posts, and all saved data. This cannot be undone."
        options={["I understand this is permanent", "Keep my account"]}
        confirmLabel="Delete account"
        danger
        onConfirm={(value) => {
          if (value === "I understand this is permanent") {
            deleteAccount();
            navigate("/login");
          }
        }}
        onClose={() => setDialog(null)}
      />
    </section>
  );
}

export default function Settings() {
  const [activeNav, setActiveNav] = useState("profile");
  const [toastMessage, setToastMessage] = useState("");

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

        {activeNav === "profile" ? (
          <ProfileSection showToast={setToastMessage} />
        ) : (
          <SecuritySection showToast={setToastMessage} />
        )}
      </div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </main>
  );
}
