import "./LogIn.css";
// import loginImage from "../assets/signup.png";  Use your login image asset here
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useState } from "react";
import googleLogo from "../assets/google-logo.svg";
import DriftWall from "../components/DriftWall";

function LogIn() {
  const [passShow, setPassShow] = useState(false);

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-image">
          <DriftWall />
          {/* <img src={loginImage} alt="Login Banner" /> */}
        </div>

        <div className="login-card">
          <div className="login-nav">
            <span>Logo</span>
            <button>
              <a href="/signup">Sign Up</a>
            </button>
          </div>

          <div className="login-header">
            <h1>Welcome back</h1>
          </div>

          <form action="" className="login-form">
            <div className="login-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="e.g. clarkkent@email.com"
                required
              />
            </div>

            <div className="login-form-group">
              <div className="login-pass">
                <label htmlFor="password">Password</label>
                {passShow ? (
                  <IconEye
                    size={20}
                    className="login-pass-show-icon"
                    onClick={() => setPassShow(!passShow)}
                  />
                ) : (
                  <IconEyeClosed
                    size={20}
                    className="login-pass-show-icon"
                    onClick={() => setPassShow(!passShow)}
                  />
                )}
              </div>
              <input
                type={passShow ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                minLength={8}
                required
              />
            </div>

            <div className="login-forgot">
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="login-google">
            <button type="button" className="login-google-btn">
              <img className="google-login-logo" src={googleLogo} alt="Google logo" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LogIn;