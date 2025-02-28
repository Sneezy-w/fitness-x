import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (user?.role === "member") {
      navigate("/member");
    } else if (user?.role === "trainer") {
      navigate("/trainer");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-secondary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              FITNESS<span className="text-white">X</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-primary transition">
                Home
              </Link>
              <Link
                to="/classes"
                className="text-white hover:text-primary transition"
              >
                Classes
              </Link>
              <Link
                to="/memberships"
                className="text-white hover:text-primary transition"
              >
                Memberships
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDashboardClick}
                    className="text-white hover:text-primary transition"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-primary hover:bg-accent px-4 py-2 rounded transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-primary hover:bg-accent px-4 py-2 rounded transition"
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <nav className="mt-4 pb-4 md:hidden">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="text-white hover:text-primary transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/classes"
                  className="text-white hover:text-primary transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Classes
                </Link>
                <Link
                  to="/memberships"
                  className="text-white hover:text-primary transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Memberships
                </Link>

                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        handleDashboardClick();
                        setIsMenuOpen(false);
                      }}
                      className="text-white hover:text-primary transition text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="bg-primary hover:bg-accent px-4 py-2 rounded transition text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="bg-primary hover:bg-accent px-4 py-2 rounded transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-primary mb-4">
                FITNESS<span className="text-white">X</span>
              </h2>
              <p className="max-w-xs text-sm">
                Your ultimate fitness destination. Achieve your goals with our
                premium facilities and expert guidance.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/" className="hover:text-primary transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/classes"
                      className="hover:text-primary transition"
                    >
                      Classes
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/memberships"
                      className="hover:text-primary transition"
                    >
                      Memberships
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-primary transition">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Contact</h3>
                <ul className="space-y-2 text-sm">
                  <li>123 Fitness Street</li>
                  <li>Toronto, ON M5V 2A8</li>
                  <li>info@fitnessx.com</li>
                  <li>(416) 555-6789</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} FitnessX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
