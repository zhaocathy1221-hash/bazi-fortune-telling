/**
 * 时区集成示例和使用方法
 * 
 * 这个文件展示了如何在八字计算中集成真太阳时和时区校准
 */

import { calculateBazi } from './bazi-calculator';
import { getCalibratedBirthTime, LocationData } from './timezone-calculator';

export interface CompleteBirthData {
  birthDate: Date;
  birthTime: string;
  gender: 'male' | 'female';
  calendarType: 'lunar' | 'solar';
  location: LocationData;
}

/**
 * 完整的八字计算流程
 * 包含真太阳时校准的完整计算过程
 */
export function calculateBaziWithTimezone(birthData: CompleteBirthData) {
  const { birthDate, birthTime, gender, calendarType, location } = birthData;
  
  // 第1步：计算真太阳时校准
  const timeCalibration = getCalibratedBirthTime(birthDate, location);
  
  // 第2步：使用校准后的时间进行八字计算
  const baziResult = calculateBazi({
    birthDate: birthDate,
    birthTime: birthTime,
    gender,
    calendarType,
    calibratedDate: timeCalibration.calibratedTime
  });
  
  return {
    bazi: baziResult,
    calibration: timeCalibration,
    metadata: {
      originalTime: timeCalibration.originalTime,
      calibratedTime: timeCalibration.calibratedTime,
      timezoneOffset: timeCalibration.timezoneOffset,
      solarTimeOffset: timeCalibration.solarTimeOffset,
      location: timeCalibration.location
    }
  };
}

/**
 * 时间校准说明生成器
 */
export function generateCalibrationExplanation(calibration: any) {
  const original = calibration.originalTime;
  const calibrated = calibration.calibratedTime;
  const diff = Math.abs(calibration.timezoneOffset + calibration.solarTimeOffset);
  const diffMinutes = Math.round(diff / (60 * 1000));
  
  let explanation = `\n### 时间校准说明\n\n`;
  explanation += `**原始时间：** ${original.toLocaleString('zh-CN')}\n\n`;
  explanation += `**校准后时间：** ${calibrated.toLocaleString('zh-CN')}\n\n`;
  
  if (diffMinutes > 0) {
    explanation += `**时间调整：** ${diffMinutes}分钟\n\n`;
    explanation += `**调整原因：**\n`;
    
    if (Math.abs(calibration.timezoneOffset) > 0) {
      const tzMinutes = Math.round(Math.abs(calibration.timezoneOffset) / (60 * 1000));
      explanation += `- 时区调整：${tzMinutes}分钟\n`;
    }
    
    if (Math.abs(calibration.solarTimeOffset) > 0) {
      const solarMinutes = Math.round(Math.abs(calibration.solarTimeOffset) / (60 * 1000));
      explanation += `- 真太阳时调整：${solarMinutes}分钟\n`;
    }
    
    explanation += `\n**影响：** 这种微调可能会影响到时辰的准确性，从而影响八字时柱。\n`;
  } else {
    explanation += `**无需调整：** 您的出生地点和标准时区基本一致。\n`;
  }
  
  return explanation;
}

/**
 * 使用示例
 */
export const usageExample = `
// 使用示例
import { calculateBaziWithTimezone } from '@/lib/timezone-integration';
import { CHINA_CITIES } from '@/lib/timezone-calculator';

// 用户输入的数据
const birthData = {
  birthDate: new Date('1990-05-15'),
  birthTime: '14:30',
  gender: 'male' as const,
  calendarType: 'solar' as const,
  location: CHINA_CITIES[0] // 北京
};

// 计算包含时区校准的八字
const result = calculateBaziWithTimezone(birthData);

console.log('八字结果：', result.bazi);
console.log('时间校准：', result.calibration);
console.log('校准说明：', generateCalibrationExplanation(result.calibration));
`;

/**
 * 常见城市时区差异参考
 */
export const TIMEZONE_DIFFERENCES = {
  '北京': { offset: 0, description: '标准时区，无需调整' },
  '上海': { offset: 0, description: '标准时区，无需调整' },
  '广州': { offset: -4, description: '比标准时区慢4分钟' },
  '乌鲁木齐': { offset: -96, description: '比标准时区慢96分钟' },
  '拉萨': { offset: -64, description: '比标准时区慢64分钟' }
};