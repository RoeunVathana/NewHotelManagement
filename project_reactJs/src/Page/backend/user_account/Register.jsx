import { useState } from "react";
import { Eye, EyeOff, Camera } from "lucide-react";
import { useNavigate } from "react-router";
import "./style/register.css";
import Request from "../../util/Request";
import { alertError, alertSuccess } from "../../../swertalert/AlertSuccess";

const Register = () => {
  // Show / Hide Password
  const [showPassword, setShowPassword] = useState(false);

  // Image Preview
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();
  // Form Data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    gender: "",
    phone: "",
    address: "",
    image: null,
  });

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // HANDLE IMAGE
  // =========================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      setPreview(URL.createObjectURL(file));
    }
  };

  // =========================
  // HANDLE SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
        const res = await Request("/api/user", "POST", formData);
        if(res){
          alertSuccess({text: res.message});
          navigate("/login");
        } 
    }catch(error){
      alertError({title: "Error!", text: error?.response?.data?.message});
    }
  };

  return (
    <div className="register-page">
      {/* Background Overlay */}
      <div className="overlay"></div>

      {/* Register Card */}
      <div className="register-card">
        {/* =========================
            LOGO
        ========================= */}

        {/* <div className="logo">
          <User size={40} strokeWidth={1.5} />
        </div> */}

        {/* =========================
            HEADER
        ========================= */}

        {/* <div className="header">
          <h1>Create Account</h1>

          <p>Create your account and start your personal journey</p>
        </div> */}

        {/* =========================
            REGISTER FORM
        ========================= */}

        <form onSubmit={handleSubmit}>
          {/* =========================
              IMAGE UPLOAD
          ========================= */}

          <div className="image-upload">
            <div className="image-preview">
              {preview ? (
                <img src={preview} alt="Profile" />
              ) : (
                <Camera size={30} />
              )}
            </div>

            <label htmlFor="image" className="upload-button">
              Upload Profile Image
            </label>

            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </div>

          {/* =========================
              USERNAME + PASSWORD
          ========================= */}

          <div className="two-column">
            {/* Username */}

            <div className="form-group">
              <label style={{color: "white"}}>Username</label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>

            {/* Password */}

            <div className="form-group">
              <label style={{color: "white"}}>Password</label>

              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* =========================
              FIRST NAME + LAST NAME
          ========================= */}

          <div className="two-column">
            {/* First Name */}

            <div className="form-group">
              <label style={{color: "white"}}>First Name</label>

              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            {/* Last Name */}

            <div className="form-group">
              <label style={{color: "white"}}>Last Name</label>

              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          {/* =========================
              GENDER + PHONE
          ========================= */}

          <div className="two-column">
            {/* Gender */}

            <div className="form-group">
              <label style={{color: "white"}}>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>

                <option value="male">Male</option>

                <option value="female">Female</option>

                <option value="other">Other</option>
              </select>
            </div>

            {/* Phone */}

            <div className="form-group">
              <label style={{color: "white"}}>Phone</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          {/* =========================
              ADDRESS
          ========================= */}

          <div className="form-group">
            <label style={{color: "white"}}>Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows="3"
              required
            />
          </div>

          {/* =========================
              REGISTER BUTTON
          ========================= */}

          <button type="submit" className="register-button">
            Create Account
          </button>
        </form>

        {/* =========================
            LOGIN LINK
        ========================= */}

        <p className="login-link">
          Already have an account?
          <button
            type="button"
            onClick={() => {
              navigate("/login");
            }}
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
