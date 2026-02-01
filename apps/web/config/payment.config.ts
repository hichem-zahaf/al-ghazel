/**
 * Payment Configuration
 *
 * Defines available payment methods for the bookstore checkout.
 */

export const paymentMethods = {
  PAYMENT_ON_DELIVERY: {
    id: 'payment_on_delivery',
    name: 'Payment on Delivery',
    description: 'Pay when you receive your order',
    enabled: true,
  },
} as const;

export type PaymentMethodId = keyof typeof paymentMethods;

export const getPaymentMethod = (id: string) => {
  return Object.values(paymentMethods).find((method) => method.id === id);
};

export const getEnabledPaymentMethods = () => {
  return Object.values(paymentMethods).filter((method) => method.enabled);
};
