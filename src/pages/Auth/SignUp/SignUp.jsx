import "./SignUp.css";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Grainient from "../../../components/ui/Grainient/Grainient";

function SignUp() {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [passShow, setPassShow] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validateFields = () => {
    let fieldError = {};
    if (!formData.firstName) {
      fieldError.firstName = "First name is required";
    }
    if (!formData.lastName) {
      fieldError.lastName = "Last name is required";
    }
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
    <main className="signup-page">
      <div className="signup-container">
        <div className="signup-background-container">
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
          <div className="signup-hero-text">
            <span className="signup-hero-mark">Fable</span>
            <h2>Every image is something.</h2>
            <p>
              Save the marks that stay with you, and find your way back to them.
            </p>
          </div>
        </div>

        <div className="signup-cord">
          <div className="signup-card">
            <div className="signup-header">
              <h1>Let's get you set up</h1>
            </div>
            <form action="" className="signup-form" onSubmit={handleSubmit}>
              <div className="signup-name-group">
                <div className="signup-form-group">
                  <label htmlFor="first-name">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    id="first-name"
                    value={formData.firstName}
                    placeholder="Clark"
                    autoFocus
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <span className="signup-error-text">
                      {errors.firstName}
                    </span>
                  )}
                </div>
                <div className="signup-form-group">
                  <label htmlFor="last-name">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    id="last-name"
                    placeholder="Kent"
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <span className="signup-error-text">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  placeholder="e.g. clarkkent@email.com"
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="signup-error-text">{errors.email}</span>
                )}
              </div>
              <div className="signup-form-group">
                <span className="signup-pass">
                  <label htmlFor="password">Password</label>{" "}
                  {passShow ? (
                    <IconEye
                      size={20}
                      className="signup-pass-show-icon"
                      onClick={() => {
                        setPassShow(!passShow);
                      }}
                    />
                  ) : (
                    <IconEyeClosed
                      size={20}
                      className="signup-pass-show-icon"
                      onClick={() => {
                        setPassShow(!passShow);
                      }}
                    />
                  )}
                </span>
                <input
                  type={passShow ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  id="password"
                  placeholder="8+ characters"
                  onChange={handleChange}
                />
                {errors.password && (
                  <span className="signup-error-text">{errors.password}</span>
                )}
              </div>
              <button type="submit" className="signup-btn">
                Create account
              </button>
            </form>
          </div>
          <div className="signup-login-footer">
            <p>
              Already have an account? <Link to="/login"> Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignUp;
