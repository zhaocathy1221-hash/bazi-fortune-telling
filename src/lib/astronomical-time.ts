/**
 * 真太阳时计算工具
 * 根据出生地和公历时间计算真太阳时
 * 考虑时区、经度、地球运动等因素
 */

export interface Location {
  name: string;
  longitude: number; // 经度，东经为正
  latitude: number;  // 纬度，北纬为正
  timezone: number;  // 时区，东八区为8
}

export interface TrueSolarTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  isLeapYear: boolean;
  dayOfWeek: number;
  julianDay: number;
  equationOfTime: number; // 时差，单位：分钟
  longitudeCorrection: number; // 经度修正，单位：分钟
  totalCorrection: number; // 总修正，单位：分钟
}

// 中国主要城市地理位置数据
export const CHINESE_CITIES: Record<string, Location> = {
  '北京': { name: '北京', longitude: 116.4074, latitude: 39.9042, timezone: 8 },
  '上海': { name: '上海', longitude: 121.4737, latitude: 31.2304, timezone: 8 },
  '广州': { name: '广州', longitude: 113.2644, latitude: 23.1291, timezone: 8 },
  '深圳': { name: '深圳', longitude: 114.0579, latitude: 22.5431, timezone: 8 },
  '天津': { name: '天津', longitude: 117.1994, latitude: 39.0851, timezone: 8 },
  '重庆': { name: '重庆', longitude: 106.5504, latitude: 29.5630, timezone: 8 },
  '杭州': { name: '杭州', longitude: 120.1551, latitude: 30.2741, timezone: 8 },
  '南京': { name: '南京', longitude: 118.7969, latitude: 32.0603, timezone: 8 },
  '武汉': { name: '武汉', longitude: 114.3054, latitude: 30.5928, timezone: 8 },
  '成都': { name: '成都', longitude: 104.0668, latitude: 30.5728, timezone: 8 },
  '西安': { name: '西安', longitude: 108.9402, latitude: 34.3416, timezone: 8 },
  '长沙': { name: '长沙', longitude: 112.9440, latitude: 28.2282, timezone: 8 },
  '郑州': { name: '郑州', longitude: 113.6401, latitude: 34.7466, timezone: 8 },
  '济南': { name: '济南', longitude: 117.1205, latitude: 36.6512, timezone: 8 },
  '青岛': { name: '青岛', longitude: 120.3826, latitude: 36.0671, timezone: 8 },
  '大连': { name: '大连', longitude: 121.6147, latitude: 38.9140, timezone: 8 },
  '沈阳': { name: '沈阳', longitude: 123.4315, latitude: 41.8057, timezone: 8 },
  '哈尔滨': { name: '哈尔滨', longitude: 126.6424, latitude: 45.7576, timezone: 8 },
  '长春': { name: '长春', longitude: 125.3245, latitude: 43.8868, timezone: 8 },
  '石家庄': { name: '石家庄', longitude: 114.4995, latitude: 38.1006, timezone: 8 },
  '太原': { name: '太原', longitude: 112.5492, latitude: 37.8706, timezone: 8 },
  '呼和浩特': { name: '呼和浩特', longitude: 111.7519, latitude: 40.8414, timezone: 8 },
  '乌鲁木齐': { name: '乌鲁木齐', longitude: 87.6168, latitude: 43.8256, timezone: 8 },
  '兰州': { name: '兰州', longitude: 103.8343, latitude: 36.0611, timezone: 8 },
  '西宁': { name: '西宁', longitude: 101.7787, latitude: 36.6232, timezone: 8 },
  '银川': { name: '银川', longitude: 106.2309, latitude: 38.4872, timezone: 8 },
  '拉萨': { name: '拉萨', longitude: 91.1119, latitude: 29.6625, timezone: 8 },
  '昆明': { name: '昆明', longitude: 102.8329, latitude: 24.8801, timezone: 8 },
  '贵阳': { name: '贵阳', longitude: 106.7070, latitude: 26.5982, timezone: 8 },
  '南宁': { name: '南宁', longitude: 108.3665, latitude: 22.8170, timezone: 8 },
  '海口': { name: '海口', longitude: 110.3312, latitude: 20.0442, timezone: 8 },
  '福州': { name: '福州', longitude: 119.2965, latitude: 26.0745, timezone: 8 },
  '南昌': { name: '南昌', longitude: 115.8921, latitude: 28.6765, timezone: 8 },
  '合肥': { name: '合肥', longitude: 117.2830, latitude: 31.8612, timezone: 8 },
  '香港': { name: '香港', longitude: 114.1734, latitude: 22.3193, timezone: 8 },
  '澳门': { name: '澳门', longitude: 113.5491, latitude: 22.1987, timezone: 8 },
  '台北': { name: '台北', longitude: 121.5654, latitude: 25.0330, timezone: 8 }
};

export class AstronomicalTimeCalculator {
  /**
   * 计算儒略日
   * @param year 年份
   * @param month 月份
   * @param day 日期
   * @param hour 小时
   * @param minute 分钟
   * @param second 秒
   * @returns 儒略日
   */
  static julianDay(year: number, month: number, day: number, hour: number, minute: number, second: number): number {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    const jd = Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + b - 1524.5 +
               (hour + minute / 60 + second / 3600) / 24;
    
    return jd;
  }

  /**
   * 计算时差（Equation of Time）
   * @param jd 儒略日
   * @returns 时差，单位：分钟
   */
  static equationOfTime(jd: number): number {
    // 简化计算，基于近似公式
    const t = (jd - 2451545.0) / 36525.0;
    
    // 计算太阳平黄经
    const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    
    // 计算太阳平近点角
    const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    
    // 计算地球轨道偏心率
    const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
    
    // 计算太阳真黄经
    const c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m * Math.PI / 180) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * m * Math.PI / 180) +
              0.000289 * Math.sin(3 * m * Math.PI / 180);
    
    const sunLon = l0 + c;
    
    // 计算时差
    const omega = 125.04 - 1934.136 * t;
    const delta = -2.4657 * Math.sin(2 * (sunLon - omega) * Math.PI / 180) +
                  1.5303 * Math.sin(2 * sunLon * Math.PI / 180) +
                  -0.2088 * Math.sin(sunLon * Math.PI / 180);
    
    return delta;
  }

  /**
   * 计算真太阳时
   * @param year 年份
   * @param month 月份
   * @param day 日期
   * @param hour 小时（标准时）
   * @param minute 分钟（标准时）
   * @param location 地理位置
   * @returns 真太阳时信息
   */
  static calculateTrueSolarTime(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    location: Location
  ): TrueSolarTime {
    // 计算儒略日
    const jd = this.julianDay(year, month, day, hour, minute, 0);
    
    // 计算时差
    const equationOfTime = this.equationOfTime(jd);
    
    // 计算经度修正（相对于标准时区）
    const standardLongitude = (location.timezone - 8) * 15; // 标准时区经度
    const longitudeCorrection = (location.longitude - standardLongitude) * 4; // 每度4分钟
    
    // 总修正
    const totalCorrection = equationOfTime + longitudeCorrection;
    
    // 计算真太阳时
    const totalMinutes = hour * 60 + minute + totalCorrection;
    const trueHour = Math.floor(totalMinutes / 60);
    const trueMinute = Math.floor(totalMinutes % 60);
    const trueSecond = Math.floor((totalMinutes % 1) * 60);
    
    // 处理日期跨越
    let trueYear = year;
    let trueMonth = month;
    let trueDay = day;
    
    if (trueHour >= 24) {
      trueDay += 1;
      trueHour -= 24;
    } else if (trueHour < 0) {
      trueDay -= 1;
      trueHour += 24;
    }
    
    // 计算星期几
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // 判断闰年
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    
    return {
      year: trueYear,
      month: trueMonth,
      day: trueDay,
      hour: trueHour,
      minute: trueMinute,
      second: trueSecond,
      isLeapYear,
      dayOfWeek,
      julianDay: jd,
      equationOfTime,
      longitudeCorrection,
      totalCorrection
    };
  }

  /**
   * 根据城市名称获取位置信息
   * @param cityName 城市名称
   * @returns 位置信息或null
   */
  static getLocationByCity(cityName: string): Location | null {
    return CHINESE_CITIES[cityName] || null;
  }

  /**
   * 获取所有支持的城市列表
   * @returns 城市名称数组
   */
  static getAllCities(): string[] {
    return Object.keys(CHINESE_CITIES);
  }

  /**
   * 格式化真太阳时信息
   * @param trueSolarTime 真太阳时信息
   * @returns 格式化后的字符串
   */
  static formatTrueSolarTime(trueSolarTime: TrueSolarTime): string {
    return `${trueSolarTime.year}年${trueSolarTime.month}月${trueSolarTime.day}日 ${trueSolarTime.hour.toString().padStart(2, '0')}:${trueSolarTime.minute.toString().padStart(2, '0')}:${trueSolarTime.second.toString().padStart(2, '0')}`;
  }

  /**
   * 获取修正信息
   * @param trueSolarTime 真太阳时信息
   * @returns 修正信息描述
   */
  static getCorrectionInfo(trueSolarTime: TrueSolarTime): string {
    const eot = trueSolarTime.equationOfTime;
    const lon = trueSolarTime.longitudeCorrection;
    const total = trueSolarTime.totalCorrection;
    
    return `时差修正: ${eot > 0 ? '+' : ''}${eot.toFixed(2)}分钟, 经度修正: ${lon > 0 ? '+' : ''}${lon.toFixed(2)}分钟, 总修正: ${total > 0 ? '+' : ''}${total.toFixed(2)}分钟`;
  }
}

// 使用示例
// const location = AstronomicalTimeCalculator.getLocationByCity('北京');
// if (location) {
//   const trueSolarTime = AstronomicalTimeCalculator.calculateTrueSolarTime(1993, 1, 13, 6, 50, location);
//   console.log('真太阳时:', AstronomicalTimeCalculator.formatTrueSolarTime(trueSolarTime));
//   console.log('修正信息:', AstronomicalTimeCalculator.getCorrectionInfo(trueSolarTime));
// }