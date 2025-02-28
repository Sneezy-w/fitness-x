import api from "./api";
import {
  MembershipType,
  MembershipSubscription,
  FreeClassAllocation,
  PaymentHistory,
  Member,
} from "../types/models";

// Function to fetch current member profile
export const fetchMemberProfile = async (): Promise<Member> => {
  const response = await api.get("/members/profile");
  return response.data;
};

// Function to update member profile
export const updateMemberProfile = async (data: {
  full_name?: string;
  phone?: string;
}): Promise<Member> => {
  const response = await api.patch("/members/profile", data);
  return response.data;
};

// Function to fetch all available membership types
export const fetchMembershipTypes = async (): Promise<MembershipType[]> => {
  const response = await api.get("/membership-types");
  return response.data;
};

// Function to fetch current member's subscription
export const fetchCurrentSubscription =
  async (): Promise<MembershipSubscription | null> => {
    try {
      const response = await api.get("/membership-subscriptions/current");
      return response.data;
    } catch (error) {
      // Handle case where member has no active subscription
      return null;
    }
  };

// Function to subscribe to a membership type
export const subscribeMembership = async (
  membershipTypeId: number,
  paymentMethodId: string
): Promise<MembershipSubscription> => {
  const response = await api.post("/membership-subscriptions", {
    membership_type_id: membershipTypeId,
    payment_method_id: paymentMethodId,
  });
  return response.data;
};

// Function to cancel membership subscription
export const cancelSubscription = async (): Promise<void> => {
  await api.delete("/membership-subscriptions/current");
};

// Function to fetch free class allocations
export const fetchFreeClassAllocations = async (): Promise<
  FreeClassAllocation[]
> => {
  const response = await api.get("/free-class-allocations");
  return response.data;
};

// Function to get total remaining free classes
export const getRemainingFreeClasses = async (): Promise<number> => {
  const allocations = await fetchFreeClassAllocations();
  return allocations.reduce(
    (total, allocation) => total + allocation.quantity,
    0
  );
};

// Function to fetch payment history
export const fetchPaymentHistory = async (): Promise<PaymentHistory[]> => {
  const response = await api.get("/payments/history");
  return response.data;
};

// Function to add a payment method
export const addPaymentMethod = async (
  paymentMethodId: string
): Promise<void> => {
  await api.post("/members/payment-methods", {
    payment_method_id: paymentMethodId,
  });
};

// Function to get stripe setup intent (for adding payment methods)
export const getSetupIntent = async (): Promise<{ client_secret: string }> => {
  const response = await api.get("/payments/setup-intent");
  return response.data;
};
