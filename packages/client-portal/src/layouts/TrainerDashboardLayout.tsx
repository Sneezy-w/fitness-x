import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiHome,
  FiUser,
  FiCalendar,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";

const TrainerDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not authenticated or not a trainer
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (user?.role !== "trainer") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral">
      {/* Mobile Header */}
      <div className="md:hidden bg-secondary text-white p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          FITNESS<span className="text-white">X</span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="text-white p-2"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-secondary text-white w-full md:w-64 flex-shrink-0 md:flex flex-col 
          ${isSidebarOpen ? "fixed inset-0 z-10 md:relative" : "hidden"}`}
      >
        {/* Close button for mobile */}
        <div className="md:hidden p-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            FITNESS<span className="text-white">X</span>
          </Link>
          <button onClick={closeSidebar} className="text-white p-2">
            <FiX size={24} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0).toUpperCase() || "T"}
            </div>
            <div className="ml-3">
              <p className="font-semibold">{user?.name || "Trainer"}</p>
              <p className="text-xs text-gray-400">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/trainer"
                className={`flex items-center space-x-3 p-2 rounded-md transition ${
                  isActive("/trainer")
                    ? "bg-primary text-white"
                    : "hover:bg-neutral"
                }`}
                onClick={closeSidebar}
              >
                <FiHome />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/trainer/profile"
                className={`flex items-center space-x-3 p-2 rounded-md transition ${
                  isActive("/trainer/profile")
                    ? "bg-primary text-white"
                    : "hover:bg-neutral"
                }`}
                onClick={closeSidebar}
              >
                <FiUser />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/trainer/classes"
                className={`flex items-center space-x-3 p-2 rounded-md transition ${
                  isActive("/trainer/classes")
                    ? "bg-primary text-white"
                    : "hover:bg-neutral"
                }`}
                onClick={closeSidebar}
              >
                <FiCalendar />
                <span>My Classes</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
            className="flex items-center space-x-3 p-2 w-full text-left rounded-md hover:bg-neutral transition"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-4 md:p-8 bg-base-100">
        <Outlet />
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
};

export default TrainerDashboardLayout;
