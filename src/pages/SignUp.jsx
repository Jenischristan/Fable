import "./SignUp.css";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useState } from "react";
import googleLogo from "../assets/google-logo.svg"
import DriftWall from "../components/DriftWall";

function SignUp() {
  const [passShow,setPassShow] = useState(false)

  return (
    <main className="signup-page">
      <div className="signup-container">
        <div className="signup-image">
          {/* <img src={signupImage} alt="image" /> */}
        <DriftWall />
        </div>

        <div className="signup-card">
          <div className="signup-nav">
            <span>Logo</span>
            <button><a href="/login">Log In</a></button>
          </div>
          <div className="signup-header">
            <h1>Create an account</h1>
          </div>
          <form action="" className="signup-form">
            <div className="signup-name-group">
              <div className="signup-form-group">
                <label htmlFor="">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  id="first-name"
                  placeholder="Clark"
                  required
                />
              </div>
              <div className="signup-form-group">
                <label htmlFor="">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  id="last-name"
                  placeholder="Kent"
                  required
                />
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="e.g. clarkkent@email.com"
                required
              />
            </div>
            <div className="signup-form-group">
              <span className="signup-pass">
                <label htmlFor="">Password</label> {passShow ? <IconEye size={20} className="signup-pass-show-icon" onClick={ () => {setPassShow(!passShow)}} /> : <IconEyeClosed size={20} className="signup-pass-show-icon" onClick={ () => {setPassShow(!passShow)}} />} 
              </span>
              <input
               type={passShow ? "text" : "password"}
                name="password"
                id="password"
                placeholder="8+ characters"
                minLength={8}
                required
              />
            </div>
            <button type="submit" className="signup-btn">
              Create account
            </button>
          </form>

          <div className="signup-divider">
            <span>OR</span>
          </div>

          <div className="signup-google">

            <button className="signup-google-btn">
              <img className="google-signup-logo" src={googleLogo} />Continue with Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignUp;
