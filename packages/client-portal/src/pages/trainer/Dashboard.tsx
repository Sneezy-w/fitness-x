import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

interface ClassSchedule {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  totalBookings: number;
  capacity: number;
}

interface AttendanceStats {
  totalClasses: number;
  totalAttendance: number;
  averageAttendanceRate: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [todayClasses, setTodayClasses] = useState<ClassSchedule[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSchedule[]>([]);
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState({
    today: true,
    upcoming: true,
    stats: true,
  });
  const [approvalStatus, setApprovalStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        // Get trainer approval status
        const profileResponse = await api.get("/auth/self/trainer/profile");
        console.log("profileResponse", profileResponse);

        if (!profileResponse.data.is_approved) {
          return; // Don't load other data if not approved
        } else {
          setApprovalStatus("approved");
        }

        // Fetch today's classes
        // setLoading((prev) => ({ ...prev, today: true }));
        // const todayResponse = await api.get("/schedules/trainer/today");
        // setTodayClasses(todayResponse.data);
      } catch (error) {
        console.error(
          "Error fetching trainer profile or today's classes:",
          error
        );
        toast.error("Failed to load your profile information");
      } finally {
        setLoading((prev) => ({ ...prev, today: false }));
      }

      try {
        // Fetch upcoming classes
        // setLoading((prev) => ({ ...prev, upcoming: true }));
        // const upcomingResponse = await api.get("/schedules/trainer/upcoming");
        // setUpcomingClasses(upcomingResponse.data);
      } catch (error) {
        console.error("Error fetching upcoming classes:", error);
        toast.error("Failed to load your upcoming classes");
      } finally {
        setLoading((prev) => ({ ...prev, upcoming: false }));
      }

      try {
        // Fetch attendance stats
        // setLoading((prev) => ({ ...prev, stats: true }));
        // const statsResponse = await api.get(
        //   "/schedules/trainer/attendance-stats"
        // );
        // setAttendanceStats(statsResponse.data);
      } catch (error) {
        console.error("Error fetching attendance stats:", error);
        // Not showing toast for stats as it's less critical
      } finally {
        setLoading((prev) => ({ ...prev, stats: false }));
      }
    };

    fetchTrainerData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Render approval pending state
  if (approvalStatus === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-secondary rounded-lg p-8 shadow-lg max-w-md mx-auto text-center">
          <div className="text-yellow-500 mb-4 text-5xl">
            <FiAlertCircle className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Approval Pending
          </h1>
          <p className="text-gray-300 mb-6">
            Your trainer account is currently awaiting approval from our
            administrators. This process typically takes 24-48 hours. You'll be
            notified via email once your account is approved.
          </p>
          <div className="bg-neutral p-4 rounded-md text-gray-400 text-sm mb-6">
            <p>
              If you have any questions, please contact us at
              support@fitnessx.com or call (416) 555-6789.
            </p>
          </div>
          <Link
            to="/trainer/profile"
            className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-md transition inline-block"
          >
            View My Profile
          </Link>
        </div>
      </div>
    );
  }

  // Render rejected state
  if (approvalStatus === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-secondary rounded-lg p-8 shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 mb-4 text-5xl">
            <FiAlertCircle className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Account Not Approved
          </h1>
          <p className="text-gray-300 mb-6">
            Unfortunately, your trainer account application was not approved at
            this time. This could be due to incomplete information or not
            meeting our current trainer requirements.
          </p>
          <div className="bg-neutral p-4 rounded-md text-gray-400 text-sm mb-6">
            <p>
              For more information about why your application was not approved
              or to reapply, please contact us at trainers@fitnessx.com or call
              (416) 555-6789.
            </p>
          </div>
          <Link
            to="/trainer/profile"
            className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-md transition inline-block"
          >
            View My Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-300">
          Here's an overview of your classes and schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Classes Card */}
        <div className="bg-secondary rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
              <FiCalendar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Today's Classes
              </h2>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          {loading.today ? (
            <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
          ) : todayClasses.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No classes scheduled for today.
            </p>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <div key={cls.id} className="bg-neutral p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white">{cls.className}</h3>
                    <span className="text-sm text-gray-400">
                      {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <FiUsers className="text-gray-400 mr-1" size={14} />
                    <span className="text-sm text-gray-300">
                      {cls.totalBookings}/{cls.capacity} booked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Classes Card */}
        <div className="bg-secondary rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
              <FiClock className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Upcoming</h2>
              <p className="text-sm text-gray-400">Next 7 days</p>
            </div>
          </div>
          {loading.upcoming ? (
            <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
          ) : upcomingClasses.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No upcoming classes scheduled.
            </p>
          ) : (
            <div>
              <p className="text-xl font-bold text-white mb-2">
                {upcomingClasses.length}
              </p>
              <p className="text-sm text-gray-300">
                classes scheduled for the next 7 days
              </p>
              <Link
                to="/trainer/classes"
                className="text-primary text-sm hover:underline block mt-3"
              >
                View schedule
              </Link>
            </div>
          )}
        </div>

        {/* Attendance Stats Card */}
        <div className="bg-secondary rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
              <FiCheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Attendance</h2>
              <p className="text-sm text-gray-400">Last 30 days</p>
            </div>
          </div>
          {loading.stats ? (
            <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
          ) : attendanceStats ? (
            <div>
              <p className="text-xl font-bold text-white mb-2">
                {attendanceStats.averageAttendanceRate}%
              </p>
              <p className="text-sm text-gray-300">
                average attendance rate from {attendanceStats.totalAttendance}{" "}
                members across {attendanceStats.totalClasses} classes
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No attendance data available yet.
            </p>
          )}
        </div>
      </div>

      {/* Today's Classes Detail Section */}
      <div className="bg-secondary rounded-lg p-6 shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
          <Link
            to="/trainer/classes"
            className="text-primary hover:text-accent text-sm"
          >
            View All Classes
          </Link>
        </div>

        {loading.today ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-16 w-16 bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : todayClasses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              No classes scheduled for today.
            </p>
            <p className="text-sm text-gray-500">
              Check the "All Classes" section to view your upcoming schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-neutral p-4 rounded-lg"
              >
                <div className="flex items-center mb-3 md:mb-0">
                  <div className="bg-primary/20 text-primary p-3 rounded-full mr-4 flex-shrink-0">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {cls.className}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {cls.totalBookings}/{cls.capacity} members registered
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-start md:justify-end">
                  <div className="flex items-center">
                    <FiClock className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                    </span>
                  </div>
                  <Link
                    to={`/trainer/classes/${cls.id}`}
                    className="ml-6 bg-primary hover:bg-accent text-white px-3 py-1 rounded-md text-sm transition"
                  >
                    Track Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/trainer/classes"
          className="bg-secondary hover:bg-secondary/80 p-4 rounded-lg flex items-center transition"
        >
          <div className="bg-primary p-3 rounded-full mr-4">
            <FiCalendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Class Schedule</h3>
            <p className="text-sm text-gray-400">View your upcoming classes</p>
          </div>
        </Link>

        <Link
          to="/trainer/profile"
          className="bg-secondary hover:bg-secondary/80 p-4 rounded-lg flex items-center transition"
        >
          <div className="bg-primary p-3 rounded-full mr-4">
            <FiUsers className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">My Profile</h3>
            <p className="text-sm text-gray-400">
              View and update your profile
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
