import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiSave,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

interface TrainerProfile {
  id: number;
  full_name: string;
  //email: string;
  //phone: string;
  specialization: string;
  experience_years: number;
  //bio?: string;
  //status: "pending" | "approved" | "rejected";
  //rejection_reason?: string;
  is_approved: boolean;
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const { checkAuth } = useAuth();
  const validationSchema = Yup.object({
    full_name: Yup.string().required("Name is required"),
    // email: Yup.string()
    //   .email("Invalid email address")
    //   .required("Email is required"),
    //phone: Yup.string().required("Phone number is required"),
    specialization: Yup.string().required("Specialization is required"),
    experience_years: Yup.number().min(0, "Experience must be at least 0").required("Experience is required"),
    //bio: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      full_name: "",
      //email: "",
      //phone: "",
      specialization: "",
      experience_years: 0,
      //bio: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const response = await api.patch("/auth/self/trainer/profile", values);
        const token = response.data.access_token;
        localStorage.setItem("token", token);
        await checkAuth();
        //window.location.href = "/";
        toast.success("Profile updated successfully");

        // Refresh profile data
        fetchProfile();
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      } finally {
        setSaving(false);
      }
    },
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/self/trainer/profile");
      const profileData: TrainerProfile = response.data;

      setProfile(profileData);

      // Update form values
      formik.setValues({
        full_name: profileData.full_name,
        //email: profileData.email,
        //phone: profileData.phone,
        specialization: profileData.specialization,
        experience_years: profileData.experience_years,
        //bio: profileData.bio || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-300">Update your trainer information</p>
      </div>

      {/* Status Banner */}
      {profile && (
        <div
          className={`mb-8 p-4 rounded-lg ${
            profile.is_approved
              ? "bg-green-900/20 border border-green-700"
              : "bg-yellow-900/20 border border-yellow-700"
          }`}
        >
          <div className="flex items-start">
            <div
              className={`p-2 rounded-full mr-4 ${
                profile.is_approved
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {profile.is_approved ? (
                <FiCheckCircle size={24} />
              ) : (
                <FiAlertCircle size={24} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {profile.is_approved
                  ? "Approved Trainer"
                  : "Approval Pending"}
              </h3>
              <p className="text-gray-300">
                {profile.is_approved
                  ? "Your trainer account is approved. You can view and manage your classes."
                  : "Your application is under review. You will be notified once approved."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
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
                  name="full_name"
                  className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                    formik.errors.full_name && formik.touched.full_name
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={formik.values.full_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.errors.full_name && formik.touched.full_name && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.full_name}
                </p>
              )}
            </div>

            {/* <div>
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
            </div> */}

            {/* <div>
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
            </div> */}

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Specialization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiBriefcase />
                </div>
                <input
                  type="text"
                  name="specialization"
                  placeholder="e.g., Yoga, Strength Training, HIIT"
                  className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                    formik.errors.specialization &&
                    formik.touched.specialization
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.errors.specialization &&
                formik.touched.specialization && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.specialization}
                  </p>
                )}
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Years of Experience
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiBriefcase />
                </div>
                <input
                  type="number"
                  name="experience_years"
                  placeholder="e.g., 3 years"
                  className={`w-full pl-10 pr-3 py-2 rounded-md bg-neutral text-white border ${
                    formik.errors.experience_years && formik.touched.experience_years
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  value={formik.values.experience_years}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.errors.experience_years && formik.touched.experience_years && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.experience_years}
                </p>
              )}
            </div>

            {/* <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Bio (Optional)
              </label>
              <textarea
                name="bio"
                rows={4}
                placeholder="Tell us about yourself, your training philosophy, certifications, etc."
                className={`w-full px-3 py-2 rounded-md bg-neutral text-white border ${
                  formik.errors.bio && formik.touched.bio
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                value={formik.values.bio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.bio && formik.touched.bio && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.bio}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                A good bio helps members understand your expertise and teaching
                style.
              </p>
            </div> */}

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
