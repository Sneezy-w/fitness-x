import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiCreditCard, FiBarChart2 } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

interface Booking {
  id: string;
  scheduleId: string;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  trainerName: string;
}

interface Membership {
  id: string;
  name: string;
  price: number;
  classesPerMonth: number;
  remainingClasses: number;
  expireDate: string;
  startDate: string;
  status: "active" | "expired";
}

interface ClassStat {
  name: string;
  count: number;
  percentage: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  //const [freeClasses, setFreeClasses] = useState<number>(0);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [loading, setLoading] = useState({
    bookings: true,
    membership: true,
    stats: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch upcoming bookings
        setLoading((prev) => ({ ...prev, bookings: true }));
        const bookingsResponse = await api.get("/bookings/member/upcoming");
        setUpcomingBookings(bookingsResponse.data);
      } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        toast.error("Failed to load your upcoming bookings");
      } finally {
        setLoading((prev) => ({ ...prev, bookings: false }));
      }

      try {
        // Fetch membership info
        setLoading((prev) => ({ ...prev, membership: true }));
        const membershipResponse = await api.get(
          "/membership-subscriptions/member/current"
        );
        setMembership(membershipResponse.data);

        // Fetch free classes
        // const freeClassesResponse = await api.get(
        //   "/free-class-allocations/member/current"
        // );
        // setFreeClasses(freeClassesResponse.data.remainingClasses || 0);
      } catch (error) {
        console.error("Error fetching membership info:", error);
        toast.error("Failed to load your membership information");
      } finally {
        setLoading((prev) => ({ ...prev, membership: false }));
      }

      try {
        // Fetch class statistics
        setLoading((prev) => ({ ...prev, stats: true }));
        const statsResponse = await api.get("/bookings/member/stats");
        setClassStats(statsResponse.data);
      } catch (error) {
        console.error("Error fetching class statistics:", error);
        // Not showing toast for stats as it's less critical
      } finally {
        setLoading((prev) => ({ ...prev, stats: false }));
      }
    };

    fetchDashboardData();
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

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-300">
          Here's an overview of your fitness journey with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Remaining Classes Card */}
        <div className="bg-secondary rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
              <FiCalendar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Remaining Classes
              </h2>
              <p className="text-sm text-gray-400">This month</p>
            </div>
          </div>
          {loading.membership ? (
            <div className="animate-pulse h-10 bg-gray-700 rounded"></div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-white">
                {membership?.remainingClasses || 0}
                <span className="text-sm text-gray-400 ml-2">
                  / {membership?.classesPerMonth || 0}
                </span>
              </p>
              {/* {freeClasses > 0 && (
                <p className="text-sm text-primary mt-1">
                  + {freeClasses} free classes available
                </p>
              )} */}
            </div>
          )}
        </div>

        {/* Membership Status Card */}
        <div className="bg-secondary rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
              <FiCreditCard className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Membership</h2>
              <p className="text-sm text-gray-400">Current plan</p>
            </div>
          </div>
          {loading.membership ? (
            <div className="animate-pulse h-10 bg-gray-700 rounded"></div>
          ) : membership ? (
            <div>
              <p className="text-xl font-bold text-white">{membership.name}</p>
              <p
                className={`text-sm ${
                  membership.status === "active"
                    ? "text-green-500"
                    : "text-red-500"
                } mt-1`}
              >
                {membership.status === "active" ? "Active" : "Expired"}
                {membership.status === "active" && membership.expireDate && (
                  <span className="text-gray-400">
                    {" "}
                    · Renews {formatDate(membership.expireDate)}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-bold text-white">
                No Active Membership
              </p>
              <Link
                to="/member/membership"
                className="text-primary text-sm hover:underline"
              >
                View membership options
              </Link>
            </div>
          )}
        </div>

        {/* Class Activity Card */}
        <div className="bg-secondary rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
              <FiBarChart2 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Class Activity
              </h2>
              <p className="text-sm text-gray-400">Last 30 days</p>
            </div>
          </div>
          {loading.stats ? (
            <div className="animate-pulse h-10 bg-gray-700 rounded"></div>
          ) : classStats.length > 0 ? (
            <div className="space-y-2">
              {classStats.slice(0, 2).map((stat) => (
                <div key={stat.name} className="flex items-center">
                  <span className="text-gray-300 text-sm flex-grow truncate">
                    {stat.name}
                  </span>
                  <span className="text-white font-medium">{stat.count}x</span>
                </div>
              ))}
              {classStats.length > 2 && (
                <Link
                  to="/member/bookings"
                  className="text-primary text-sm hover:underline"
                >
                  View all class activity
                </Link>
              )}
            </div>
          ) : (
            <p className="text-gray-300 text-sm">No class activity yet.</p>
          )}
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div className="bg-secondary rounded-lg p-6 shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Upcoming Bookings</h2>
          <Link
            to="/member/bookings"
            className="text-primary hover:text-accent text-sm"
          >
            View All
          </Link>
        </div>

        {loading.bookings ? (
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
        ) : upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              You don't have any upcoming bookings.
            </p>
            <Link
              to="/member/classes"
              className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-md transition"
            >
              Book a Class
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-neutral p-4 rounded-lg"
              >
                <div className="flex items-center mb-3 md:mb-0">
                  <div className="bg-primary/20 text-primary p-3 rounded-full mr-4 flex-shrink-0">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {booking.className}
                    </h3>
                    <p className="text-sm text-gray-400">
                      with {booking.trainerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-start md:justify-end">
                  <div className="flex items-center mr-6">
                    <FiCalendar className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {formatDate(booking.date)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {formatTime(booking.startTime)} -{" "}
                      {formatTime(booking.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/member/classes"
          className="bg-secondary hover:bg-secondary/80 p-4 rounded-lg flex items-center transition"
        >
          <div className="bg-primary p-3 rounded-full mr-4">
            <FiCalendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Book a Class</h3>
            <p className="text-sm text-gray-400">
              Browse and book available classes
            </p>
          </div>
        </Link>

        <Link
          to="/member/membership"
          className="bg-secondary hover:bg-secondary/80 p-4 rounded-lg flex items-center transition"
        >
          <div className="bg-primary p-3 rounded-full mr-4">
            <FiCreditCard className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Manage Membership
            </h3>
            <p className="text-sm text-gray-400">
              View or upgrade your membership
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
