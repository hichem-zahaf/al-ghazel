/**
 * Algeria Data Utilities
 * Functions for loading/filtering wilayas and communes, and phone validation
 *
 * Uses the 2025 Administrative Reform data with 58 wilayas and 1541 communes.
 */

import type { Wilaya, Commune, City } from '~/types/bookstore';
import citiesData from '~/config/json/cities.json';

// Extract typed data from the JSON structure
const wilayasRaw: Wilaya[] = citiesData.wilayas;
const communesRaw: Commune[] = citiesData.communes;

// Create indexed structures for O(1) lookups
const communesByWilayaMap = new Map<number, Commune[]>();
const wilayaByIdMap = new Map<number, Wilaya>();

// Initialize indexes
communesRaw.forEach((commune) => {
  if (!communesByWilayaMap.has(commune.wilaya_id)) {
    communesByWilayaMap.set(commune.wilaya_id, []);
  }
  communesByWilayaMap.get(commune.wilaya_id)!.push(commune);
});

wilayasRaw.forEach((wilaya) => {
  wilayaByIdMap.set(wilaya.wilaya_id, wilaya);
});

/**
 * Get all wilayas
 */
export function getAllWilayas(): Wilaya[] {
  return wilayasRaw;
}

/**
 * Get communes by wilaya ID (efficient O(1) lookup using pre-built index)
 */
export function getCommunesByWilaya(wilayaId: number): Commune[] {
  return communesByWilayaMap.get(wilayaId) || [];
}

/**
 * Get cities by wilaya ID (alias for getCommunesByWilaya for compatibility)
 */
export function getCitiesByWilaya(wilayaId: number): City[] {
  return getCommunesByWilaya(wilayaId);
}

/**
 * Get cities by wilaya code string (legacy support - converts "01" to 1)
 */
export function getCitiesByWilayaCode(wilayaCode: string): City[] {
  const wilayaId = parseInt(wilayaCode, 10);
  return getCommunesByWilaya(wilayaId);
}

/**
 * Get wilaya by ID
 */
export function getWilayaById(wilayaId: number): Wilaya | undefined {
  return wilayaByIdMap.get(wilayaId);
}

/**
 * Get wilaya by code string (legacy support - converts "01" to 1)
 */
export function getWilayaByCode(code: string): Wilaya | undefined {
  const wilayaId = parseInt(code, 10);
  return getWilayaById(wilayaId);
}

/**
 * Get wilaya Latin name by ID
 */
export function getWilayaName(wilayaId: number): string {
  const wilaya = getWilayaById(wilayaId);
  return wilaya?.wilaya_name_latin || '';
}

/**
 * Get wilaya Arabic name by ID
 */
export function getWilayaNameArabic(wilayaId: number): string {
  const wilaya = getWilayaById(wilayaId);
  return wilaya?.wilaya_name_arabic || '';
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
 * Get commune name (prioritize Latin/ASCII, fallback to Arabic)
 */
export function getCommuneName(commune: Commune): string {
  return commune.commune_name_latin || commune.commune_name_arabic;
}

/**
 * Get city name (alias for getCommuneName for compatibility)
 */
export function getCityName(city: City): string {
  return getCommuneName(city);
}

/**
 * Get all commune Latin names for a wilaya (for autocomplete/search)
 */
export function getCommuneNamesForWilaya(wilayaId: number): string[] {
  const communes = getCommunesByWilaya(wilayaId);
  return communes.map((c) => c.commune_name_latin);
}

/**
 * Get all city names for a wilaya (alias for getCommuneNamesForWilaya)
 */
export function getCityNamesForWilaya(wilayaId: number): string[] {
  return getCommuneNamesForWilaya(wilayaId);
}

/**
 * Search communes by name (Latin or Arabic)
 */
export function searchCommunes(query: string, wilayaId?: number): Commune[] {
  const lowerQuery = query.toLowerCase();
  let communes = communesRaw;

  if (wilayaId !== undefined) {
    communes = communes.filter((c) => c.wilaya_id === wilayaId);
  }

  return communes.filter(
    (c) =>
      c.commune_name_latin.toLowerCase().includes(lowerQuery) ||
      c.commune_name_arabic.includes(lowerQuery)
  );
}

/**
 * Search cities by name (alias for searchCommunes)
 */
export function searchCities(query: string, wilayaId?: number): City[] {
  return searchCommunes(query, wilayaId);
}

/**
 * Get delivery charge for wilaya (can be extended later)
 * For now, returns base charge from delivery config
 */
export async function getDeliveryChargeForWilaya(
  wilayaId: number,
  deliveryType: 'home_delivery' | 'office_delivery'
): Promise<number> {
  const { deliveryTypes } = await import('~/config/delivery.config');
  const deliveryCharge =
    deliveryType === 'home_delivery'
      ? deliveryTypes.HOME_DELIVERY.baseFee
      : deliveryTypes.OFFICE_DELIVERY.baseFee;
  return deliveryCharge;
}
