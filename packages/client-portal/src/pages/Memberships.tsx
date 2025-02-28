import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiHelpCircle } from "react-icons/fi";
import api from "../services/api";
import toast from "react-hot-toast";
import { MembershipType } from "../types/models";

// interface MembershipType {
//   id: string;
//   name: string;
//   price: number;
//   description: string;
//   classesPerMonth: number;
//   features: string[];
// }

const defaultMemberships: MembershipType[] = [
  {
    id: 1,
    name: "Free",
    monthly_price: 0,
    class_limit: 0,
    is_active: true,
    //description: "Basic access to the fitness center with limited features",
    //classesPerMonth: 0,
    //features: [
    //  "Limited gym access",
    //  "No free classes included",
    //  "Basic amenities",
    //  "Online account",
    //],
  },
  {
    id: 2,
    name: "Basic",
    monthly_price: 250,
    class_limit: 20,
    is_active: true,
    //description:
    //  "Full access to the fitness center with a reasonable amount of classes",
    //classesPerMonth: 20,
    //features: [
    //  "Full gym access",
    //  "20 classes per month",
    //  "Standard amenities",
    //  "Fitness assessment",
    //  "Free parking",
    //  "Online booking",
    //],
  },
  {
    id: 3,
    name: "Premium",
    monthly_price: 400,
    class_limit: 30,
    is_active: true,
    //description: "Premium access to all facilities with maximum flexibility",
    //classesPerMonth: 30,
    //features: [
    //  "24/7 gym access",
    //  "30 classes per month",
    //  "Premium amenities",
    //  "Personalized fitness plan",
    //  "Free guest passes",
    //  "Priority booking",
    //  "Nutritional counseling",
    //],
  },
];

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

const Memberships = () => {
  const [memberships, setMemberships] =
    useState<MembershipType[]>(defaultMemberships);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number>();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const response = await api.get("/membership-types");
        setMemberships(
          response.data.map((membership: MembershipType, index: number) => ({
            ...membership,
            features: membershipFeatures[index],
          }))
        );
      } catch (error) {
        console.error("Error fetching memberships:", error);
        // Keep default memberships if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
  };

  const toggleTooltip = (feature: string) => {
    if (showTooltip === feature) {
      setShowTooltip(null);
    } else {
      setShowTooltip(feature);
    }
  };

  const tooltipInfo: { [key: string]: string } = {
    "Limited gym access":
      "Access to gym facilities during off-peak hours only.",
    "Full gym access": "Access to gym facilities during all operating hours.",
    "24/7 gym access": "Unlimited access to gym facilities at any time.",
    "Basic amenities": "Includes lockers and shower facilities.",
    "Standard amenities":
      "Includes lockers, shower facilities, towel service, and sauna.",
    "Premium amenities":
      "Includes all standard amenities plus private changing rooms, steam room, and spa services.",
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="relative bg-black text-white py-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')",
            opacity: 0.4,
          }}
        ></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Membership <span className="text-primary">Plans</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Choose the perfect membership plan that fits your fitness goals and
            budget. All plans include access to our state-of-the-art facilities.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-300">No hidden fees. Cancel anytime.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {memberships.map((membership, index) => (
                <div
                  key={membership.id}
                  className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
                    index === 1
                      ? "transform scale-105 border-2 border-primary bg-secondary"
                      : "bg-secondary hover:transform hover:scale-105"
                  }`}
                >
                  {index === 1 && (
                    <div className="bg-primary text-white text-center py-1 text-sm font-semibold">
                      MOST POPULAR
                    </div>
                  )}
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
                    <ul className="space-y-3">
                      <li
                        key="price"
                        className="flex items-center text-gray-300 relative"
                      >
                        <FiCheckCircle className="text-primary mr-2 flex-shrink-0" />
                        <span>{membership.class_limit} classes per month</span>
                      </li>
                      {membershipFeatures[index].map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center text-gray-300 relative"
                        >
                          <FiCheckCircle className="text-primary mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                          {tooltipInfo[feature] && (
                            <button
                              className="ml-2 text-gray-400 hover:text-gray-200"
                              onClick={() => toggleTooltip(feature)}
                            >
                              <FiHelpCircle />
                            </button>
                          )}
                          {showTooltip === feature && tooltipInfo[feature] && (
                            <div className="absolute left-0 bottom-full mb-2 p-2 bg-primary text-white rounded-md text-xs w-48 z-10">
                              {tooltipInfo[feature]}
                              <div className="absolute left-4 bottom-0 transform translate-y-1/2 rotate-45 w-2 h-2 bg-primary"></div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/auth"
                      className={`block w-full text-center ${
                        membership.id === selectedPlan
                          ? "bg-primary hover:bg-accent"
                          : "bg-neutral hover:bg-gray-800"
                      } text-white mt-6 py-2 rounded-md transition`}
                      onClick={() => handleSelectPlan(membership.id)}
                    >
                      {membership.monthly_price === 0
                        ? "Sign Up Free"
                        : "Get Started"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-3">
                Can I cancel my membership at any time?
              </h3>
              <p className="text-gray-300">
                Yes, you can cancel your membership at any time. However,
                cancellations take effect at the end of your current billing
                cycle.
              </p>
            </div>

            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-3">
                How do I book classes?
              </h3>
              <p className="text-gray-300">
                Members can book classes through their dashboard after signing
                in. You can view available classes and book up to 7 days in
                advance.
              </p>
            </div>

            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-3">
                What happens if I don't use all my classes in a month?
              </h3>
              <p className="text-gray-300">
                Class allocations reset at the beginning of each billing cycle.
                Unused classes do not roll over to the next month.
              </p>
            </div>

            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-3">
                Can I upgrade or downgrade my membership?
              </h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your membership at any time.
                Changes will take effect at the beginning of your next billing
                cycle.
              </p>
            </div>

            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-3">
                Is there a joining fee?
              </h3>
              <p className="text-gray-300">
                No, there are no joining fees or hidden costs. You only pay the
                monthly fee for your chosen membership plan.
              </p>
            </div>

            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-3">
                How do I get free class allocations?
              </h3>
              <p className="text-gray-300">
                Administrators may allocate free classes to members as part of
                promotions or special offers. These will appear in your account
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-neutral">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join Fitness X today and take the first step towards achieving your
            fitness goals with our expert trainers and premium facilities.
          </p>
          <Link
            to="/auth"
            className="bg-primary hover:bg-accent text-white px-8 py-3 rounded-md font-semibold transition inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Memberships;
