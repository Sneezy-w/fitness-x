import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiUser, FiMail, FiPhone, FiSave } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        await api.put("/members/profile", values);
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/members/profile");
        const profileData: Profile = response.data;

        // Update form values
        formik.setValues({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-300">Update your personal information</p>
      </div>

      <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded w-1/4"></div>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                  name="name"
                  className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                    formik.errors.name && formik.touched.name
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.errors.name && formik.touched.name && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input
                  type="email"
                  name="email"
                  className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                    formik.errors.email && formik.touched.email
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled // Email can't be changed
                />
              </div>
              {formik.errors.email && formik.touched.email && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.email}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Email address cannot be changed.
              </p>
            </div>

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
                  className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                    formik.errors.phone && formik.touched.phone
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.errors.phone && formik.touched.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="bg-primary hover:bg-accent text-white py-2 px-4 rounded-md transition flex items-center justify-center"
                disabled={saving || !formik.dirty}
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password Change Section */}
      <div className="bg-secondary rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
        <p className="text-gray-300 mb-4">
          To change your password, please use the forgot password functionality
          from the login page.
        </p>
        <button
          onClick={() => {
            // Log out and redirect to auth page
            toast.success("You will be logged out to change your password");
            setTimeout(() => {
              // Use the auth context to logout and redirect
              window.location.href = "/auth";
            }, 2000);
          }}
          className="text-primary hover:text-white hover:bg-primary px-4 py-2 rounded-md transition border border-primary"
        >
          Go to Login Page
        </button>
      </div>
    </div>
  );
};

export default Profile;
