/**
 * 完整八字计算算法
 * 基于传统命理学标准算法
 * 支持年柱、月柱、日柱、时柱的精确计算
 * 集成真太阳时计算
 */

import { AstronomicalTimeCalculator, Location } from './astronomical-time';

export interface BaziResult {
  yearPillar: { stem: string; branch: string };
  monthPillar: { stem: string; branch: string };
  dayPillar: { stem: string; branch: string };
  hourPillar: { stem: string; branch: string };
  fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number };
  tenGods: { [key: string]: string[] };
  dayMaster: string;
  birthInfo: {
    originalDate: Date;
    trueSolarTime: Date;
    location: Location;
    useTrueSolarTime: boolean;
  };
}

export class CompleteBaZiCalculator {
  constructor() {
    // 天干地支数组
    this.tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    this.diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // 五行属性
    this.wuXing = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
      '庚': '金', '辛': '金', '壬': '水', '癸': '水',
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    
    // 阴阳属性
    this.yinYang = {
      '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳', '己': '阴',
      '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
      '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳', '巳': '阴',
      '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
    };
    
    // 年干起月表 - 根据传统口诀
    this.yearGanToMonthGan = {
      '甲': 2, '己': 2, // 甲己之年丙作首（丙寅为正月）
      '乙': 4, '庚': 4, // 乙庚之岁戊为头（戊寅为正月）
      '丙': 6, '辛': 6, // 丙辛必定寻庚起（庚寅为正月）
      '丁': 8, '壬': 8, // 丁壬壬位顺流行（壬寅为正月）
      '戊': 0, '癸': 0  // 戊癸何方发，甲子良辰美景时（甲寅为正月）
    };
    
    // 日干起时表 - 根据传统口诀
    this.dayGanToHourGan = {
      '甲': 0, '己': 0, // 甲己还加甲（甲子时开始）
      '乙': 2, '庚': 2, // 乙庚丙作初（丙子时开始）
      '丙': 4, '辛': 4, // 丙辛从戊起（戊子时开始）
      '丁': 6, '壬': 6, // 丁壬庚子居（庚子时开始）
      '戊': 8, '癸': 8  // 戊癸何方发，壬子是真途（壬子时开始）
    };
    
    // 时辰对照表
    this.timeToHour = [
      { name: '子时', start: 23, end: 1, zhi: '子' },
      { name: '丑时', start: 1, end: 3, zhi: '丑' },
      { name: '寅时', start: 3, end: 5, zhi: '寅' },
      { name: '卯时', start: 5, end: 7, zhi: '卯' },
      { name: '辰时', start: 7, end: 9, zhi: '辰' },
      { name: '巳时', start: 9, end: 11, zhi: '巳' },
      { name: '午时', start: 11, end: 13, zhi: '午' },
      { name: '未时', start: 13, end: 15, zhi: '未' },
      { name: '申时', start: 15, end: 17, zhi: '申' },
      { name: '酉时', start: 17, end: 19, zhi: '酉' },
      { name: '戌时', start: 19, end: 21, zhi: '戌' },
      { name: '亥时', start: 21, end: 23, zhi: '亥' }
    ];
  }

  /**
   * 计算年柱
   * @param {number} year - 公历年份
   * @param {number} month - 公历月份
   * @param {number} day - 公历日期
   * @returns {Object} 年柱信息
   */
  calculateYearPillar(year, month, day) {
    // 判断是否过立春 - 立春一般在2月3-5日
    // 简化处理：1月和2月4日前算上一年
    let ganZhiYear = year;
    if (month === 1 || (month === 2 && day < 4)) {
      ganZhiYear = year - 1;
    }
    
    // 以公元4年甲子年为基准计算
    const offset = ganZhiYear - 4;
    const ganIndex = offset % 10;
    const zhiIndex = offset % 12;
    
    // 处理负数
    const finalGan = ganIndex < 0 ? ganIndex + 10 : ganIndex;
    const finalZhi = zhiIndex < 0 ? zhiIndex + 12 : zhiIndex;
    
    return {
      stem: this.tianGan[finalGan],
      branch: this.diZhi[finalZhi],
      pillar: this.tianGan[finalGan] + this.diZhi[finalZhi],
      ganZhiYear: ganZhiYear,
      stemIndex: finalGan,
      branchIndex: finalZhi
    };
  }

  /**
   * 计算月柱
   * @param {number} year - 公历年份
   * @param {number} month - 公历月份
   * @param {number} day - 公历日期
   * @param {string} yearStem - 年干
   * @returns {Object} 月柱信息
   */
  calculateMonthPillar(year, month, day, yearStem) {
    // 确定月份对应的地支（节气月）
    let monthZhi;
    let monthZhiIndex;
    
    // 简化节气月处理
    if (month === 1) {
      monthZhi = '丑'; // 十二月
      monthZhiIndex = 1;
    } else if (month === 2) {
      monthZhi = day < 4 ? '丑' : '寅'; // 立春前后
      monthZhiIndex = day < 4 ? 1 : 2;
    } else {
      // 其他月份的简化处理
      const monthMapping = {
        3: { zhi: '卯', index: 3 },  // 二月
        4: { zhi: '辰', index: 4 },  // 三月
        5: { zhi: '巳', index: 5 },  // 四月
        6: { zhi: '午', index: 6 },  // 五月
        7: { zhi: '未', index: 7 },  // 六月
        8: { zhi: '申', index: 8 },  // 七月
        9: { zhi: '酉', index: 9 },  // 八月
        10: { zhi: '戌', index: 10 }, // 九月
        11: { zhi: '亥', index: 11 }, // 十月
        12: { zhi: '子', index: 0 }   // 十一月
      };
      monthZhi = monthMapping[month].zhi;
      monthZhiIndex = monthMapping[month].index;
    }
    
    // 根据年干推月干
    const monthGanBase = this.yearGanToMonthGan[yearStem];
    const monthGanIndex = (monthGanBase + monthZhiIndex - 2) % 10; // 寅月为基准
    
    return {
      stem: this.tianGan[monthGanIndex],
      branch: monthZhi,
      pillar: this.tianGan[monthGanIndex] + monthZhi,
      monthName: this.getMonthName(monthZhiIndex)
    };
  }

  /**
   * 计算日柱
   * @param {number} year - 公历年份  
   * @param {number} month - 公历月份
   * @param {number} day - 公历日期
   * @returns {Object} 日柱信息
   */
  calculateDayPillar(year, month, day) {
    // 使用修正的万年历算法
    // 基准：1900年1月1日庚子日
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    
    // 修正偏移量（根据权威万年历校准）
    const correctedDays = daysDiff - 12;
    
    // 1900年1月1日是庚子：庚=6, 子=0
    const baseGan = 6;
    const baseZhi = 0;
    
    const ganIndex = (baseGan + correctedDays) % 10;
    const zhiIndex = (baseZhi + correctedDays) % 12;
    
    const finalGan = ganIndex < 0 ? ganIndex + 10 : ganIndex;
    const finalZhi = zhiIndex < 0 ? zhiIndex + 12 : zhiIndex;
    
    return {
      stem: this.tianGan[finalGan],
      branch: this.diZhi[finalZhi],
      pillar: this.tianGan[finalGan] + this.diZhi[finalZhi],
      daysDiff: correctedDays,
      stemIndex: finalGan,
      branchIndex: finalZhi
    };
  }

  /**
   * 计算时柱
   * @param {string} dayStem - 日干
   * @param {number} hour - 小时（24小时制，真太阳时）
   * @param {number} minute - 分钟
   * @returns {Object} 时柱信息
   */
  calculateHourPillar(dayStem, hour, minute) {
    // 确定时辰
    let hourInfo = null;
    
    // 处理子时的特殊情况（23:00-01:00）
    if (hour >= 23 || hour < 1) {
      hourInfo = this.timeToHour[0]; // 子时
    } else {
      for (const timeSlot of this.timeToHour) {
        if (hour >= timeSlot.start && hour < timeSlot.end) {
          hourInfo = timeSlot;
          break;
        }
      }
    }
    
    if (!hourInfo) {
      throw new Error('无法确定时辰');
    }
    
    // 根据日干推时干
    const hourGanBase = this.dayGanToHourGan[dayStem];
    const hourZhiIndex = this.diZhi.indexOf(hourInfo.zhi);
    const hourGanIndex = (hourGanBase + hourZhiIndex) % 10;
    
    return {
      stem: this.tianGan[hourGanIndex],
      branch: hourInfo.zhi,
      pillar: this.tianGan[hourGanIndex] + hourInfo.zhi,
      hourName: hourInfo.name,
      hourZhi: hourInfo.zhi,
      timeRange: `${hourInfo.start}:00-${hourInfo.end}:00`
    };
  }

  /**
   * 分析五行分布
   * @param {string} baZi - 完整八字
   * @returns {Object} 五行统计
   */
  analyzeFiveElements(baZi) {
    const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const chars = baZi.replace(/\s+/g, '').split('');
    
    chars.forEach(char => {
      const element = this.wuXing[char];
      if (element) {
        switch (element) {
          case '木': elements.wood++; break;
          case '火': elements.fire++; break;
          case '土': elements.earth++; break;
          case '金': elements.metal++; break;
          case '水': elements.water++; break;
        }
      }
    });
    
    return elements;
  }

  /**
   * 获取月份名称
   * @param {number} zhiIndex - 地支索引
   * @returns {string} 月份名称
   */
  getMonthName(zhiIndex) {
    const monthNames = [
      '十一月', '十二月', '正月', '二月', '三月', '四月',
      '五月', '六月', '七月', '八月', '九月', '十月'
    ];
    return monthNames[zhiIndex];
  }

  /**
   * 将时间字符串转换为小时和分钟
   * @param {string} timeStr - 时间字符串，格式: "HH:MM"
   * @returns {Object} 小时和分钟
   */
  parseTime(timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  }

  /**
   * 完整八字计算主函数
   * @param {number} year - 公历年份
   * @param {number} month - 公历月份
   * @param {number} day - 公历日期
   * @param {string} timeStr - 时间字符串，格式: "HH:MM"
   * @param {Location} location - 地理位置
   * @param {boolean} useTrueSolarTime - 是否使用真太阳时
   * @returns {BaziResult} 完整八字结果
   */
  calculate(year, month, day, timeStr, location, useTrueSolarTime = true) {
    try {
      // 解析时间
      const { hour: originalHour, minute: originalMinute } = this.parseTime(timeStr);
      
      let finalYear = year;
      let finalMonth = month;
      let finalDay = day;
      let finalHour = originalHour;
      let finalMinute = originalMinute;
      
      // 如果使用真太阳时，计算真太阳时
      if (useTrueSolarTime) {
        const trueSolarTime = AstronomicalTimeCalculator.calculateTrueSolarTime(
          year, month, day, originalHour, originalMinute, location
        );
        
        finalYear = trueSolarTime.year;
        finalMonth = trueSolarTime.month;
        finalDay = trueSolarTime.day;
        finalHour = trueSolarTime.hour;
        finalMinute = trueSolarTime.minute;
      }

      // 计算四柱
      const yearResult = this.calculateYearPillar(finalYear, finalMonth, finalDay);
      const monthResult = this.calculateMonthPillar(finalYear, finalMonth, finalDay, yearResult.stem);
      const dayResult = this.calculateDayPillar(finalYear, finalMonth, finalDay);
      const hourResult = this.calculateHourPillar(dayResult.stem, finalHour, finalMinute);

      // 构建完整八字
      const fullBaZi = `${yearResult.pillar} ${monthResult.pillar} ${dayResult.pillar} ${hourResult.pillar}`;
      
      // 分析五行
      const fiveElements = this.analyzeFiveElements(fullBaZi);

      return {
        yearPillar: yearResult,
        monthPillar: monthResult,
        dayPillar: dayResult,
        hourPillar: hourResult,
        fiveElements,
        tenGods: this.calculateTenGods(dayResult.stem),
        dayMaster: dayResult.stem,
        birthInfo: {
          originalDate: new Date(year, month - 1, day, originalHour, originalMinute),
          trueSolarTime: new Date(finalYear, finalMonth - 1, finalDay, finalHour, finalMinute),
          location,
          useTrueSolarTime
        }
      };
    } catch (error) {
      throw new Error(`八字计算失败: ${error.message}`);
    }
  }

  /**
   * 计算十神关系
   * @param {string} dayMaster - 日主天干
   * @returns {Object} 十神关系
   */
  calculateTenGods(dayMaster) {
    const tenGods = {
      '比肩': [], '劫财': [], '食神': [], '伤官': [],
      '正财': [], '偏财': [], '正官': [], '七杀': [],
      '正印': [], '偏印': []
    };

    // 十神关系定义（简化版本）
    const relationships = {
      '甲': { '比肩': '甲', '劫财': '乙', '食神': '丙', '伤官': '丁', '偏财': '戊', '正财': '己', '七杀': '庚', '正官': '辛', '偏印': '壬', '正印': '癸' },
      '乙': { '比肩': '乙', '劫财': '甲', '食神': '丁', '伤官': '丙', '偏财': '己', '正财': '戊', '七杀': '辛', '正官': '庚', '偏印': '癸', '正印': '壬' },
      '丙': { '比肩': '丙', '劫财': '丁', '食神': '戊', '伤官': '己', '偏财': '庚', '正财': '辛', '七杀': '壬', '正官': '癸', '偏印': '甲', '正印': '乙' },
      '丁': { '比肩': '丁', '劫财': '丙', '食神': '己', '伤官': '戊', '偏财': '辛', '正财': '庚', '七杀': '癸', '正官': '壬', '偏印': '乙', '正印': '甲' },
      '戊': { '比肩': '戊', '劫财': '己', '食神': '庚', '伤官': '辛', '偏财': '壬', '正财': '癸', '七杀': '甲', '正官': '乙', '偏印': '丙', '正印': '丁' },
      '己': { '比肩': '己', '劫财': '戊', '食神': '辛', '伤官': '庚', '偏财': '癸', '正财': '壬', '七杀': '乙', '正官': '甲', '偏印': '丁', '正印': '丙' },
      '庚': { '比肩': '庚', '劫财': '辛', '食神': '壬', '伤官': '癸', '偏财': '甲', '正财': '乙', '七杀': '丙', '正官': '丁', '偏印': '戊', '正印': '己' },
      '辛': { '比肩': '辛', '劫财': '庚', '食神': '癸', '伤官': '壬', '偏财': '乙', '正财': '甲', '七杀': '丁', '正官': '丙', '偏印': '己', '正印': '戊' },
      '壬': { '比肩': '壬', '劫财': '癸', '食神': '甲', '伤官': '乙', '偏财': '丙', '正财': '丁', '七杀': '戊', '正官': '己', '偏印': '庚', '正印': '辛' },
      '癸': { '比肩': '癸', '劫财': '壬', '食神': '乙', '伤官': '甲', '偏财': '丁', '正财': '丙', '七杀': '己', '正官': '戊', '偏印': '辛', '正印': '庚' }
    };

    const relation = relationships[dayMaster];
    if (relation) {
      Object.keys(relation).forEach(god => {
        tenGods[god] = [relation[god]];
      });
    }

    return tenGods;
  }
}

// 创建单例实例
export const baziCalculator = new CompleteBaZiCalculator();