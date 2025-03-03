import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";
import moment from "moment";

interface Booking {
  id: number;
  schedule_id: number;
  member_id: number;
  status: string;
  attendance_status?: string;
  created_at: string;
  updated_at: string;
  // Include related data
  schedule: {
    id: number;
    class_id: number;
    trainer_id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    is_cancelled: boolean;
    created_at: string;
    updated_at: string;
    class: {
      id: number;
      name: string;
      description: string;
      category: string;
      duration_minutes: number;
    };
    trainer: {
      id: number;
      full_name: string;
    };
  };
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/member/all");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("dddd, MMMM D, YYYY");
  };

  const formatTime = (timeString: string) => {
    return moment(timeString, "HH:mm").format("h:mm A");
  };

  const isPastBooking = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.schedule.date}T${booking.schedule.end_time}`);
    return bookingDateTime < new Date();
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return !isPastBooking(booking);
    if (filter === "past") return isPastBooking(booking);
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-gray-300">
          View all your class bookings and history
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-secondary rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-neutral text-white hover:bg-primary hover:text-white"
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "upcoming"
                ? "bg-primary text-white"
                : "bg-neutral text-white hover:bg-primary hover:text-white"
            }`}
          >
            Upcoming Classes
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "past"
                ? "bg-primary text-white"
                : "bg-neutral text-white hover:bg-primary hover:text-white"
            }`}
          >
            Past Classes
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-secondary rounded-lg p-6 shadow-md">
        {loading ? (
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-16 w-16 bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <FiCalendar className="inline-block" />
            </div>
            <h3 className="text-xl text-white mb-2">
              {filter === "all"
                ? "No bookings found"
                : filter === "upcoming"
                ? "No upcoming classes"
                : "No past classes"}
            </h3>
            <p className="text-gray-400">
              {filter === "all"
                ? "You haven't booked any classes yet."
                : filter === "upcoming"
                ? "You don't have any upcoming classes booked."
                : "You haven't attended any classes yet."}
            </p>
            {filter !== "upcoming" && (
              <a
                href="/member/classes"
                className="inline-block mt-4 bg-primary hover:bg-accent text-white px-4 py-2 rounded-md transition"
              >
                Book a Class
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isPast = isPastBooking(booking);
              return (
                <div
                  key={booking.id}
                  className={`bg-neutral p-4 rounded-lg ${
                    isPast ? "" : "border-l-4 border-primary"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div
                        className={`bg-primary/20 text-primary p-3 rounded-full mr-4 flex-shrink-0`}
                      >
                        <FiCalendar size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {booking.schedule.class.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          with {booking.schedule.trainer.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <FiClock className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-300">
                          {formatDate(booking.schedule.date)} •{" "}
                          {formatTime(booking.schedule.start_time)} -{" "}
                          {formatTime(booking.schedule.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {/* <FiMapPin className="text-gray-400 mr-2" /> */}
                        <span className="text-sm text-gray-300">
                          {booking.schedule.class.description}
                        </span>
                      </div>
                      {isPast && (
                        <div className="flex items-center">
                          {booking.attendance_status === "attended" ? (
                            <span className="text-green-500 flex items-center">
                              <FiCheck className="mr-1" /> Attendance marked
                            </span>
                          ) : (
                            <span className="text-yellow-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> Attendance not
                              recorded
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
