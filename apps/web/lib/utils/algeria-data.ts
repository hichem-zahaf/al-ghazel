/**
 * Algeria Data Utilities
 * Functions for loading/filtering wilayas and cities, and phone validation
 */

import type { Wilaya, City } from '~/types/bookstore';
import wilayasData from '~/config/json/algeria_wilayas.json';
import citiesData from '~/config/json/algeria_cities.json';

/**
 * Get all wilayas
 */
export function getAllWilayas(): Wilaya[] {
  return wilayasData as Wilaya[];
}

/**
 * Get cities by wilaya code
 */
export function getCitiesByWilaya(wilayaCode: string): City[] {
  return citiesData.filter((city) => city.wilaya_code === wilayaCode);
}

/**
 * Get wilaya by code
 */
export function getWilayaByCode(code: string): Wilaya | undefined {
  return wilayasData.find((w) => w.wilaya_code === code);
}

/**
 * Get wilaya name by code
 */
export function getWilayaName(code: string): string {
  const wilaya = getWilayaByCode(code);
  return wilaya?.wilaya_name_ascii || '';
}

/**
 * Phone validation for Algeria (06, 07, 05 prefixes, 10 digits)
 */
export function isValidAlgerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(05|06|07)\d{8}$/;
  return regex.test(cleaned);
}

/**
 * Format phone number with spaces
 * Formats as XXX XXX XXXX
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Get city name (prioritize Arabic, fallback to ASCII)
 */
export function getCityName(city: City): string {
  return city.commune_name_ascii || city.commune_name;
}

/**
 * Get all city names for a wilaya (for autocomplete/search)
 */
export function getCityNamesForWilaya(wilayaCode: string): string[] {
  const cities = getCitiesByWilaya(wilayaCode);
  return cities.map((city) => city.commune_name_ascii);
}

/**
 * Search cities by name
 */
export function searchCities(query: string, wilayaCode?: string): City[] {
  const lowerQuery = query.toLowerCase();
  let cities = citiesData;

  if (wilayaCode) {
    cities = cities.filter((city) => city.wilaya_code === wilayaCode);
  }

  return cities.filter(
    (city) =>
      city.commune_name_ascii.toLowerCase().includes(lowerQuery) ||
      city.commune_name.includes(lowerQuery)
  );
}

/**
 * Get delivery charge for wilaya (can be extended later)
 * For now, returns base charge from delivery config
 */
export async function getDeliveryChargeForWilaya(
  wilayaCode: string,
  deliveryType: 'home_delivery' | 'office_delivery'
): Promise<number> {
  const { deliveryTypes } = await import('~/config/delivery.config');
  const deliveryCharge =
    deliveryType === 'home_delivery'
      ? deliveryTypes.HOME_DELIVERY.baseFee
      : deliveryTypes.OFFICE_DELIVERY.baseFee;
  return deliveryCharge;
}
