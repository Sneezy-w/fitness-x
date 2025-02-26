export interface StripePaymentIntent {
  id: string;
  amount: number;
  amount_received: number;
  currency: string;
  status: string;
  client_secret: string;
  customer?: string;
  metadata?: Record<string, any>;
}
