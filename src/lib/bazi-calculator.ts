/**
 * 八字计算算法
 * 基于传统命理学的八字计算系统
 */

export interface BirthInfo {
  birthDate: Date;
  birthTime: string; // "HH:mm" format
  gender: 'male' | 'female';
  calendarType: 'lunar' | 'solar';
  calibratedDate?: Date; // 校准后的真太阳时日期
}

export interface BaziResult {
  yearPillar: { stem: string; branch: string };
  monthPillar: { stem: string; branch: string };
  dayPillar: { stem: string; branch: string };
  hourPillar: { stem: string; branch: string };
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  tenGods: {
    [key: string]: string[];
  };
  dayMaster: string;
}

// 天干地支数据
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行属性映射
const STEM_ELEMENTS: { [key: string]: string } = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

const BRANCH_ELEMENTS: { [key: string]: string } = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 藏干映射
const HIDDEN_STEMS: { [key: string]: string[] } = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '戊', '庚'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '戊', '壬'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

// 十神定义
const TEN_GODS: { [key: string]: { [key: string]: string } } = {
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
};

/**
 * 计算年份的天干地支
 */
function calculateYearPillar(year: number): { stem: string; branch: string } {
  const baseYear = 1984; // 甲子年
  const offset = (year - baseYear) % 60;
  const stemIndex = offset % 10;
  const branchIndex = offset % 12;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  };
}

/**
 * 计算月份的天干地支
 */
function calculateMonthPillar(year: number, month: number): { stem: string; branch: string } {
  const yearPillar = calculateYearPillar(year);
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
  
  // 五虎遁：年上起月
  const monthStemStart = (yearStemIndex * 2 + 2) % 10;
  const monthStemIndex = (monthStemStart + month - 1) % 10;
  
  const monthBranchIndex = (month + 1) % 12;
  
  return {
    stem: HEAVENLY_STEMS[monthStemIndex],
    branch: EARTHLY_BRANCHES[monthBranchIndex]
  };
}

/**
 * 计算日的天干地支
 * 使用1900年1月31日为基准日（庚子日）
 */
function calculateDayPillar(date: Date): { stem: string; branch: string } {
  const baseDate = new Date(1900, 0, 31); // 1900-01-31
  const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const offset = (daysDiff + 36) % 60; // 36是调整值
  const stemIndex = offset % 10;
  const branchIndex = offset % 12;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  };
}

/**
 * 计算时辰的天干地支
 */
function calculateHourPillar(dayStem: string, hour: number): { stem: string; branch: string } {
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
  
  // 五鼠遁：日上起时
  const hourStemStart = (dayStemIndex * 2 + 2) % 10;
  const hourStemIndex = (hourStemStart + Math.floor((hour + 1) / 2)) % 10;
  
  return {
    stem: HEAVENLY_STEMS[hourStemIndex],
    branch: EARTHLY_BRANCHES[hourBranchIndex]
  };
}

/**
 * 计算五行分布
 */
function calculateFiveElements(pillars: { stem: string; branch: string }[]): {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
} {
  const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  pillars.forEach(pillar => {
    // 天干五行
    const stemElement = STEM_ELEMENTS[pillar.stem];
    if (stemElement === '木') elements.wood++;
    else if (stemElement === '火') elements.fire++;
    else if (stemElement === '土') elements.earth++;
    else if (stemElement === '金') elements.metal++;
    else if (stemElement === '水') elements.water++;
    
    // 地支五行
    const branchElement = BRANCH_ELEMENTS[pillar.branch];
    if (branchElement === '木') elements.wood++;
    else if (branchElement === '火') elements.fire++;
    else if (branchElement === '土') elements.earth++;
    else if (branchElement === '金') elements.metal++;
    else if (branchElement === '水') elements.water++;
    
    // 藏干五行
    const hiddenStems = HIDDEN_STEMS[pillar.branch];
    hiddenStems.forEach(stem => {
      const hiddenElement = STEM_ELEMENTS[stem];
      if (hiddenElement === '木') elements.wood += 0.5;
      else if (hiddenElement === '火') elements.fire += 0.5;
      else if (hiddenElement === '土') elements.earth += 0.5;
      else if (hiddenElement === '金') elements.metal += 0.5;
      else if (hiddenElement === '水') elements.water += 0.5;
    });
  });
  
  return elements;
}

/**
 * 计算十神关系
 */
function calculateTenGods(dayMaster: string, pillars: { stem: string; branch: string }[]): {
  [key: string]: string[];
} {
  const tenGods: { [key: string]: string[] } = {
    '年柱': [],
    '月柱': [],
    '日柱': [],
    '时柱': []
  };
  
  const dayMasterTenGods = TEN_GODS[dayMaster];
  
  pillars.forEach((pillar, index) => {
    const pillarName = ['年柱', '月柱', '日柱', '时柱'][index];
    
    // 天干的十神
    const stemGod = dayMasterTenGods[pillar.stem];
    tenGods[pillarName].push(`${pillar.stem}(${stemGod})`);
    
    // 地支的十神
    const branchGod = dayMasterTenGods[pillar.branch];
    tenGods[pillarName].push(`${pillar.branch}(${branchGod})`);
    
    // 藏干的十神
    const hiddenStems = HIDDEN_STEMS[pillar.branch];
    hiddenStems.forEach(stem => {
      const hiddenGod = dayMasterTenGods[stem];
      tenGods[pillarName].push(`${stem}(${hiddenGod})`);
    });
  });
  
  return tenGods;
}

/**
 * 主计算函数
 */
export function calculateBazi(birthInfo: BirthInfo): BaziResult {
  // 使用校准后的时间（真太阳时）或原始时间
  const calculationDate = birthInfo.calibratedDate || birthInfo.birthDate;
  const [hours, minutes] = birthInfo.birthTime.split(':').map(Number);
  
  // 设置小时和分钟
  const workingDate = new Date(calculationDate);
  workingDate.setHours(hours, minutes, 0, 0);
  
  // 计算四柱
  const yearPillar = calculateYearPillar(workingDate.getFullYear());
  const monthPillar = calculateMonthPillar(workingDate.getFullYear(), workingDate.getMonth() + 1);
  const dayPillar = calculateDayPillar(workingDate);
  const hourPillar = calculateHourPillar(dayPillar.stem, workingDate.getHours());
  
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  
  // 计算五行分布
  const fiveElements = calculateFiveElements(pillars);
  
  // 计算十神关系
  const dayMaster = dayPillar.stem;
  const tenGods = calculateTenGods(dayMaster, pillars);
  
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    fiveElements,
    tenGods,
    dayMaster
  };
}

/**
 * 验证出生信息
 */
export function validateBirthInfo(birthInfo: BirthInfo): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!birthInfo.birthDate) {
    errors.push('请选择出生日期');
  }
  
  if (!birthInfo.birthTime || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(birthInfo.birthTime)) {
    errors.push('请输入有效的时间格式（HH:MM）');
  }
  
  if (!birthInfo.gender) {
    errors.push('请选择性别');
  }
  
  if (!birthInfo.calendarType) {
    errors.push('请选择历法类型');
  }
  
  // 检查日期范围（1900-2100年）
  if (birthInfo.birthDate) {
    const year = birthInfo.birthDate.getFullYear();
    if (year < 1900 || year > 2100) {
      errors.push('请选择1900年至2100年之间的日期');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}