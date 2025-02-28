import React, { useState } from "react";
import moment from "moment";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Card from "./Card";
import { Schedule, ScheduleDisplayItem } from "../../types/models";

interface ClassScheduleProps {
  schedules: ScheduleDisplayItem[];
  onClassSelect?: (classItem: ScheduleDisplayItem) => void;
  loading?: boolean;
  showBookingStatus?: boolean;
}

const ClassSchedule: React.FC<ClassScheduleProps> = ({
  schedules,
  onClassSelect,
  loading = false,
  showBookingStatus = true,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getFormattedDate = (date: Date): string => {
    return moment(date).format("YYYY-MM-DD");
  };

  const navigateToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const navigateToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const navigateToToday = () => {
    setSelectedDate(new Date());
  };

  // Filter schedules for the selected date
  const filteredSchedules = schedules
    .filter((schedule) => schedule.date === getFormattedDate(selectedDate))
    .map((schedule) => ({
      ...schedule,
      //isBooked: schedule.bookings.length > 0,
      availableSpots: schedule.capacity - schedule.bookings.length,
    }));

  // Sort by start time
  const sortedSchedules = [...filteredSchedules].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-secondary rounded-lg p-4">
        <button
          onClick={navigateToPreviousDay}
          className="p-2 hover:bg-neutral rounded-full"
        >
          <FiChevronLeft className="text-white" size={24} />
        </button>

        <div className="text-center">
          <button
            onClick={navigateToToday}
            className="bg-neutral hover:bg-neutral/80 text-white px-3 py-1 rounded-md text-sm"
          >
            Today
          </button>
          <h2 className="text-xl font-bold text-white mt-2">
            {moment(selectedDate).format("dddd, MMMM D, YYYY")}
          </h2>
        </div>

        <button
          onClick={navigateToNextDay}
          className="p-2 hover:bg-neutral rounded-full"
        >
          <FiChevronRight className="text-white" size={24} />
        </button>
      </div>

      {/* Class List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-secondary rounded-lg p-4 h-28" />
          ))}
        </div>
      ) : sortedSchedules.length === 0 ? (
        <div className="text-center py-12 bg-secondary rounded-lg">
          <FiCalendar className="mx-auto text-gray-500 mb-3" size={48} />
          <h3 className="text-xl font-semibold text-white">
            No Classes Scheduled
          </h3>
          <p className="text-gray-400">
            There are no classes scheduled for this date.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSchedules.map((classItem) => (
            <Card
              key={classItem.id}
              variant="bordered"
              hover={!!onClassSelect}
              padding="normal"
              className={`${
                classItem.isBooked ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => onClassSelect && onClassSelect(classItem)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-start mb-3 md:mb-0">
                  <div className="bg-primary/20 text-primary p-3 rounded-full mr-4 flex-shrink-0">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {classItem.class.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {classItem.trainer.full_name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center">
                    <FiClock className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {moment(classItem.start_time, "HH:mm").format("h:mm A")} -{" "}
                      {moment(classItem.end_time, "HH:mm").format("h:mm A")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiMapPin className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">Studio</span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {classItem.capacity - classItem.availableSpots}/
                      {classItem.capacity}
                    </span>
                  </div>
                </div>
              </div>

              {showBookingStatus && classItem.isBooked && (
                <div className="mt-2 inline-flex items-center text-primary px-2 py-1 rounded-md bg-primary/10">
                  <FiUser className="mr-1" /> Booked
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassSchedule;
