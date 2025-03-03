import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchSchedulesWithAvailability } from "../services";
import { Schedule, Class as ClassType, Trainer } from "../types/models";

// Enhanced schedule type with availability information
interface ScheduleWithAvailability extends Schedule {
  availableSpots: number;
}

const defaultImages = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
  "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
];

const Classes = () => {
  const [schedules, setSchedules] = useState<ScheduleWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [uniqueTypes, setUniqueTypes] = useState<ClassType[]>([]);
  const [uniqueDays, setUniqueDays] = useState<string[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const schedulesData = await fetchSchedulesWithAvailability();
        setSchedules(schedulesData);

        // Extract unique class types
        const uniqueClassMap = new Map<number, ClassType>();
        schedulesData.forEach((schedule) => {
          if (!uniqueClassMap.has(schedule.class.id)) {
            uniqueClassMap.set(schedule.class.id, schedule.class);
          }
        });
        setUniqueTypes(Array.from(uniqueClassMap.values()));

        // Extract unique days
        const days = [...new Set(schedulesData.map((s) => s.date))].sort();
        setUniqueDays(days);

        // Set first day as selected by default if none selected
        if (!selectedDay && days.length > 0) {
          setSelectedDay(days[0]);
        }
      } catch (error) {
        toast.error("Failed to load class schedules");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [selectedDay]);

  // Filter schedules based on selection
  const filteredSchedules = schedules.filter((schedule) => {
    if (selectedDay && schedule.date !== selectedDay) return false;
    if (selectedType !== null && schedule.class.id !== selectedType)
      return false;
    return true;
  });

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
  };

  const handleTypeSelect = (typeId: number | null) => {
    setSelectedType(typeId);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filter schedules by today and upcoming classes
  const upcomingSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduleDate >= today;
  });

  // Sort upcoming schedules by date and time
  const sortedUpcomingSchedules = [...upcomingSchedules].sort((a, b) => {
    const dateComparison =
      new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return a.start_time.localeCompare(b.start_time);
  });

  // Get only the first 3 upcoming classes
  const featuredSchedules = sortedUpcomingSchedules.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6">Featured Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-secondary animate-pulse rounded-lg h-96"
                  ></div>
                ))
            : featuredSchedules.map((schedule, index) => (
                <div
                  key={schedule.id}
                  className="bg-secondary rounded-lg shadow-md overflow-hidden flex flex-col h-full"
                >
                  <img
                    src={defaultImages[index % defaultImages.length]}
                    alt={schedule.class.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {schedule.class.name}
                    </h3>
                    <p className="text-gray-400 mb-4 flex-1">
                      {schedule.class.description.substring(0, 100)}
                      {schedule.class.description.length > 100 ? "..." : ""}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center">
                        <FiCalendar className="text-primary mr-2" />
                        <span className="text-gray-300">
                          {new Date(schedule.date).toLocaleDateString(
                            undefined,
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="text-primary mr-2" />
                        <span className="text-gray-300">
                          {formatTime(schedule.start_time)} -{" "}
                          {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiUser className="text-primary mr-2" />
                        <span className="text-gray-300">
                          {schedule.trainer.full_name}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/auth?type=member`}
                      className="bg-primary hover:bg-primary/80 text-black font-medium py-2 px-4 rounded-md text-center"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
            Class Schedule
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTypeSelect(null)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedType === null
                  ? "bg-primary text-black"
                  : "bg-secondary text-white hover:bg-neutral"
              }`}
            >
              All Classes
            </button>
            {uniqueTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedType === type.id
                    ? "bg-primary text-black"
                    : "bg-secondary text-white hover:bg-neutral"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <div className="flex space-x-2">
            {uniqueDays.map((day) => (
              <button
                key={day}
                onClick={() => handleDaySelect(day)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  selectedDay === day
                    ? "bg-primary text-black"
                    : "bg-secondary text-white hover:bg-neutral"
                }`}
              >
                {new Date(day).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-secondary rounded-lg p-6 h-24"></div>
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-12 bg-secondary rounded-lg">
            <FiCalendar className="mx-auto text-gray-500 mb-3" size={48} />
            <h3 className="text-xl font-semibold text-white">
              No Classes Scheduled
            </h3>
            <p className="text-gray-400">
              There are no classes scheduled for the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-secondary rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-white">
                      {schedule.class.name}
                    </h3>
                    <p className="text-gray-400">
                      {schedule.trainer.full_name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">
                        {new Date(schedule.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="text-white">
                        {formatTime(schedule.start_time)} -{" "}
                        {formatTime(schedule.end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Availability</p>
                      <p className="text-white">
                        {schedule.availableSpots} / {schedule.capacity}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/auth?type=member`}
                    className="bg-primary hover:bg-primary/80 text-black font-medium py-2 px-4 rounded-md"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Classes;
