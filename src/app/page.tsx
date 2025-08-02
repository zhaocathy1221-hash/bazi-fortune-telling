'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import BirthInfoInput from '@/components/birth-info-input';
import FortuneDisplay from '@/components/fortune-display';
import { calculateBazi } from '@/lib/bazi-calculator';
import { generateCompleteInterpretation } from '@/lib/fortune-interpreter';

export default function Home() {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [baziData, setBaziData] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBirthInfoSubmit = async (birthInfo) => {
    setLoading(true);
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const baziResult = calculateBazi(birthInfo);
      const interpretationResult = generateCompleteInterpretation({
        baziData: baziResult,
        questions: ['wealth', 'marriage', 'career', 'health', 'academy']
      });

      setBaziData(baziResult);
      setInterpretation(interpretationResult);
      setStep('result');
    } catch (error) {
      console.error('计算错误:', error);
      alert('计算过程中出现错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('input');
    setBaziData(null);
    setInterpretation(null);
  };

  const handleShare = () => {
    alert('分享功能开发中，敬请期待！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100"
    >
      <div className="container mx-auto px-4 py-8"
      >
        <header className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 mb-4"
          >
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              八字运势解读
            </h1>
            <Sparkles className="w-8 h-8 text-pink-600" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            探索您的命理密码，获得个性化运势指导
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <BirthInfoInput
                onSubmit={handleBirthInfoSubmit}
              />
            </motion.div>
          )}

          {step === 'result' && interpretation && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <FortuneDisplay
                basicInterpretation={interpretation.basic}
                detailedInterpretations={interpretation.detailed}
                onShare={handleShare}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-lg shadow-lg text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-700">正在计算您的八字...</p>
            </div>
          </motion.div>
        )}

        <footer className="text-center mt-12 text-gray-500 text-sm"
        >
          <p>基于传统命理学的八字分析系统</p>
          <p className="mt-1">仅供娱乐参考，请理性看待</p>
        </footer>
      </div>
    </div>
  );
}
