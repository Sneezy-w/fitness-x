import { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiCreditCard,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";
import moment from "moment";
import { MembershipType } from "../../types/models";

// Add default features arrays
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

interface MembershipSubscription {
  id: string;
  membershipTypeId: string;
  membershipType: MembershipType;
  startDate: string;
  expireDate: string;
  status: "active" | "expired" | "canceled";
  remainingClasses: number;
  autoRenew: boolean;
  stripeSubscriptionId?: string;
}

interface FreeClassAllocation {
  id: string;
  totalClasses: number;
  remainingClasses: number;
  description?: string;
}

const Membership = () => {
  const [currentMembership, setCurrentMembership] =
    useState<MembershipSubscription | null>(null);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  // const [freeClasses, setFreeClasses] = useState<FreeClassAllocation | null>(
  //   null
  // );
  const [loading, setLoading] = useState({
    membership: true,
    membershipTypes: true,
    //freeClasses: true,
  });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchCurrentMembership();
    fetchMembershipTypes();
    //fetchFreeClassAllocations();
  }, []);

  const fetchCurrentMembership = async () => {
    try {
      setLoading((prev) => ({ ...prev, membership: true }));
      const response = await api.get(
        "/membership-subscriptions/member/current"
      );

      if (response.data) {
        setCurrentMembership(response.data);
      }
    } catch (error) {
      console.error("Error fetching current membership:", error);
      // Don't show error toast as it's normal for new users to not have a membership
    } finally {
      setLoading((prev) => ({ ...prev, membership: false }));
    }
  };

  const fetchMembershipTypes = async () => {
    try {
      setLoading((prev) => ({ ...prev, membershipTypes: true }));
      const response = await api.get("/membership-types");

      // Mark the active membership and add features
      const typesWithActive = response.data.map(
        (type: MembershipType, index: number) => ({
          ...type,
          isActive: currentMembership?.membershipTypeId === type.id,
          features: membershipFeatures[index % membershipFeatures.length],
        })
      );

      setMembershipTypes(typesWithActive);
    } catch (error) {
      console.error("Error fetching membership types:", error);
      toast.error("Failed to load membership options. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, membershipTypes: false }));
    }
  };

  // const fetchFreeClassAllocations = async () => {
  //   try {
  //     setLoading((prev) => ({ ...prev, freeClasses: true }));
  //     const response = await api.get("/free-class-allocations/current");

  //     if (response.data?.remainingClasses > 0) {
  //       setFreeClasses(response.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching free class allocations:", error);
  //     // Don't show error toast as it's normal for users to not have free classes
  //   } finally {
  //     setLoading((prev) => ({ ...prev, freeClasses: false }));
  //   }
  // };

  const handleSelectPlan = (membershipTypeId: string) => {
    setSelectedPlan(membershipTypeId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      setProcessingPayment(true);

      // Create a checkout session
      const response = await api.post("/payments/create-checkout", {
        membershipTypeId: selectedPlan,
      });

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to initiate payment process. Please try again.");
      setProcessingPayment(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!currentMembership) return;

    try {
      await api.post(
        `/membership-subscriptions/${currentMembership.id}/cancel`
      );
      toast.success(
        "Your membership has been canceled. It will remain active until the end of your billing period."
      );

      // Refresh membership data
      fetchCurrentMembership();
    } catch (error) {
      console.error("Error canceling membership:", error);
      toast.error("Failed to cancel membership. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMMM D, YYYY");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Membership</h1>
        <p className="text-gray-300">Manage your membership and subscription</p>
      </div>

      {/* Current Membership Section */}
      <div className="bg-secondary rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          Current Membership
        </h2>

        {loading.membership ? (
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
        ) : currentMembership ? (
          <div>
            <div
              className={`p-4 rounded-lg ${
                currentMembership.status === "active"
                  ? "bg-green-900/20 border border-green-700"
                  : "bg-yellow-900/20 border border-yellow-700"
              } mb-4`}
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    currentMembership.status === "active"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {currentMembership.status === "active" ? (
                    <FiCheckCircle size={24} />
                  ) : (
                    <FiAlertCircle size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {currentMembership.status === "active"
                      ? "Active Membership"
                      : "Expired Membership"}
                  </h3>
                  <p className="text-gray-300">
                    {currentMembership.status === "active"
                      ? `Your membership is active until ${formatDate(
                          currentMembership.expireDate
                        )}`
                      : "Your membership has expired. Please renew to continue enjoying our services."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral p-4 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {currentMembership.membershipType.name}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {currentMembership.membershipType.description}
                  </p>
                </div>
                <div className="mt-3 md:mt-0 text-right">
                  <p className="text-xl font-bold text-white">
                    ${currentMembership.membershipType.monthly_price}
                    <span className="text-sm font-normal text-gray-400">
                      /month
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-neutral p-4 rounded-lg">
                <div className="text-primary text-2xl mb-2">
                  <FiCalendar />
                </div>
                <h4 className="text-white font-semibold mb-1">
                  Remaining Classes
                </h4>
                <p className="text-2xl font-bold text-white">
                  {currentMembership.remainingClasses}
                  <span className="text-sm font-normal text-gray-400">
                    /{currentMembership.membershipType.class_limit}
                  </span>
                </p>
              </div>

              <div className="bg-neutral p-4 rounded-lg">
                <div className="text-primary text-2xl mb-2">
                  <FiCreditCard />
                </div>
                <h4 className="text-white font-semibold mb-1">
                  Renewal Status
                </h4>
                <p className="text-gray-300">
                  {currentMembership.autoRenew
                    ? "Auto-renews on "
                    : "Expires on "}
                  {formatDate(currentMembership.expireDate)}
                </p>
              </div>

              <div className="bg-neutral p-4 rounded-lg">
                <div className="text-primary text-2xl mb-2">
                  <FiCalendar />
                </div>
                <h4 className="text-white font-semibold mb-1">Started On</h4>
                <p className="text-gray-300">
                  {formatDate(currentMembership.startDate)}
                </p>
              </div>
            </div>

            {currentMembership.status === "active" && (
              <div className="flex justify-end">
                <button
                  onClick={handleCancelMembership}
                  className="text-red-500 hover:text-white border border-red-500 hover:bg-red-500 px-4 py-2 rounded-md transition"
                >
                  Cancel Membership
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">
              <FiCreditCard className="inline-block" />
            </div>
            <h3 className="text-xl text-white mb-2">No Active Membership</h3>
            <p className="text-gray-400 mb-4">
              You don't have an active membership subscription. Choose from our
              membership plans below.
            </p>
          </div>
        )}
      </div>

      {/* Free Classes Section */}
      {/* {freeClasses && freeClasses.remainingClasses > 0 && (
        <div className="bg-secondary rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Free Classes</h2>
          <div className="bg-neutral p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Free Class Credits
                </h3>
                <p className="text-gray-400 mt-1">
                  {freeClasses.description ||
                    "Special allocation of free classes"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">
                  {freeClasses.remainingClasses}
                  <span className="text-sm font-normal text-gray-400">
                    /{freeClasses.totalClasses}
                  </span>
                </p>
                <p className="text-gray-400 text-sm">remaining classes</p>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Membership Plans Section */}
      <div className="bg-secondary rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold text-white mb-6">Membership Plans</h2>

        {loading.membershipTypes ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded mb-4"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipTypes.map((membershipType) => (
              <div
                key={membershipType.id}
                className={`rounded-lg overflow-hidden border-2 ${
                  selectedPlan === membershipType.id
                    ? "border-primary"
                    : membershipType.isActive
                    ? "border-green-500"
                    : "border-gray-700"
                } transition-all duration-300 hover:transform hover:scale-105 bg-neutral`}
              >
                {membershipType.isActive && (
                  <div className="bg-green-600 text-white text-center py-1 text-sm font-semibold">
                    CURRENT PLAN
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {membershipType.name}
                  </h3>
                  <p className="text-3xl font-bold text-white mb-4">
                    ${membershipType.monthly_price}
                    <span className="text-base font-normal text-gray-400">
                      /month
                    </span>
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    {membershipType.description ||
                      "Premium membership with exclusive benefits"}
                  </p>
                  <p className="text-primary font-semibold mb-4">
                    {membershipType.class_limit} classes per month
                  </p>
                  <ul className="space-y-2 mb-6">
                    {membershipType.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-300"
                      >
                        <FiCheckCircle className="text-primary mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!membershipType.isActive && (
                    <button
                      onClick={() => handleSelectPlan(membershipType.id)}
                      className={`w-full py-2 rounded ${
                        selectedPlan === membershipType.id
                          ? "bg-primary hover:bg-accent text-white"
                          : "text-primary border border-primary hover:bg-primary hover:text-white"
                      } transition`}
                    >
                      {selectedPlan === membershipType.id
                        ? "Selected"
                        : "Select Plan"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPlan && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSubscribe}
              className="bg-primary hover:bg-accent text-white px-8 py-3 rounded-md text-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processingPayment}
            >
              {processingPayment ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Processing...
                </span>
              ) : (
                "Subscribe Now"
              )}
            </button>
            <p className="text-gray-400 text-sm mt-2">
              You'll be redirected to our secure payment processor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Membership;
