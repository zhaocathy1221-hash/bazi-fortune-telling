/**
 * 运势解读引擎
 * 基于八字数据生成个性化运势解读
 */

import { BaziResult } from './bazi-calculator';

export interface BasicInterpretation {
  basicInfo: {
    fourPillars: string;
    fiveElements: string;
    dayMaster: string;
    missingElements: string[];
    strongElements: string[];
    weakElements: string[];
  };
  personality: {
    mainTraits: string[];
    strengths: string[];
    challenges: string[];
    keyCharacteristics: string;
  };
  fortuneOverview: {
    overallTrend: string;
    currentPhase: string;
    keyPoints: string[];
    warnings: string[];
  };
  lifeStages: {
    childhood: string;
    youth: string;
    middleAge: string;
    oldAge: string;
  };
}

export interface DetailedInterpretation {
  category: 'wealth' | 'marriage' | 'career' | 'health' | 'academy';
  title: string;
  summary: string;
  detailedAnalysis: string;
  timing: string[];
  advice: string[];
  luckyElements: string[];
  unluckyElements: string[];
}

export interface InterpretationRequest {
  baziData: BaziResult;
  questions?: ('wealth' | 'marriage' | 'career' | 'health' | 'academy')[];
}

/**
 * 基础运势解读生成器
 */
export function generateBasicInterpretation(baziData: BaziResult): BasicInterpretation {
  const dayMaster = baziData.dayMaster;
  const elements = baziData.fiveElements;
  const pillars = [baziData.yearPillar, baziData.monthPillar, baziData.dayPillar, baziData.hourPillar];

  // 分析五行强弱
  const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
  const avg = total / 5;
  
  const strongElements = Object.entries(elements)
    .filter(([_, value]) => value > avg * 1.2)
    .map(([element]) => element);
  
  const weakElements = Object.entries(elements)
    .filter(([_, value]) => value < avg * 0.8)
    .map(([element]) => element);

  const missingElements = Object.entries(elements)
    .filter(([_, value]) => value === 0)
    .map(([element]) => element);

  // 生成性格特点
  const personality = generatePersonalityTraits(dayMaster, elements, strongElements, weakElements);
  
  // 生成运势概述
  const fortuneOverview = generateFortuneOverview(elements, strongElements, weakElements);
  
  // 生成人生阶段
  const lifeStages = generateLifeStages(dayMaster, elements);

  return {
    basicInfo: {
      fourPillars: `${baziData.yearPillar.stem}${baziData.yearPillar.branch} ${baziData.monthPillar.stem}${baziData.monthPillar.branch} ${baziData.dayPillar.stem}${baziData.dayPillar.branch} ${baziData.hourPillar.stem}${baziData.hourPillar.branch}`,
      fiveElements: `木${elements.wood} 火${elements.fire} 土${elements.earth} 金${elements.metal} 水${elements.water}`,
      dayMaster,
      missingElements,
      strongElements,
      weakElements
    },
    personality,
    fortuneOverview,
    lifeStages
  };
}

/**
 * 生成性格特点
 */
function generatePersonalityTraits(dayMaster: string, elements: any, strong: string[], weak: string[]): {
  mainTraits: string[];
  strengths: string[];
  challenges: string[];
  keyCharacteristics: string;
} {
  const traits = {
    mainTraits: [] as string[],
    strengths: [] as string[],
    challenges: [] as string[],
    keyCharacteristics: ''
  };

  // 基于日主的性格特征
  const dayMasterTraits: { [key: string]: { traits: string[], strengths: string[], challenges: string[] } } = {
    '甲': {
      traits: ['独立', '进取', '领导力', '正义感'],
      strengths: ['有决断力', '勇于创新', '乐于助人'],
      challenges: ['有时过于固执', '容易冲动']
    },
    '乙': {
      traits: ['温和', '细腻', '善解人意', '适应力强'],
      strengths: ['善于协调', '有耐心', '艺术天赋'],
      challenges: ['容易犹豫不决', '过于敏感']
    },
    '丙': {
      traits: ['热情', '开朗', '创造力', '表现欲'],
      strengths: ['积极乐观', '感染力强', '领导才能'],
      challenges: ['情绪起伏大', '容易急躁']
    },
    '丁': {
      traits: ['聪明', '敏锐', '洞察力', '创造力'],
      strengths: ['思维敏捷', '善于分析', '有远见'],
      challenges: ['过于敏感', '容易焦虑']
    },
    '戊': {
      traits: ['稳重', '可靠', '责任感', '耐心'],
      strengths: ['踏实肯干', '有毅力', '值得信赖'],
      challenges: ['有时过于保守', '不够灵活']
    },
    '己': {
      traits: ['温和', '包容', '协调力', '耐心'],
      strengths: ['善于倾听', '有同情心', '适应力强'],
      challenges: ['容易优柔寡断', '缺乏主见']
    },
    '庚': {
      traits: ['果断', '勇敢', '正义感', '领导力'],
      strengths: ['有魄力', '敢于担当', '执行力强'],
      challenges: ['过于刚强', '不够圆融']
    },
    '辛': {
      traits: ['精致', '敏感', '审美力', '追求完美'],
      strengths: ['注重细节', '有品味', '追求完美'],
      challenges: ['过于挑剔', '容易焦虑']
    },
    '壬': {
      traits: ['智慧', '包容', '适应力', '流动性'],
      strengths: ['思维活跃', '善于变通', '包容性强'],
      challenges: ['情绪多变', '缺乏定力']
    },
    '癸': {
      traits: ['智慧', '直觉', '敏感', '创造力'],
      strengths: ['洞察力强', '有创造力', '直觉敏锐'],
      challenges: ['过于敏感', '容易多虑']
    }
  };

  const dayMasterInfo = dayMasterTraits[dayMaster] || {
    traits: ['平衡', '中庸'],
    strengths: ['适应力强'],
    challenges: ['特色不明显']
  };

  traits.mainTraits = dayMasterInfo.traits;
  traits.strengths = dayMasterInfo.strengths;
  traits.challenges = dayMasterInfo.challenges;

  // 基于五行强弱的调整
  if (strong.includes('木')) {
    traits.mainTraits.push('有主见');
    traits.strengths.push('有领导才能');
  }
  if (weak.includes('木')) {
    traits.challenges.push('容易缺乏自信');
  }

  if (strong.includes('火')) {
    traits.mainTraits.push('热情开朗');
    traits.strengths.push('有感染力');
  }
  if (weak.includes('火')) {
    traits.challenges.push('缺乏激情');
  }

  if (strong.includes('土')) {
    traits.mainTraits.push('稳重可靠');
    traits.strengths.push('值得信赖');
  }
  if (weak.includes('土')) {
    traits.challenges.push('缺乏安全感');
  }

  if (strong.includes('金')) {
    traits.mainTraits.push('果断决绝');
    traits.strengths.push('执行力强');
  }
  if (weak.includes('金')) {
    traits.challenges.push('优柔寡断');
  }

  if (strong.includes('水')) {
    traits.mainTraits.push('智慧灵活');
    traits.strengths.push('适应力强');
  }
  if (weak.includes('水')) {
    traits.challenges.push('思维固化');
  }

  // 生成关键特征描述
  traits.keyCharacteristics = `${dayMaster}日主的你${traits.mainTraits.slice(0, 2).join('、')}，在${traits.strengths.slice(0, 2).join('和')}方面表现突出，但需要注意${traits.challenges.slice(0, 2).join('和')}的问题。`;

  return traits;
}

/**
 * 生成运势概述
 */
function generateFortuneOverview(elements: any, strong: string[], weak: string[]): {
  overallTrend: string;
  currentPhase: string;
  keyPoints: string[];
  warnings: string[];
} {
  const overview = {
    overallTrend: '',
    currentPhase: '成长阶段',
    keyPoints: [] as string[],
    warnings: [] as string[]
  };

  // 分析五行平衡
  const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
  const balanceScore = Math.max(...Object.values(elements)) / Math.min(...Object.values(elements).filter(v => v > 0));

  if (balanceScore < 2) {
    overview.overallTrend = '五行相对平衡，整体运势较为平稳，各方面发展比较均衡。';
  } else if (balanceScore < 4) {
    overview.overallTrend = '五行略有偏颇，但整体运势尚可，需要注意调节。';
  } else {
    overview.overallTrend = '五行严重失衡，需要特别关注调节和改善。';
  }

  // 关键要点
  if (strong.length > 0) {
    overview.keyPoints.push(`${strong.join('、')}过旺，需要注意调节`);
  }
  if (weak.length > 0) {
    overview.keyPoints.push(`${weak.join('、')}偏弱，需要加强`);
  }

  // 通用建议
  overview.keyPoints.push('保持积极心态，遇到困难时寻求专业指导');
  overview.keyPoints.push('注意身体健康，保持良好作息习惯');

  // 注意事项
  overview.warnings.push('避免过于极端的行为和决策');
  overview.warnings.push('注意人际关系中的沟通方式');

  return overview;
}

/**
 * 生成人生阶段分析
 */
function generateLifeStages(dayMaster: string, elements: any): {
  childhood: string;
  youth: string;
  middleAge: string;
  oldAge: string;
} {
  return {
    childhood: '童年时期较为平稳，家庭教育对性格形成有重要影响。',
    youth: '青少年时期开始展现个性特点，在学习和社交方面有明显表现。',
    middleAge: '中年时期是事业发展的关键阶段，需要把握好时机。',
    oldAge: '晚年生活相对安稳，注重身心健康和家庭和谐。'
  };
}

/**
 * 生成详细运势解读
 */
export function generateDetailedInterpretation(
  baziData: BaziResult,
  category: 'wealth' | 'marriage' | 'career' | 'health' | 'academy'
): DetailedInterpretation {
  const dayMaster = baziData.dayMaster;
  const elements = baziData.fiveElements;

  const interpretations: { [key: string]: { [key: string]: DetailedInterpretation } } = {
    wealth: {
      '甲': {
        category: 'wealth',
        title: '财运分析',
        summary: '您的财运总体较好，但需要注意投资风险。',
        detailedAnalysis: '作为甲木日主，您具有开拓进取的精神，在财运方面有较强的赚钱能力。正财方面较为稳定，偏财方面有机会但需要谨慎把握。',
        timing: ['25-35岁', '45-55岁'],
        advice: ['稳健投资', '避免投机', '积累人脉'],
        luckyElements: ['土', '金'],
        unluckyElements: ['木', '水']
      },
      '乙': {
        category: 'wealth',
        title: '财运分析',
        summary: '财运温和，适合稳健投资。',
        detailedAnalysis: '乙木日主财运较为温和，适合从事稳定的工作。正财收入稳定，偏财方面机会较少但风险也低。',
        timing: ['30-40岁', '50-60岁'],
        advice: ['稳健理财', '长期投资', '避免冒险'],
        luckyElements: ['火', '土'],
        unluckyElements: ['金', '水']
      }
    },
    marriage: {
      '甲': {
        category: 'marriage',
        title: '姻缘分析',
        summary: '感情运势较好，但需要注意沟通方式。',
        detailedAnalysis: '甲木日主在感情中比较主动，但有时过于强势。需要学会倾听和理解对方的感受。',
        timing: ['28-35岁', '40-45岁'],
        advice: ['多沟通交流', '学会包容', '保持耐心'],
        luckyElements: ['土', '水'],
        unluckyElements: ['木', '火']
      },
      '乙': {
        category: 'marriage',
        title: '姻缘分析',
        summary: '感情细腻，容易遇到温柔体贴的伴侣。',
        detailedAnalysis: '乙木日主感情细腻，容易吸引温柔体贴的伴侣。在感情中需要更加主动表达自己的需求。',
        timing: ['25-32岁', '38-43岁'],
        advice: ['主动表达', '保持独立', '珍惜眼前人'],
        luckyElements: ['水', '金'],
        unluckyElements: ['火', '土']
      }
    },
    career: {
      '甲': {
        category: 'career',
        title: '事业分析',
        summary: '适合创业或领导岗位，事业发展前景良好。',
        detailedAnalysis: '甲木日主具有领导才能，适合从事管理、创业或需要决策能力的工作。事业发展有起伏但总体向上。',
        timing: ['28-38岁', '48-58岁'],
        advice: ['发挥领导力', '积累经验', '团队合作'],
        luckyElements: ['土', '金'],
        unluckyElements: ['木', '水']
      },
      '乙': {
        category: 'career',
        title: '事业分析',
        summary: '适合创意类或服务类工作，事业发展平稳。',
        detailedAnalysis: '乙木日主适合从事创意、艺术或服务类工作。事业发展较为平稳，需要耐心和坚持。',
        timing: ['30-40岁', '45-55岁'],
        advice: ['发挥创意', '提升技能', '建立人脉'],
        luckyElements: ['火', '水'],
        unluckyElements: ['金', '土']
      }
    }
  };

  // 默认解读模板
  const defaultInterpretation: DetailedInterpretation = {
    category,
    title: getCategoryTitle(category),
    summary: getCategorySummary(category),
    detailedAnalysis: getCategoryAnalysis(category, dayMaster, elements),
    timing: getCategoryTiming(category),
    advice: getCategoryAdvice(category),
    luckyElements: getCategoryLuckyElements(category, dayMaster),
    unluckyElements: getCategoryUnluckyElements(category, dayMaster)
  };

  return interpretations[category]?.[dayMaster] || defaultInterpretation;
}

/**
 * 获取类别标题
 */
function getCategoryTitle(category: string): string {
  const titles = {
    wealth: '财运分析',
    marriage: '姻缘分析',
    career: '事业分析',
    health: '健康分析',
    academy: '学业分析'
  };
  return titles[category] || '运势分析';
}

/**
 * 获取类别概述
 */
function getCategorySummary(category: string): string {
  const summaries = {
    wealth: '财运总体趋势分析，包括正财偏财和投资建议。',
    marriage: '感情运势分析，包括桃花运和婚姻时机。',
    career: '事业发展方向和建议，包括适合的职业类型。',
    health: '体质特点和需要注意的健康问题。',
    academy: '学习能力和考试运势分析。'
  };
  return summaries[category] || '详细运势分析';
}

/**
 * 获取类别详细分析
 */
function getCategoryAnalysis(category: string, dayMaster: string, elements: any): string {
  const baseAnalysis = {
    wealth: `作为${dayMaster}日主，您的财运特点与五行平衡相关。当前五行分布为：木${elements.wood}、火${elements.fire}、土${elements.earth}、金${elements.metal}、水${elements.water}。`,
    marriage: `${dayMaster}日主的感情特点受到五行影响，需要根据个人情况调整相处方式。`,
    career: `${dayMaster}日主的事业发展需要考虑五行平衡，选择适合的职业方向。`,
    health: `${dayMaster}日主的体质特点与五行相关，需要注意相应的健康问题。`,
    academy: `${dayMaster}日主的学习能力受到五行影响，需要采用适合的学习方法。`
  };
  return baseAnalysis[category] || '根据个人八字特点进行详细分析。';
}

/**
 * 获取时机建议
 */
function getCategoryTiming(category: string): string[] {
  const timings = {
    wealth: ['25-35岁', '45-55岁'],
    marriage: ['25-35岁', '35-45岁'],
    career: ['28-38岁', '40-50岁'],
    health: ['注意30岁后', '50岁后'],
    academy: ['15-25岁', '25-35岁']
  };
  return timings[category] || ['25-35岁'];
}

/**
 * 获取建议
 */
function getCategoryAdvice(category: string): string[] {
  const advices = {
    wealth: ['稳健投资', '避免投机', '积累人脉'],
    marriage: ['多沟通交流', '保持耐心', '珍惜缘分'],
    career: ['提升技能', '积累经验', '团队合作'],
    health: ['规律作息', '适量运动', '定期体检'],
    academy: ['制定计划', '坚持学习', '寻求帮助']
  };
  return advices[category] || ['保持积极心态'];
}

/**
 * 获取有利元素
 */
function getCategoryLuckyElements(category: string, dayMaster: string): string[] {
  const luckyMap: { [key: string]: { [key: string]: string[] } } = {
    wealth: {
      '甲': ['土', '金'], '乙': ['火', '土'], '丙': ['金', '水'], '丁': ['水', '金'],
      '戊': ['水', '木'], '己': ['木', '水'], '庚': ['木', '火'], '辛': ['火', '木'],
      '壬': ['火', '土'], '癸': ['土', '火']
    }
  };
  return luckyMap[category]?.[dayMaster] || ['土', '金'];
}

/**
 * 获取不利元素
 */
function getCategoryUnluckyElements(category: string, dayMaster: string): string[] {
  const unluckyMap: { [key: string]: { [key: string]: string[] } } = {
    wealth: {
      '甲': ['木', '水'], '乙': ['金', '水'], '丙': ['火', '木'], '丁': ['木', '火'],
      '戊': ['土', '火'], '己': ['火', '土'], '庚': ['金', '土'], '辛': ['土', '金'],
      '壬': ['水', '金'], '癸': ['金', '水']
    }
  };
  return unluckyMap[category]?.[dayMaster] || ['木', '水'];
}

/**
 * 生成完整解读结果
 */
export function generateCompleteInterpretation(request: InterpretationRequest): {
  basic: BasicInterpretation;
  detailed: DetailedInterpretation[];
} {
  const basic = generateBasicInterpretation(request.baziData);
  const detailed: DetailedInterpretation[] = [];

  if (request.questions && request.questions.length > 0) {
    request.questions.forEach(question => {
      detailed.push(generateDetailedInterpretation(request.baziData, question));
    });
  } else {
    // 默认生成所有类别的解读
    ['wealth', 'marriage', 'career', 'health', 'academy'].forEach(category => {
      detailed.push(generateDetailedInterpretation(request.baziData, category as any));
    });
  }

  return { basic, detailed };
}