import React, { useState, useEffect } from "react";
import RoleModal from "../Components/ModalBox";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react";
import "../Components/Assets/Style/LoginSignup.css";

import bgimg from "../Components/Assets/Images/login-signup.jpg";

const LoginSignup = () => {
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [action, setAction] = useState("Sign Up");
  const [modalType, setModalType] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    region: "",
    gender: "",
    pic: "",
    dob: "",
    phone: "",
    address: "",
    qualification: "", // For teachers
    // experience: "", // For teachers
    courses: "", // For teachers
    // studentGrade: "", // For students
    parentOf: "", // For parents
    usernameSuffix: "",
    spic: "",
    cnic: "",
  });

  // Password strength criteria
  const passwordCriteria = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "At least one uppercase letter" },
    { regex: /[a-z]/, text: "At least one lowercase letter" },
    { regex: /[0-9]/, text: "At least one number" },
    { regex: /[^A-Za-z0-9]/, text: "At least one special character" },
  ];

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      passwordCriteria.forEach((criterion) => {
        if (criterion.regex.test(formData.password)) {
          strength++;
        }
      });
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (action === "Sign Up") {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
      if (!formData.address) newErrors.address = "Address is required";
    }

    // username validation
    // if (!formData.username) {
    //   newErrors.username = "Username is required";
    // } else {
    //   if (
    //     selectedRole === "student" &&
    //     !formData.username.startsWith("student_")
    //   ) {
    //     formData.username = "student_" + formData.username;
    //   } else if (
    //     selectedRole === "teacher" &&
    //     !formData.username.startsWith("teacher_")
    //   ) {
    //     formData.username = "teacher_" + formData.username;
    //   } else if (
    //     selectedRole === "parent" &&
    //     !formData.username.startsWith("teacher_")
    //   ) {
    //     formData.username = "teacher_" + formData.username; // as per your instruction
    //   }
    // }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Role-specific validation
    if (selectedRole === "teacher") {
      if (!formData.qualification)
        newErrors.qualification = "Qualification is required";
      if (!formData.experience) newErrors.experience = "Experience is required";
      if (!formData.courses) newErrors.courses = "courses are required";
    } else if (selectedRole === "parent") {
      if (!formData.parentOf) newErrors.parentOf = "Student username is required";
      if (!formData.cnic) newErrors.cnic = "CNIC is required";
      if (!formData.region) newErrors.region = "Region is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole === "student" && action === "Sign Up") {
        // Prepare payload for Flask API
        const payload = {
          name: formData.firstName + " " + formData.lastName,
          dob: formData.dob,
          username: `${selectedRole}_${formData.usernameSuffix}`,
          region: formData.region,
          password: formData.password,
          gender: formData.gender[0],
          spic: formData.spic,
        };

        const response = await fetch("http://localhost:5000/SignUpStudents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 409) {
          const data = await response.json();
          setErrors({ form: data.error });
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          setErrors({ form: "An error occurred. Please try again." });
          setIsLoading(false);
          return;
        }

        // Success
        alert("Account created successfully!");
        navigate(`/${payload.username}/dashboard`);
      } else if (selectedRole === "parent" && action === "Sign Up") {
        const payload = {
          name: formData.firstName + " " + formData.lastName,
          region: formData.region,
          cnic: formData.cnic,
          username: `parent_${formData.usernameSuffix}`,
          password: formData.password,
          student_username: formData.parentOf,
        };

        const response = await fetch("http://localhost:5000/SignupParent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 409) {
          const data = await response.json();
          setErrors({ form: data.error });
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          setErrors({ form: "An error occurred. Please try again." });
          setIsLoading(false);
          return;
        }

        // Success
        alert("Account created successfully!");
        navigate(`/${payload.username}/dashboard`);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Form submitted:", {
          ...formData,
          role: selectedRole,
          rememberMe,
        });

        navigate(`/${formData.username}/dashboard`);

        // Show success message
        alert(
          action === "Login"
            ? "Login successful!"
            : "Account created successfully!"
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStrength = () => {
    const getColor = () => {
      if (passwordStrength <= 1) return "#ff4d4d";
      if (passwordStrength <= 3) return "#ffaa00";
      return "#00cc44";
    };

    const getLabel = () => {
      if (passwordStrength <= 1) return "Weak";
      if (passwordStrength <= 3) return "Medium";
      return "Strong";
    };

    return (
      <div className="password-strength">
        <div className="strength-bars">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`strength-bar ${
                index < passwordStrength ? "active" : ""
              }`}
              style={{
                backgroundColor: index < passwordStrength ? getColor() : "",
              }}
            ></div>
          ))}
        </div>
        {formData.password && (
          <div className="strength-label" style={{ color: getColor() }}>
            {getLabel()}
          </div>
        )}
      </div>
    );
  };

  const renderPasswordCriteria = () => {
    return (
      <div className="password-criteria">
        {passwordCriteria.map((criterion, index) => (
          <div key={index} className="criterion">
            {criterion.regex.test(formData.password) ? (
              <CheckCircle size={16} className="criterion-icon valid" />
            ) : (
              <XCircle size={16} className="criterion-icon invalid" />
            )}
            <span>{criterion.text}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case "teacher":
        return (
          <>
            <div className="input">
              <label htmlFor="qualification">
                <GraduationCap size={18} className="input-icon" />
                Qualification
              </label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                className={`textfield ${errors.qualification ? "error" : ""}`}
                placeholder="Enter your qualifications"
                value={formData.qualification}
                onChange={handleInputChange}
              />
              {errors.qualification && (
                <div className="error-message">{errors.qualification}</div>
              )}
            </div>
            <div className="input">
              <label htmlFor="experience">
                <Briefcase size={18} className="input-icon" />
                Years of Experience
              </label>
              <input
                type="number"
                id="experience"
                name="experience"
                className={`textfield ${errors.experience ? "error" : ""}`}
                placeholder="Enter years of experience"
                value={formData.experience}
                onChange={handleInputChange}
              />
              {errors.experience && (
                <div className="error-message">{errors.experience}</div>
              )}
            </div>
            <div className="input">
              <label htmlFor="courses">
                <BookOpen size={18} className="input-icon" />
                courses You Can Teach
              </label>
              <input
                type="text"
                id="courses"
                name="courses"
                className={`textfield ${errors.courses ? "error" : ""}`}
                placeholder="e.g., Quran Recitation, Tajweed, Arabic"
                value={formData.courses}
                onChange={handleInputChange}
              />
              {errors.courses && (
                <div className="error-message">{errors.courses}</div>
              )}
            </div>
          </>
        );
      case "student":
        return (
          <>
            {/* <div className="input">
              <label htmlFor="studentGrade">
                <BookOpen size={18} className="input-icon" />
                Grade Level
              </label>
              <input
                type="text"
                id="studentGrade"
                name="studentGrade"
                className={`textfield ${errors.studentGrade ? "error" : ""}`}
                placeholder="Enter your grade level"
                value={formData.studentGrade}
                onChange={handleInputChange}
              />
              {errors.studentGrade && (
                <div className="error-message">{errors.studentGrade}</div>
              )}
            </div> */
            /* <div className="input">
              <label htmlFor="region">Region</label>
              <input
                type="text"
                id="region"
                name="region"
                className="textfield"
                placeholder="Enter your region"
                value={formData.region || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="input">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                className="textfield"
                value={formData.gender || ""}
                onChange={handleInputChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="input">
              <label htmlFor="spic">Profile Image URL</label>
              <input
                type="text"
                id="spic"
                name="spic"
                className="textfield"
                placeholder="Enter image URL"
                value={formData.spic || ""}
                onChange={handleInputChange}
              />
            </div> */}
          </>
        );
      case "parent":
        return (
          <>
            <div className="input">
              <label htmlFor="parentOf">
                <Users size={18} className="input-icon" />
                Parent of (Student Username)
              </label>
              <input
                type="text"
                id="parentOf"
                name="parentOf"
                className={`textfield ${errors.parentOf ? "error" : ""}`}
                placeholder="Enter student's username"
                value={formData.parentOf}
                onChange={handleInputChange}
              />
              {errors.parentOf && (
                <div className="error-message">{errors.parentOf}</div>
              )}
            </div>
            <div className="input">
              <label htmlFor="cnic">CNIC</label>
              <input
                type="text"
                id="cnic"
                name="cnic"
                className="textfield"
                placeholder="Enter your CNIC"
                value={formData.cnic || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="input">
              <label htmlFor="region">Region</label>
              <input
                type="text"
                id="region"
                name="region"
                className="textfield"
                placeholder="Enter your region"
                value={formData.region || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="header">
          <div className="title">{action}</div>
          {!selectedRole && (
            <p className="role-prompt">Please select your role to continue</p>
          )}
          {errors.form && <div className="form-error">{errors.form}</div>}
        </div>

        {selectedRole ? (
          <form onSubmit={handleSubmit}>
            <div className="inputs">
              {action === "Sign Up" && (
                <>
                  {/* First Name */}
                  <div className="input">
                    <label htmlFor="firstName">
                      <User size={18} className="input-icon" />
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`textfield ${errors.firstName ? "error" : ""}`}
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required={action === "Sign Up"}
                    />
                    {errors.firstName && (
                      <div className="error-message">{errors.firstName}</div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="input">
                    <label htmlFor="lastName">
                      <User size={18} className="input-icon" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={`textfield ${errors.lastName ? "error" : ""}`}
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required={action === "Sign Up"}
                    />
                    {errors.lastName && (
                      <div className="error-message">{errors.lastName}</div>
                    )}
                  </div>
                </>
              )}

              {/* username */}
              <div className="input">
                <label htmlFor="username">
                  <User size={18} className="input-icon" />
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`textfield ${errors.username ? "error" : ""}`}
                  value={`${selectedRole}_` + (formData.usernameSuffix || "")}
                  onChange={(e) => {
                    const input = e.target.value;
                    const prefix = `${selectedRole}_`;
                    if (input.startsWith(prefix)) {
                      setFormData({
                        ...formData,
                        usernameSuffix: input.slice(prefix.length),
                      });
                    }
                  }}
                  required
                  placeholder={`${selectedRole}_yourname`}
                />
                {errors.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>

              {action === "Sign Up" && (
                <>
                  {/* Phone */}
                  <div className="input">
                    <label htmlFor="phone">
                      <Phone size={18} className="input-icon" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`textfield ${errors.phone ? "error" : ""}`}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required={action === "Sign Up"}
                    />
                    {errors.phone && (
                      <div className="error-message">{errors.phone}</div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="input">
                    <label htmlFor="dob">
                      <Calendar size={18} className="input-icon" />
                      Date of Birth
                    </label>
                    <div className="date-input-container">
                      <input
                        type="date"
                        id="dob"
                        name="dob"
                        className={`textfield styled-date-input ${
                          errors.dob ? "error" : ""
                        }`}
                        value={formData.dob}
                        onChange={handleInputChange}
                        onFocus={() => setIsDateFocused(true)}
                        onBlur={(e) => setIsDateFocused(e.target.value !== "")}
                        required={action === "Sign Up"}
                      />
                      {!formData.dob && !isDateFocused && (
                        <span className="date-placeholder">Select a date</span>
                      )}
                    </div>
                    {errors.dob && (
                      <div className="error-message">{errors.dob}</div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="input">
                    <label htmlFor="address">
                      <MapPin size={18} className="input-icon" />
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className={`textfield ${errors.address ? "error" : ""}`}
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required={action === "Sign Up"}
                    />
                    {errors.address && (
                      <div className="error-message">{errors.address}</div>
                    )}
                  </div>

                  <div className="input">
                    <label htmlFor="region">Region</label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      className="textfield"
                      placeholder="Enter your region"
                      value={formData.region || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      className="textfield"
                      value={formData.gender || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                  <div className="input">
                    <label htmlFor="spic">Profile Image URL</label>
                    <input
                      type="text"
                      id="spic"
                      name="spic"
                      className="textfield"
                      placeholder="Enter image URL"
                      value={formData.spic || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Role-specific fields */}
                  {renderRoleSpecificFields()}
                </>
              )}

              {/* Password */}
              <div className="input">
                <label htmlFor="password">
                  <Lock size={18} className="input-icon" />
                  Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`textfield ${errors.password ? "error" : ""}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
                {action === "Sign Up" &&
                  formData.password &&
                  renderPasswordStrength()}
                {action === "Sign Up" &&
                  formData.password &&
                  renderPasswordCriteria()}
              </div>

              {/* Confirm Password - only for Sign Up */}
              {action === "Sign Up" && (
                <div className="input">
                  <label htmlFor="confirmPassword">
                    <Lock size={18} className="input-icon" />
                    Confirm Password
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`textfield ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={action === "Sign Up"}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="error-message">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me & Forgot Password - only for Login */}
              {action === "Login" && (
                <div className="login-options">
                  <div className="remember-me">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="rememberMe">Remember me</label>
                  </div>
                  <a href="#" className="forgot-password">
                    Forgot password?
                  </a>
                </div>
              )}
            </div>

            <div className="buttons">
              <button
                type="submit"
                className={`submit ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>
                      {action === "Login" ? "Logging in..." : "Signing up..."}
                    </span>
                  </>
                ) : (
                  action
                )}
              </button>
              <button
                type="button"
                className="submit gray"
                onClick={() => {
                  setSelectedRole(null);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    username: "",
                    password: "",
                    confirmPassword: "",
                    dob: "",
                    phone: "",
                    address: "",
                    qualification: "",
                    experience: "",
                    courses: "",
                    // studentGrade: "",
                    parentOf: "",
                    region: "",
                    gender: "",
                    spic: "",
                    student_username: "",
                    cnic: "",
                  });
                  setErrors({});
                }}
              >
                Change Role
              </button>
            </div>

            {/* Switch between Login and Sign Up */}
            <div className="switch-action">
              {action === "Login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="switch-button"
                    onClick={() => {
                      setAction("Sign Up");
                      setModalType("signup");
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="switch-button"
                    onClick={() => {
                      setAction("Login");
                      setModalType("login");
                    }}
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="buttons">
            <div
              className={action === "Login" ? "submit gray" : "submit"}
              onClick={() => setModalType("signup")}
            >
              Sign Up
            </div>
            <div
              className={action === "Sign Up" ? "submit gray" : "submit"}
              onClick={() => setModalType("login")}
            >
              Login
            </div>
          </div>
        )}
      </div>
      <div className="image">
        <img
          className="bgimg"
          src={bgimg || "/placeholder.svg"}
          alt="background"
        />
      </div>

      {/* Role selection modal */}
      {modalType && (
        <RoleModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSelect={(role) => {
            setModalType(null);
            setSelectedRole(role);
            setAction(modalType === "login" ? "Login" : "Sign Up");
          }}
        />
      )}
    </div>
  );
};

export default LoginSignup;
