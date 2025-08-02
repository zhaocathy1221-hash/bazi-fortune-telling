import { DateTime } from 'luxon';

export interface LocationData {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffset: number;
}

export interface TimeCalibration {
  originalTime: Date;
  timezoneOffset: number;
  solarTimeOffset: number;
  calibratedTime: Date;
  location: LocationData;
}

/**
 * Calculate equation of time for true solar time
 * Based on astronomical algorithms
 */
export function calculateEquationOfTime(date: Date, longitude: number): number {
  const dayOfYear = DateTime.fromJSDate(date).ordinal;
  const B = 2 * Math.PI * (dayOfYear - 81) / 365;
  
  // Equation of time in minutes
  const equationOfTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  
  // Convert to milliseconds offset
  return equationOfTime * 60 * 1000;
}

/**
 * Calculate longitude-based time offset
 */
export function calculateLongitudeOffset(longitude: number): number {
  // Each degree = 4 minutes offset
  return (longitude - 120) * 4 * 60 * 1000; // 120°E is China standard meridian
}

/**
 * Calculate true solar time adjustment
 */
export function calculateSolarTimeAdjustment(date: Date, longitude: number): number {
  const equationOfTime = calculateEquationOfTime(date, longitude);
  const longitudeOffset = calculateLongitudeOffset(longitude);
  
  return equationOfTime + longitudeOffset;
}

/**
 * Get calibrated birth time based on location
 */
export function getCalibratedBirthTime(
  birthDate: Date,
  location: LocationData
): TimeCalibration {
  const originalTime = new Date(birthDate);
  
  // Get timezone offset
  const localTime = DateTime.fromJSDate(birthDate).setZone(location.timezone);
  const timezoneOffset = localTime.offset * 60 * 1000; // Convert to milliseconds
  
  // Calculate solar time adjustment
  const solarTimeOffset = calculateSolarTimeAdjustment(birthDate, location.longitude);
  
  // Apply both timezone and solar corrections
  const totalOffset = timezoneOffset + solarTimeOffset;
  const calibratedTime = new Date(originalTime.getTime() + totalOffset);
  
  return {
    originalTime,
    timezoneOffset,
    solarTimeOffset,
    calibratedTime,
    location
  };
}

/**
 * Common Chinese cities with timezone data
 */
export const CHINA_CITIES: LocationData[] = [
  { name: '北京', country: '中国', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '上海', country: '中国', latitude: 31.2304, longitude: 121.4737, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '广州', country: '中国', latitude: 23.1291, longitude: 113.2644, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '深圳', country: '中国', latitude: 22.3193, longitude: 114.1694, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '成都', country: '中国', latitude: 30.5728, longitude: 104.0668, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '杭州', country: '中国', latitude: 30.2741, longitude: 120.1551, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '武汉', country: '中国', latitude: 30.5928, longitude: 114.3055, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '西安', country: '中国', latitude: 34.3416, longitude: 108.9398, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '重庆', country: '中国', latitude: 29.5630, longitude: 106.5516, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '南京', country: '中国', latitude: 32.0603, longitude: 118.7969, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '天津', country: '中国', latitude: 39.3434, longitude: 117.3616, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '苏州', country: '中国', latitude: 31.2990, longitude: 120.5853, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '青岛', country: '中国', latitude: 36.0671, longitude: 120.3826, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '沈阳', country: '中国', latitude: 41.8057, longitude: 123.4315, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '大连', country: '中国', latitude: 38.9140, longitude: 121.6147, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '厦门', country: '中国', latitude: 24.4798, longitude: 118.0894, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '哈尔滨', country: '中国', latitude: 45.8038, longitude: 126.5340, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '济南', country: '中国', latitude: 36.6512, longitude: 117.1201, timezone: 'Asia/Shanghai', utcOffset: 480 },
  { name: '郑州', country: '中国', latitude: 34.7466, longitude: 113.6254, timezone: 'Asia/Shanghai', utcOffset: 480 },
];

/**
 * Search cities by name (fuzzy matching)
 */
export function searchCities(query: string): LocationData[] {
  if (!query) return CHINA_CITIES.slice(0, 8);
  
  const normalizedQuery = query.toLowerCase();
  return CHINA_CITIES.filter(city => 
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.country.toLowerCase().includes(normalizedQuery)
  );
}