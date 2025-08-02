'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Briefcase, HeartPulse, BookOpen, Share2, Download } from 'lucide-react';
import { BasicInterpretation, DetailedInterpretation } from '@/lib/fortune-interpreter';

interface FortuneDisplayProps {
  basicInterpretation: BasicInterpretation;
  detailedInterpretations: DetailedInterpretation[];
  onShare: () => void;
  onBack: () => void;
}

export default function FortuneDisplay({ 
  basicInterpretation, 
  detailedInterpretations,
  onShare,
  onBack 
}: FortuneDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetailed, setShowDetailed] = useState(false);

  const categoryIcons = {
    wealth: TrendingUp,
    marriage: Heart,
    career: Briefcase,
    health: HeartPulse,
    academy: BookOpen
  };

  const categoryColors = {
    wealth: 'text-green-600',
    marriage: 'text-pink-600',
    career: 'text-blue-600',
    health: 'text-red-600',
    academy: 'text-purple-600'
  };

  const categoryLabels = {
    wealth: '财运分析',
    marriage: '姻缘分析',
    career: '事业分析',
    health: '健康分析',
    academy: '学业分析'
  };

  const renderFiveElements = () => {
    const { fiveElements } = basicInterpretation.basicInfo;
    const maxValue = Math.max(...Object.values(fiveElements));
    
    const elementNames = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水'
    };

    return (
      <div className="space-y-3">
        {Object.entries(fiveElements).map(([element, value]) => {
          const percentage = (value / maxValue) * 100;
          return (
            <div key={element} className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 w-8">
                {elementNames[element as keyof typeof elementNames]}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">八字基本信息</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">四柱八字</p>
          <p className="text-lg font-bold text-purple-600">{basicInterpretation.basicInfo.fourPillars}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">日主</p>
          <p className="text-lg font-bold text-purple-600">{basicInterpretation.basicInfo.dayMaster}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">五行分布</h4>
        {renderFiveElements()}
      </div>

      {basicInterpretation.basicInfo.strongElements.length > 0 && (
        <div className="text-sm">
          <span className="text-gray-600">强势五行: </span>
          <span className="text-green-600 font-medium">{basicInterpretation.basicInfo.strongElements.join('、')}</span>
        </div>
      )}

      {basicInterpretation.basicInfo.weakElements.length > 0 && (
        <div className="text-sm mt-1">
          <span className="text-gray-600">弱势五行: </span>
          <span className="text-orange-600 font-medium">{basicInterpretation.basicInfo.weakElements.join('、')}</span>
        </div>
      )}
    </motion.div>
  );

  const renderPersonality = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">性格特点分析</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-purple-600 mb-2">主要特征</h4>
          <div className="flex flex-wrap gap-2">
            {basicInterpretation.personality.mainTraits.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-green-600 mb-2">个人优势</h4>
          <ul className="space-y-1">
            {basicInterpretation.personality.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-orange-600 mb-2">潜在挑战</h4>
          <ul className="space-y-1">
            {basicInterpretation.personality.challenges.map((challenge, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            {basicInterpretation.personality.keyCharacteristics}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderFortuneOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">基础运势概述</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">整体趋势</h4>
          <p className="text-sm text-blue-700">{basicInterpretation.fortuneOverview.overallTrend}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">关键要点</h4>
          <ul className="space-y-1">
            {basicInterpretation.fortuneOverview.keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-orange-700 mb-2">注意事项</h4>
          <ul className="space-y-1">
            {basicInterpretation.fortuneOverview.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-orange-500 mr-2">⚠</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );

  const renderDerivedQuestions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">深入了解运势</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detailedInterpretations.map((interpretation, index) => {
          const Icon = categoryIcons[interpretation.category];
          const color = categoryColors[interpretation.category];
          const label = categoryLabels[interpretation.category];
          
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => setSelectedCategory(interpretation.category)}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedCategory === interpretation.category
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-6 h-6 ${color}`} />
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">{label}</h4>
                  <p className="text-sm text-gray-600">{interpretation.summary}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderDetailedAnalysis = (interpretation: DetailedInterpretation) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">{interpretation.title}</h3>
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">详细解读</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{interpretation.detailedAnalysis}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-2">有利元素</h4>
            <div className="flex flex-wrap gap-1">
              {interpretation.luckyElements.map((element, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                >
                  {element}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2">不利元素</h4>
            <div className="flex flex-wrap gap-1">
              {interpretation.unluckyElements.map((element, i) => (
                <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                >
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-blue-600 mb-2">发展时机</h4>
          <div className="flex flex-wrap gap-2">
            {interpretation.timing.map((time, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {time}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-purple-600 mb-2">建议</h4>
          <ul className="space-y-1">
            {interpretation.advice.map((advice, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start"
              >
                <span className="text-purple-500 mr-2">•</span>
                {advice}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">您的八字运势解读</h1>
        <p className="text-gray-600">基于您的出生信息生成的个性化分析</p>
      </div>

      {renderBasicInfo()}
      {renderPersonality()}
      {renderFortuneOverview()}

      {selectedCategory ? (
        renderDetailedAnalysis(
          detailedInterpretations.find(d => d.category === selectedCategory)!
        )
      ) : (
        renderDerivedQuestions()
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400"
        >
          重新输入
        </motion.button>

        <motion.button
          onClick={onShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 flex items-center justify-center"
        >
          <Share2 className="w-5 h-5 mr-2" />
          生成分享图
        </motion.button>
      </div>
    </div>
  );
}