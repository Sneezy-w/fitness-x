import { useState, useEffect, useMemo } from "react";
import { Calendar, momentLocalizer, Views, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiMapPin,
  FiCheckCircle,
} from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

// Setup localizer for the calendar
const localizer = momentLocalizer(moment);

interface ClassEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  className: string;
  trainerName: string;
  location: string;
  capacity: number;
  totalBookings: number;
  attendanceMarked: boolean;
  resource?: Record<string, any>;
}

interface ClassDetail {
  id: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  trainerName: string;
  capacity: number;
  totalBookings: number;
  attendanceMarked: boolean;
}

interface ToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const Classes = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ClassDetail | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Filter events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    if (!events.length) return [];

    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [events, selectedDate]);

  useEffect(() => {
    fetchTrainerClasses();
  }, []);

  const fetchTrainerClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/schedules/trainer/self/all");

      // Process the data to fit the Calendar component
      const formattedEvents: ClassEvent[] = response.data.map(
        (cls: Record<string, any>) => {
          const startDateTime = new Date(`${cls.date}T${cls.start_time}`);
          const endDateTime = new Date(`${cls.date}T${cls.end_time}`);

          return {
            id: cls.id,
            title: cls.class.name,
            start: startDateTime,
            end: endDateTime,
            className: cls.class.name,
            trainerName: cls.trainer.full_name || user?.name || "",
            location: cls.location || "Main Studio",
            capacity: cls.capacity || 0,
            totalBookings: cls.bookings?.length || 0,
            attendanceMarked: cls.attendance_marked || false,
            resource: cls,
          };
        }
      );

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load class schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: ClassEvent) => {
    // Format the event details for display
    const classDetail: ClassDetail = {
      id: event.id,
      className: event.className,
      date: moment(event.start).format("YYYY-MM-DD"),
      startTime: moment(event.start).format("HH:mm"),
      endTime: moment(event.end).format("HH:mm"),
      location: event.location,
      trainerName: event.trainerName,
      capacity: event.capacity,
      totalBookings: event.totalBookings,
      attendanceMarked: event.attendanceMarked,
    };

    setSelectedEvent(classDetail);
    setShowEventDetails(true);
  };

  const handleSelectSlot = ({ start }: SlotInfo) => {
    setSelectedDate(start);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleMarkAttendance = async () => {
    if (!selectedEvent) return;

    try {
      // Call the API to mark attendance
      await api.post(`/schedules/trainer/self/mark-attendance/${selectedEvent.id}`);
      toast.success("Attendance marked successfully");

      // Refresh the data
      await fetchTrainerClasses();
      setShowEventDetails(false);
    } catch (error) {
      console.error("Error marking attendance:", error);
      //toast.error("Failed to mark attendance. Please try again.");
    }
  };

  // Custom event component for the calendar
  const EventComponent = ({ event }: { event: ClassEvent }) => (
    <div className="text-sm truncate px-1">
      <strong className="mr-1">{event.title}</strong>
      <span>
        {moment(event.start).format("h:mm A")} -{" "}
        {moment(event.end).format("h:mm A")}
      </span>
    </div>
  );

  // Custom toolbar for the calendar
  const CustomToolbar = ({ date, onNavigate }: ToolbarProps) => (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-xl font-bold text-white">
          {moment(date).format("MMMM YYYY")}
        </h2>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate("PREV")}
          className="px-3 py-1 bg-secondary hover:bg-primary text-white rounded"
        >
          Previous
        </button>
        <button
          onClick={() => onNavigate("TODAY")}
          className="px-3 py-1 bg-secondary hover:bg-primary text-white rounded"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-3 py-1 bg-secondary hover:bg-primary text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Classes</h1>
        <p className="text-gray-300">
          View your class schedule and manage attendance
        </p>
      </div>

      {/* Calendar View */}
      <div className="bg-secondary rounded-lg p-6 shadow-md mb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-primary"></div>
          </div>
        ) : (
          <div className="calendar-container text-white">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 650 }}
              defaultView={Views.MONTH}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar,
              }}
              eventPropGetter={() => ({
                className: "bg-primary text-white rounded p-1",
              })}
              dayPropGetter={(date: Date) => {
                const today = new Date();
                if (
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                ) {
                  return {
                    className: "bg-primary/10",
                  };
                }
                if (
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear()
                ) {
                  return {
                    className: "bg-accent/10",
                  };
                }
                return {};
              }}
            />
          </div>
        )}
      </div>

      {/* Selected Date Classes */}
      {eventsForSelectedDate.length > 0 && (
        <div className="bg-secondary rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Classes on {moment(selectedDate).format("dddd, MMMM D, YYYY")}
          </h2>
          <div className="space-y-4">
            {eventsForSelectedDate.map((event) => (
              <div
                key={event.id}
                className="bg-neutral p-4 rounded-lg cursor-pointer hover:bg-neutral/80 transition"
                onClick={() => handleSelectEvent(event)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center mb-3 md:mb-0">
                    <div className="bg-primary/20 text-primary p-3 rounded-full mr-4 flex-shrink-0">
                      <FiCalendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-400">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    <div className="flex items-center mr-6">
                      <FiClock className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-300">
                        {moment(event.start).format("h:mm A")} -{" "}
                        {moment(event.end).format("h:mm A")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FiUsers className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-300">
                        {event.totalBookings}/{event.capacity} booked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedEvent.className}
                </h2>
                <button
                  onClick={handleCloseEventDetails}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center mb-4">
                    <FiCalendar className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">
                        {moment(selectedEvent.date).format(
                          "dddd, MMMM D, YYYY"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <FiClock className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="text-white">
                        {moment(selectedEvent.startTime, "HH:mm").format(
                          "h:mm A"
                        )}{" "}
                        -{" "}
                        {moment(selectedEvent.endTime, "HH:mm").format(
                          "h:mm A"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <FiMapPin className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white">{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <FiUsers className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Attendance</p>
                      <p className="text-white">
                        {selectedEvent.totalBookings} out of{" "}
                        {selectedEvent.capacity} registered
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Marking Section */}
              <div className="bg-neutral p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Attendance
                </h3>
                <p className="text-gray-300 mb-4">
                  {selectedEvent.attendanceMarked
                    ? "Attendance has been marked for this class."
                    : "Mark attendance for this class after completion."}
                </p>
                <button
                  className={`flex items-center ${
                    selectedEvent.attendanceMarked
                      ? "bg-green-700 cursor-not-allowed"
                      : "bg-primary hover:bg-accent"
                  } text-white py-2 px-4 rounded-md transition`}
                  onClick={handleMarkAttendance}
                  disabled={selectedEvent.attendanceMarked}
                >
                  <FiCheckCircle className="mr-2" />
                  {selectedEvent.attendanceMarked
                    ? "Attendance Marked"
                    : "Mark Attendance"}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseEventDetails}
                  className="bg-neutral hover:bg-neutral/80 text-white py-2 px-4 rounded-md transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom calendar styles */}
      <style>{`
        .rbc-calendar {
          background-color: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .rbc-header {
          padding: 10px 3px;
          font-weight: bold;
          border-bottom: 1px solid #333;
        }
        
        .rbc-month-view, .rbc-time-view {
          border: 1px solid #333;
        }
        
        .rbc-day-bg {
          border-right: 1px solid #333;
          border-bottom: 1px solid #333;
        }
        
        .rbc-today {
          background-color: rgba(255, 0, 0, 0.1);
        }
        
        .rbc-event {
          background-color: #ff0000;
          border-radius: 4px;
          color: white;
          padding: 2px 5px;
          border: none;
          cursor: pointer;
        }
        
        .rbc-off-range-bg {
          background-color: #272727;
        }
        
        .rbc-off-range {
          color: #666;
        }
        
        .rbc-month-row {
          overflow: hidden;
        }
        
        .rbc-time-slot {
          border-top: 1px solid #333;
        }
        
        .rbc-time-header-content {
          border-left: 1px solid #333;
        }
        
        .rbc-time-content {
          border-top: 1px solid #333;
        }
        
        .rbc-time-header-gutter {
          background-color: #1e1e1e;
        }
        
        .rbc-label {
          padding: 5px;
        }
      `}</style>
    </div>
  );
};

export default Classes;
