import { useState, useEffect, useMemo } from "react";
import { Calendar, momentLocalizer, Views, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiMapPin,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";

// Setup localizer for the calendar
const localizer = momentLocalizer(moment);

interface ClassSchedule {
  id: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  trainerName: string;
  capacity: number;
  availableSpots: number;
  isBooked: boolean;
  description?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ClassSchedule;
}

interface ToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const Classes = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ClassSchedule | null>(
    null
  );
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState({
    hasActiveMembership: false,
    remainingClasses: 0,
    freeClasses: 0,
    loading: true,
  });

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
    fetchAvailableClasses();
    fetchMembershipInfo();
  }, []);

  const fetchMembershipInfo = async () => {
    try {
      setMembershipStatus((prev) => ({ ...prev, loading: true }));

      // Fetch membership info
      const membershipResponse = await api.get(
        "/membership-subscriptions/current"
      );
      const hasActiveMembership = membershipResponse.data?.status === "active";
      const remainingClasses = membershipResponse.data?.remainingClasses || 0;

      // Fetch free classes
      const freeClassesResponse = await api.get(
        "/free-class-allocations/current"
      );
      const freeClasses = freeClassesResponse.data?.remainingClasses || 0;

      setMembershipStatus({
        hasActiveMembership,
        remainingClasses,
        freeClasses,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching membership info:", error);
      setMembershipStatus((prev) => ({
        ...prev,
        loading: false,
        hasActiveMembership: false,
        remainingClasses: 0,
        freeClasses: 0,
      }));
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/schedules/available");

      // Process the data to fit the Calendar component
      const formattedEvents: CalendarEvent[] = response.data.map(
        (cls: ClassSchedule) => {
          const startDateTime = new Date(`${cls.date}T${cls.startTime}`);
          const endDateTime = new Date(`${cls.date}T${cls.endTime}`);

          return {
            id: cls.id,
            title: cls.className,
            start: startDateTime,
            end: endDateTime,
            resource: cls,
          };
        }
      );

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load available classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setShowEventDetails(true);
  };

  const handleSelectSlot = ({ start }: SlotInfo) => {
    setSelectedDate(start);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleBookClass = async () => {
    if (!selectedEvent) return;

    try {
      setBookingLoading(true);
      await api.post(`/bookings`, { scheduleId: selectedEvent.id });
      toast.success("Class booked successfully!");

      // Refresh data
      await fetchAvailableClasses();
      await fetchMembershipInfo();

      setShowEventDetails(false);
    } catch (error) {
      console.error("Error booking class:", error);
      toast.error("Failed to book class. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Custom event component for the calendar
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div
      className={`text-sm truncate px-1 ${
        event.resource.isBooked ? "opacity-50" : ""
      }`}
    >
      <strong className="mr-1">{event.title}</strong>
      <span>
        {moment(event.start).format("h:mm A")} -{" "}
        {moment(event.end).format("h:mm A")}
      </span>
      {event.resource.isBooked && <span className="ml-1">(Booked)</span>}
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
        <h1 className="text-3xl font-bold text-white mb-2">Book Classes</h1>
        <p className="text-gray-300">
          Browse available classes and book your spot
        </p>
      </div>

      {/* Membership Status Banner */}
      <div className="bg-secondary rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-semibold text-white mb-1">
              Your Class Credit
            </h2>
            {membershipStatus.loading ? (
              <div className="animate-pulse h-5 w-40 bg-gray-700 rounded"></div>
            ) : (
              <div className="flex items-center">
                <div className="text-primary mr-1">
                  <FiCheck size={16} />
                </div>
                <p className="text-gray-300">
                  {membershipStatus.hasActiveMembership ? (
                    <span>
                      {membershipStatus.remainingClasses} membership classes
                      remaining
                    </span>
                  ) : (
                    <span>No active membership</span>
                  )}
                  {membershipStatus.freeClasses > 0 && (
                    <span className="ml-1">
                      (+ {membershipStatus.freeClasses} free classes)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
          <div>
            <a
              href="/member/membership"
              className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-md transition inline-block"
            >
              Manage Membership
            </a>
          </div>
        </div>
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
              eventPropGetter={(event: CalendarEvent) => ({
                className: `${
                  event.resource.isBooked ? "bg-gray-500" : "bg-primary"
                } text-white rounded p-1`,
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
                className={`bg-neutral p-4 rounded-lg cursor-pointer hover:bg-neutral/80 transition ${
                  event.resource.isBooked ? "border-l-4 border-green-500" : ""
                }`}
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
                      <p className="text-sm text-gray-400">
                        {event.resource.trainerName} • {event.resource.location}
                      </p>
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
                        {event.resource.capacity -
                          event.resource.availableSpots}
                        /{event.resource.capacity} booked
                      </span>
                    </div>
                  </div>
                </div>
                {event.resource.isBooked && (
                  <div className="mt-2 flex items-center text-green-500">
                    <FiCheck className="mr-1" /> You have already booked this
                    class
                  </div>
                )}
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
                      <p className="text-sm text-gray-400">Availability</p>
                      <p className="text-white">
                        {selectedEvent.availableSpots} spots available (out of{" "}
                        {selectedEvent.capacity})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description if available */}
              {selectedEvent.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Class Description
                  </h3>
                  <p className="text-gray-300">{selectedEvent.description}</p>
                </div>
              )}

              {/* Trainer info */}
              <div className="bg-neutral p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Instructor
                </h3>
                <p className="text-gray-300">{selectedEvent.trainerName}</p>
              </div>

              {/* Booking Section */}
              <div className="flex justify-between items-center">
                {selectedEvent.isBooked ? (
                  <div className="flex items-center text-green-500">
                    <FiCheck size={20} className="mr-2" />
                    <span>You're booked for this class</span>
                  </div>
                ) : selectedEvent.availableSpots === 0 ? (
                  <div className="flex items-center text-red-500">
                    <FiAlertCircle size={20} className="mr-2" />
                    <span>This class is fully booked</span>
                  </div>
                ) : !membershipStatus.hasActiveMembership &&
                  membershipStatus.freeClasses === 0 ? (
                  <div className="flex items-center text-yellow-500">
                    <FiAlertCircle size={20} className="mr-2" />
                    <span>
                      You need an active membership or free classes to book
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-300">
                    <span>Ready to join this class?</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseEventDetails}
                    className="bg-neutral hover:bg-neutral/80 text-white py-2 px-4 rounded-md transition"
                  >
                    Close
                  </button>

                  {!selectedEvent.isBooked &&
                    selectedEvent.availableSpots > 0 &&
                    (membershipStatus.hasActiveMembership ||
                      membershipStatus.freeClasses > 0) && (
                      <button
                        onClick={handleBookClass}
                        className="bg-primary hover:bg-accent text-white py-2 px-4 rounded-md transition flex items-center"
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? (
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
                            Booking...
                          </>
                        ) : (
                          "Book Class"
                        )}
                      </button>
                    )}
                </div>
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
