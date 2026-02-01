/**
 * Delivery Configuration
 *
 * Defines delivery types and their charges for the bookstore checkout.
 */

export const deliveryTypes = {
  HOME_DELIVERY: {
    id: 'home_delivery',
    name: 'Home Delivery',
    description: 'Delivered to your address',
    baseFee: 300, // Static for now, can be made dynamic later
  },
  OFFICE_DELIVERY: {
    id: 'office_delivery',
    name: 'Office Delivery',
    description: 'Pick up at nearest office',
    baseFee: 200, // Static for now, can be made dynamic later
  },
} as const;

export type DeliveryTypeId = keyof typeof deliveryTypes;

export const getDeliveryType = (id: string) => {
  return Object.values(deliveryTypes).find((type) => type.id === id);
};

export const getDeliveryCharge = (deliveryTypeId: string): number => {
  const deliveryType = getDeliveryType(deliveryTypeId);
  return deliveryType?.baseFee ?? 0;
};
