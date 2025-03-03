import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiUsers, FiCalendar, FiActivity } from "react-icons/fi";
import api from "../services/api";
import Hero from "../components/shared/Hero";
import Card from "../components/shared/Card";
import ClassSchedule from "../components/shared/ClassSchedule";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import { MembershipType, ScheduleDisplayItem } from "../types/models";

// interface ClassScheduleItem {
//   id: string;
//   className: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   location: string;
//   trainerName: string;
//   capacity: number;
//   availableSpots: number;
// }

// interface MembershipType {
//   id: string;
//   name: string;
//   price: number;
//   description: string;
//   classesPerMonth: number;
//   features: string[];
// }

const membershipFeatures = [
  [
    "Access to online classes",
    "Access to Facebook group",
    "10 health & fitness guides",
  ],
  [
    "All in Beginner package",
    "1-on-1 personal trainning",
    "Advanced training help",
  ],
  [
    "All in Intermediate package",
    "Access to my online tutorials",
    "Dedicated training help",
  ],
];

const Home = () => {
  const [loading, setLoading] = useState({
    classes: true,
    memberships: true,
  });
  const [upcomingClasses, setUpcomingClasses] = useState<ScheduleDisplayItem[]>(
    []
  );
  const [memberships, setMemberships] = useState<MembershipType[]>([]);

  useEffect(() => {
    fetchUpcomingClasses();
    fetchMemberships();
  }, []);

  const fetchUpcomingClasses = async () => {
    try {
      setLoading((prev) => ({ ...prev, classes: true }));
      const response = await api.get("/schedules/public/upcoming");
      setUpcomingClasses(response.data);
    } catch (error) {
      console.error("Error fetching upcoming classes:", error);
    } finally {
      setLoading((prev) => ({ ...prev, classes: false }));
    }
  };

  const fetchMemberships = async () => {
    try {
      setLoading((prev) => ({ ...prev, memberships: true }));
      const response = await api.get("/membership-types");
      setMemberships(response.data);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    } finally {
      setLoading((prev) => ({ ...prev, memberships: false }));
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Elevate Your Fitness Journey"
        subtitle="Join Fitness X and experience world-class training facilities, expert coaches, and a supportive community."
        buttonText="Get Started"
        buttonLink="/auth"
        backgroundImage="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2031&q=80"
        height="large"
      />

      {/* Benefits Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Why Choose Fitness X?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card
              variant="default"
              hover
              padding="large"
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-primary/20 p-4 rounded-full">
                  <FiUsers className="text-primary text-4xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Expert Trainers
              </h3>
              <p className="text-gray-400">
                Our certified trainers create personalized fitness plans to help
                you achieve your goals efficiently.
              </p>
            </Card>

            <Card
              variant="default"
              hover
              padding="large"
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-primary/20 p-4 rounded-full">
                  <FiCalendar className="text-primary text-4xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Flexible Classes
              </h3>
              <p className="text-gray-400">
                Choose from a variety of class types and times to fit your
                schedule, all included in your membership.
              </p>
            </Card>

            <Card
              variant="default"
              hover
              padding="large"
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-primary/20 p-4 rounded-full">
                  <FiActivity className="text-primary text-4xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Modern Facilities
              </h3>
              <p className="text-gray-400">
                Enjoy state-of-the-art equipment, pristine spaces, and a
                motivating atmosphere to maximize your workouts.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Classes Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Upcoming Classes
              </h2>
              <p className="text-gray-400">
                Check out what's coming up and reserve your spot today
              </p>
            </div>
            <Link
              to="/classes"
              className="mt-4 md:mt-0 bg-primary hover:bg-accent text-white px-4 py-2 rounded-md transition inline-block"
            >
              View All Classes
            </Link>
          </div>

          {loading.classes ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" color="primary" />
            </div>
          ) : (
            <ClassSchedule
              schedules={upcomingClasses}
              showBookingStatus={false}
            />
          )}
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Membership Plans
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Choose the plan that fits your needs and start your fitness journey
            today
          </p>

          {loading.memberships ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" color="primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {memberships.map((membership, index) => (
                <Card
                  key={membership.id}
                  variant="bordered"
                  hover
                  className="overflow-hidden"
                  padding="none"
                >
                  <div className="p-6 text-center border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">
                      {membership.name}
                    </h3>
                    <p className="text-4xl font-bold text-white mt-4 mb-2">
                      ${membership.monthly_price}
                      <span className="text-base font-normal text-gray-400">
                        /month
                      </span>
                    </p>
                    {/* <p className="text-gray-300 text-sm mb-2">
                      {membership.description}
                    </p> */}
                    {/* {membership.class_limit > 0 && (
                      <p className="text-primary font-semibold">
                        {membership.class_limit} classes per month
                      </p>
                    )} */}
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      <li
                        key="price"
                        className="flex items-center text-gray-300"
                      >
                        <FiCheckCircle className="text-primary mr-2 flex-shrink-0" />
                        <span>{membership.class_limit} classes per month</span>
                      </li>
                      {membershipFeatures[index].map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-gray-300"
                        >
                          <FiCheckCircle className="text-primary mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/auth"
                      className="block w-full text-center bg-primary hover:bg-accent text-white py-2 rounded-md transition"
                    >
                      Get Started
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join Fitness X today and start your journey to a healthier, stronger
            you. Our expert trainers and supportive community are ready to help
            you achieve your goals.
          </p>
          <Link
            to="/auth"
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg transition"
          >
            Join Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
