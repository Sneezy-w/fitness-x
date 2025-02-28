import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import MemberDashboardLayout from "./layouts/MemberDashboardLayout";
import TrainerDashboardLayout from "./layouts/TrainerDashboardLayout";

// Pages
import Home from "./pages/Home";
import Classes from "./pages/Classes";
import Memberships from "./pages/Memberships";
import Auth from "./pages/Auth";
import MemberDashboard from "./pages/member/Dashboard";
import MemberProfile from "./pages/member/Profile";
import MemberClasses from "./pages/member/Classes";
import MemberBookings from "./pages/member/Bookings";
import MemberMembership from "./pages/member/Membership";
import TrainerDashboard from "./pages/trainer/Dashboard";
import TrainerProfile from "./pages/trainer/Profile";
import TrainerClasses from "./pages/trainer/Classes";
import NotFound from "./pages/NotFound";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="classes" element={<Classes />} />
            <Route path="memberships" element={<Memberships />} />
          </Route>

          {/* Auth routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Auth />} />
          </Route>

          {/* Member routes */}
          <Route path="/member" element={<MemberDashboardLayout />}>
            <Route index element={<MemberDashboard />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="classes" element={<MemberClasses />} />
            <Route path="bookings" element={<MemberBookings />} />
            <Route path="membership" element={<MemberMembership />} />
          </Route>

          {/* Trainer routes */}
          <Route path="/trainer" element={<TrainerDashboardLayout />}>
            <Route index element={<TrainerDashboard />} />
            <Route path="profile" element={<TrainerProfile />} />
            <Route path="classes" element={<TrainerClasses />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
