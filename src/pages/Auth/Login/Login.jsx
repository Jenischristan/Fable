import "./Login.css";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Grainient from "../../../components/ui/Grainient/Grainient";

function Login() {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [passShow, setPassShow] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const [errors, setErrors] = useState({});

  const validateFields = () => {
    let fieldError = {};
    if (!formData.email) {
      fieldError.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      fieldError.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      fieldError.password = "Password is required";
    } else if (formData.password.length < 8) {
      fieldError.password = "Password must be atleast 8 characters";
    }
    return fieldError;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log("Form submitted succesfully");
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-background-container">
          <Grainient
            className="grainient-rounded"
               color1="#c1c1c1"
            color2="#000000"
            color3="#0f8adc"
            timeSpeed={0.65}
            colorBalance={0.18}
            warpStrength={1}
            warpFrequency={5.2}
            warpSpeed={0.8}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.06}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerOffsetX={0}
            centerOffsetY={0}
            zoom={0.9}
          />
          <div className="login-hero-text">
            <span className="login-hero-mark">Fable</span>
            <h2>Pick up right where you left off.</h2>
            <p>Your saved marks are exactly where you left them.</p>
          </div>
        </div>

        <div className="login-cord">
          <div className="login-card">
            <div className="login-header">
              <h1>Welcome back</h1>
            </div>
            <form action="" className="login-form" onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  placeholder="e.g. clarkkent@email.com"
                  autoFocus
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="login-error-text">{errors.email}</span>
                )}
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
                  value={formData.password}
                  placeholder="Enter your password"
                  onChange={handleChange}
                />
                {errors.password && (
                  <span className="login-error-text">{errors.password}</span>
                )}
              </div>

              <div className="login-forgot">
                <a href="/forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="login-btn">
                Log In
              </button>
            </form>
          </div>
          <div className="login-signup-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
