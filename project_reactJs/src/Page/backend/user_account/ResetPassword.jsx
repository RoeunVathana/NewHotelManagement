import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Request from "../../util/Request";
import { alertError, alertSuccess } from "../../../swertalert/AlertSuccess";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state passed from Login navigation
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Guard against direct URL access without payload
  if (!email || !otp) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Invalid Reset Request</h2>
          <p style={{ color: "#fff" }}>Please request a password reset again.</p>
          <button className="login-button" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alertError({ title: "Error", text: "Passwords do not match!" });
      return;
    }

    if (password.length < 6) {
      alertError({ title: "Error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);

    try {
      const res = await Request("/api/user/resetPassword", "POST", {
        username: email,
        otp: otp,
        newPassword: password,
      });

      if (res) {
        alertSuccess({
          title: "Success",
          text: "Password reset successfully. Please login.",
        });
        navigate("/login");
      }
    } catch (error) {
      alertError({
        title: "Error",
        text: error?.response?.data?.message || error?.message || "Reset failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="header">
          <h1>Reset Password</h1>
          <p style={{ color: "#ccc" }}>Enter new password for {email}</p>
        </div>

        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label style={{ color: "white" }}>New Password</label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={{ color: "white" }}>Confirm Password</label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;