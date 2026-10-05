import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { useNavigate } from "react-router";
import "./style/Login.css";
import Request from "../../util/Request";
import {
  alertError,
  alertSuccess,
} from "../../../swertalert/AlertSuccess";
import { setStoreUser } from "../../localStorage/userStore";

const Login = () => {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // Flow control states
  const [forget, setForget] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Inputs
  const [verifyOtp, setVerifyOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 1. Standard Login
  const handleLogin = async () => {
    if (!data.email || !data.password) {
      alertError({
        title: "Error",
        text: "Please enter email and password",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await Request("/api/user/login", "POST", {
        username: data.email,
        password: data.password,
      });

      if (!res) {
        alertError({
          title: "Error",
          text: "Login failed",
        });
        return;
      }

      if (res?.token) {
        setStoreUser(res.token, rememberMe);
      }

      alertSuccess({
        title: "Login Success",
        text: "Login successfully",
      });

      navigate("/");
    } catch (error) {
      // console.error("Login error:", error);
      alertError({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP
  const handleSendOtp = async () => {
    if (!data.email) {
      alertError({
        title: "Error",
        text: "Please enter your email",
      });
      return;
    }

    setLoadingOtp(true);
    try {
      const res = await Request("/api/user/sentOtp", "POST", {
        username: data.email,
      });

      if (!res) {
        alertError({
          title: "Error",
          text: res?.message || "Failed to send OTP",
        });
        return;
      }

      alertSuccess({
        title: "Success",
        text: "OTP sent to your email",
      });

      setOtpSent(true);
    } catch (error) {
      // console.error("Send OTP error:", error);
      alertError({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send OTP",
      });
    } finally {
      setLoadingOtp(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async () => {
    if (!verifyOtp) {
      alertError({
        title: "Error",
        text: "Please enter OTP",
      });
      return;
    }

    setLoadingVerifyOtp(true);
    try {
      const res = await Request("/api/user/verifyOtp", "POST", {
        username: data.email,
        otp: verifyOtp,
      });

      if (!res) {
        alertError({
          title: "Error",
          text: res?.message || "Invalid OTP",
        });
        return;
      }

      alertSuccess({
        title: "Success",
        text: "OTP verified successfully. Please enter your new password.",
      });

      setOtpVerified(true);
    } catch (error) {
      // console.error("Verify OTP error:", error);
      alertError({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Invalid OTP",
      });
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  // 4. Reset Password Endpoint Call
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alertError({
        title: "Error",
        text: "Please fill in both password fields",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      alertError({
        title: "Error",
        text: "Passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      alertError({
        title: "Error",
        text: "Password must be at least 6 characters long",
      });
      return;
    }

    setResetPasswordLoading(true);
    try {
      const res = await Request("/api/user/resetPassword", "POST", {
        username: data.email,
        otp: verifyOtp,
        newPassword: newPassword,
      });

      if (!res) {
        alertError({
          title: "Error",
          text: res?.message || "Failed to reset password",
        });
        return;
      }

      alertSuccess({
        title: "Success",
        text: "Password reset successfully! You can now log in.",
      });

      // Reset back to initial login state
      handleBackToLogin();
    } catch (error) {
      // console.error("Reset password error:", error);
      alertError({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to reset password",
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Form Submit Controller
  const UserLogin = async (e) => {
    e.preventDefault();

    if (forget) {
      // Step 1: Send OTP
      if (!otpSent) {
        await handleSendOtp();
        return;
      }

      // Step 2: Verify OTP
      if (!otpVerified) {
        await handleVerifyOtp();
        return;
      }

      // Step 3: Set New Password
      await handleResetPassword();
      return;
    }

    // Normal Login
    await handleLogin();
  };

  const handleForgotPassword = () => {
    setForget(true);
    setOtpSent(false);
    setOtpVerified(false);
    setVerifyOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setData((prev) => ({ ...prev, password: "" }));
  };

  const handleBackToLogin = () => {
    setForget(false);
    setOtpSent(false);
    setOtpVerified(false);
    setVerifyOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setData((prev) => ({ ...prev, password: "" }));
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>

      <div className="login-card">
        {/* LOGO */}
        <div className="logo">
          <img src="/imageCover/logoIct.jpg" alt="Logo" />
        </div>

        {/* HEADER */}
        <div className="header">
          <h1>
            {forget
              ? otpVerified
                ? "Set New Password"
                : otpSent
                  ? "Verify OTP"
                  : "Forgot Password"
              : "Welcome back!"}
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={UserLogin}>
          {/* EMAIL */}
          <div className="form-group">
            <label style={{ color: "white" }}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={data.email}
              disabled={loading || loadingOtp || loadingVerifyOtp || resetPasswordLoading || otpSent}
              onChange={handleChange}
            />
          </div>

          {/* LOGIN PASSWORD (Only in Standard Login Mode) */}
          {!forget && (
            <div className="form-group">
              <label style={{ color: "white" }}>Password</label>
              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={data.password}
                  disabled={loading}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* OTP INPUT (Step 2: Enter OTP) */}
          {forget && otpSent && !otpVerified && (
            <div className="form-group">
              <label style={{ color: "white" }}>OTP Code</label>
              <input
                type="text"
                name="verifyOtp"
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                value={verifyOtp}
                disabled={loadingVerifyOtp}
                onChange={(e) => setVerifyOtp(e.target.value)}
              />
            </div>
          )}

          {/* NEW PASSWORD INPUTS (Step 3: Reset Password) */}
          {forget && otpVerified && (
            <>
              <div className="form-group">
                <label style={{ color: "white" }}>New Password</label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Enter new password"
                    required
                    value={newPassword}
                    disabled={resetPasswordLoading}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={resetPasswordLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: "white" }}>Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  disabled={resetPasswordLoading}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {/* OPTIONS (Login Mode) */}
          {!forget && (
            <div className="options">
              <div
                className="remember"
                onClick={() => setRememberMe((prev) => !prev)}
              >
                <span className={`checkbox ${rememberMe ? "checked" : ""}`}>
                  {rememberMe && <Check size={14} />}
                </span>
                <span>Remember me</span>
              </div>

              <button
                type="button"
                className="forgot"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* BACK TO SIGN IN (Forgot Password Mode) */}
          {forget && (
            <div className="options">
              <button
                type="button"
                className="forgot"
                onClick={handleBackToLogin}
                disabled={loadingOtp || loadingVerifyOtp || resetPasswordLoading}
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* DYNAMIC SUBMIT BUTTON */}
          <button
            type="submit"
            className="login-button"
            disabled={loading || loadingOtp || loadingVerifyOtp || resetPasswordLoading}
          >
            {!forget && (loading ? "Loading..." : "Login")}
            {forget && !otpSent && (loadingOtp ? "Sending OTP..." : "Send OTP")}
            {forget && otpSent && !otpVerified && (loadingVerifyOtp ? "Verifying OTP..." : "Verify OTP")}
            {forget && otpVerified && (resetPasswordLoading ? "Resetting Password..." : "Reset Password")}
          </button>
        </form>

        {/* GOOGLE SIGN IN */}
        {!forget && (
          <>
            <div className="divider">
              <span></span>
              <p>Or</p>
              <span></span>
            </div>
            <button type="button" className="google-button">
              <span className="google-icon">G</span>
              Sign In with Google
            </button>
          </>
        )}

        {/* FOOTER NAV */}
        <p className="signup">
          {forget ? "Remember your password? " : "Don't have an account? "}
          {forget ? (
            <button type="button" onClick={handleBackToLogin}>
              Sign In
            </button>
          ) : (
            <button type="button" onClick={() => navigate("/register")}>
              Sign Up
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;