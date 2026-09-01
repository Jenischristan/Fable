import "./Profile.css";
import ProfileImg from "../../assets/profile.jpg";
import { useState } from "react";

export default function Profile() {
  const [activeButton, setActiveButton] = useState("left");
  return (
    <main className="profile-page">
      <div className="profile-page-card">
        <div className="profile-page-avatar-container">
          <img src={ProfileImg} alt="profile image" />
        <div className="profile-page-card-info">
          
            <span className="profile-page-card-username">Clark Kent</span>
            <span className="profile-page-card-handle">@clarkkent</span>
        </div>
         </div>
        

          <p className="profile-page-card-bio">
            Just a guy from Kansas trying to make deadline.
          </p>
          <div className="profile-card-follow">
            <button>
              <span className="profile-followers-count">0</span> <p className="profile-page-follow-text">Followers</p>
            </button>
            <span className="dot"></span>
            <button>
              <span className="profile-following-count">0</span> <p className="profile-page-follow-text">Following</p>
            </button>
          </div>
          {/* <button className="profile-card-edit-btn">
            <IconEdit size={20} />
            Edit Profile
          </button> */}
       
      </div>
      <div className="profile-page-navigation">
        <button
          className={activeButton === "left" ? "profile-btn-active" : ""}
          onClick={() => setActiveButton("left")}
        >
          Created
        </button>
        <button
          className={activeButton === "right" ? "profile-btn-active" : ""}
          onClick={() => setActiveButton("right")}
        >
          Saved
        </button>
      </div>
    </main>
  );
}
