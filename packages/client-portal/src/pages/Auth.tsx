import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { FiUser, FiLock, FiMail, FiPhone } from "react-icons/fi";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [userType, setUserType] = useState("member");
  const { login, register, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate(userType === "member" ? "/member" : "/trainer");
    }
  }, [user, userType, navigate, isLoading]);

  // Login form validation schema
  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  // Registration form validation schema
  const registerSchema = Yup.object({
    full_name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    ...(userType === "member"
      ? {
          phone: Yup.string().required("Phone number is required"),
        }
      : {}),
    ...(userType === "trainer"
      ? {
          specialization: Yup.string().required("Specialization is required"),
          experience_years: Yup.number()
            .min(0, "Years of experience must be at least 0")
            .required("Years of experience is required"),
        }
      : {}),
  });

  // Login form
  const loginFormik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.email, values.password, userType as any);
        toast.success(`Logged in successfully as ${userType}`);
        navigate(userType === "member" ? "/member" : "/trainer");
      } catch (error: any) {
        // toast.error(
        //   error.response?.data?.message || "Failed to login. Please try again."
        // );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Register form
  const registerFormik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      specialization: "",
      experience_years: 0,
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const userData = {
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          ...(userType === "member"
            ? {
                phone: values.phone,
              }
            : {}),
          ...(userType === "trainer"
            ? {
                specialization: values.specialization,
                experience_years: values.experience_years,
              }
            : {}),
        };

        await register(userData, userType as any);
        toast.success(`Registered successfully as ${userType}`);

        // Reset form and switch to login tab
        resetForm();
        setActiveTab("login");

        if (userType === "trainer") {
          toast.success(
            "Your account is pending approval by admin. You will be notified once approved."
          );
        }
      } catch (error: any) {
        // toast.error(
        //   error.response?.data?.message ||
        //     "Registration failed. Please try again."
        // );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="bg-secondary rounded-lg shadow-lg p-6 md:p-8">
      {/* User Type Tabs */}
      <div className="tabs tabs-boxed bg-neutral mb-6">
        <button
          className={`tab flex-1 ${
            userType === "member" ? "bg-primary text-white" : "text-white"
          }`}
          onClick={() => setUserType("member")}
        >
          Member
        </button>
        <button
          className={`tab flex-1 ${
            userType === "trainer" ? "bg-primary text-white" : "text-white"
          }`}
          onClick={() => setUserType("trainer")}
        >
          Trainer
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {userType === "member" ? "Member" : "Trainer"}{" "}
        {activeTab === "login" ? "Login" : "Registration"}
      </h2>

      {/* Login/Register Tabs */}
      <div className="tabs tabs-boxed bg-neutral mb-6">
        <button
          className={`tab flex-1 ${
            activeTab === "login" ? "bg-primary text-white" : "text-white"
          }`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button
          className={`tab flex-1 ${
            activeTab === "register" ? "bg-primary text-white" : "text-white"
          }`}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
      </div>

      {/* Login Form */}
      {activeTab === "login" && (
        <form onSubmit={loginFormik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiMail />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                  loginFormik.errors.email && loginFormik.touched.email
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                value={loginFormik.values.email}
                onChange={loginFormik.handleChange}
                onBlur={loginFormik.handleBlur}
              />
            </div>
            {loginFormik.errors.email && loginFormik.touched.email && (
              <p className="text-red-500 text-xs mt-1">
                {loginFormik.errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                  loginFormik.errors.password && loginFormik.touched.password
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                value={loginFormik.values.password}
                onChange={loginFormik.handleChange}
                onBlur={loginFormik.handleBlur}
              />
            </div>
            {loginFormik.errors.password && loginFormik.touched.password && (
              <p className="text-red-500 text-xs mt-1">
                {loginFormik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-accent text-white py-2 rounded-md transition duration-200 font-semibold"
            disabled={loginFormik.isSubmitting}
          >
            {loginFormik.isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === "register" && (
        <form onSubmit={registerFormik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiUser />
              </div>
              <input
                type="text"
                name="full_name"
                placeholder="Enter your full name"
                className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                  registerFormik.errors.full_name &&
                  registerFormik.touched.full_name
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                value={registerFormik.values.full_name}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
              />
            </div>
            {registerFormik.errors.full_name &&
              registerFormik.touched.full_name && (
                <p className="text-red-500 text-xs mt-1">
                  {registerFormik.errors.full_name}
                </p>
              )}
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiMail />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                  registerFormik.errors.email && registerFormik.touched.email
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                value={registerFormik.values.email}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
              />
            </div>
            {registerFormik.errors.email && registerFormik.touched.email && (
              <p className="text-red-500 text-xs mt-1">
                {registerFormik.errors.email}
              </p>
            )}
          </div>

          {userType === "member" && (
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiPhone />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                    registerFormik.errors.phone && registerFormik.touched.phone
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={registerFormik.values.phone}
                  onChange={registerFormik.handleChange}
                  onBlur={registerFormik.handleBlur}
                />
              </div>
              {registerFormik.errors.phone && registerFormik.touched.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {registerFormik.errors.phone}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                  registerFormik.errors.password &&
                  registerFormik.touched.password
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                value={registerFormik.values.password}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
              />
            </div>
            {registerFormik.errors.password &&
              registerFormik.touched.password && (
                <p className="text-red-500 text-xs mt-1">
                  {registerFormik.errors.password}
                </p>
              )}
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock />
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                  registerFormik.errors.confirmPassword &&
                  registerFormik.touched.confirmPassword
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                value={registerFormik.values.confirmPassword}
                onChange={registerFormik.handleChange}
                onBlur={registerFormik.handleBlur}
              />
            </div>
            {registerFormik.errors.confirmPassword &&
              registerFormik.touched.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {registerFormik.errors.confirmPassword}
                </p>
              )}
          </div>

          {/* Trainer-specific fields */}
          {userType === "trainer" && (
            <>
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  placeholder="e.g., Yoga, Strength Training, HIIT"
                  className={`w-full px-3 py-2 rounded-md bg-neutral text-white border ${
                    registerFormik.errors.specialization &&
                    registerFormik.touched.specialization
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={registerFormik.values.specialization}
                  onChange={registerFormik.handleChange}
                  onBlur={registerFormik.handleBlur}
                />
                {registerFormik.errors.specialization &&
                  registerFormik.touched.specialization && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerFormik.errors.specialization}
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  placeholder="e.g., 3"
                  className={`w-full px-3 py-2 rounded-md bg-neutral text-white border ${
                    registerFormik.errors.experience_years &&
                    registerFormik.touched.experience_years
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={registerFormik.values.experience_years}
                  onChange={registerFormik.handleChange}
                  onBlur={registerFormik.handleBlur}
                />
                {registerFormik.errors.experience_years &&
                  registerFormik.touched.experience_years && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerFormik.errors.experience_years}
                    </p>
                  )}
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-accent text-white py-2 rounded-md transition duration-200 font-semibold"
            disabled={registerFormik.isSubmitting}
          >
            {registerFormik.isSubmitting ? "Registering..." : "Register"}
          </button>

          {userType === "trainer" && (
            <p className="text-sm text-gray-400 mt-2">
              Note: Trainer accounts require admin approval before activation.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default Auth;
