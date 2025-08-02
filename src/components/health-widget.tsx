'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Search, Smartphone, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { quickHealthCheck } from '@/lib/health-checker';

interface HealthWidgetProps {
  compact?: boolean;
  showTrends?: boolean;
  refreshInterval?: number;
}

export default function HealthWidget({ 
  compact = false, 
  showTrends = true,
  refreshInterval = 30000 
}: HealthWidgetProps) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [trend, setTrend] = useState({ performance: 0, accessibility: 0, seo: 0, responsive: 0 });

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const data = await quickHealthCheck();
      setHealthData(data);
      setLastUpdate(new Date());
      
      // Calculate trends (simplified)
      if (healthData) {
        const newTrend = {
          performance: data.performance.lighthouseScore - (healthData.performance?.lighthouseScore || 0),
          accessibility: data.accessibility.score - (healthData.accessibility?.score || 0),
          seo: data.seo.score - (healthData.seo?.score || 0),
          responsive: 100 - (data.responsive.breakpoints.reduce((sum, bp) => sum + bp.issues.length, 0) * 10) - 
                      (100 - (healthData.responsive?.breakpoints.reduce((sum, bp) => sum + bp.issues.length, 0) * 10) || 0)
        };
        setTrend(newTrend);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIcon = (value) => {
    if (value > 0) return '↗️';
    if (value < 0) return '↘️';
    return '➡️';
  };

  const metrics = [
    {
      id: 'performance',
      label: '性能',
      icon: Zap,
      score: healthData?.performance?.lighthouseScore || 0,
      target: 90,
      description: '页面加载速度'
    },
    {
      id: 'accessibility',
      label: '无障碍',
      icon: Shield,
      score: healthData?.accessibility?.score || 0,
      target: 95,
      description: 'WCAG合规性'
    },
    {
      id: 'seo',
      label: 'SEO',
      icon: Search,
      score: healthData?.seo?.score || 0,
      target: 85,
      description: '搜索引擎优化'
    },
    {
      id: 'responsive',
      label: '响应式',
      icon: Smartphone,
      score: 100 - (healthData?.responsive?.breakpoints.reduce((sum, bp) => sum + bp.issues.length, 0) * 10) || 100,
      target: 90,
      description: '多设备适配'
    }
  ];

  const overallScore = Math.round(
    metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length
  );

  const getOverallStatus = (score) => {
    if (score >= 90) return { status: '优秀', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { status: '良好', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { status: '一般', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: '需改进', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const status = getOverallStatus(overallScore);

  if (compact) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-sm border p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">健康评分</span>
          </div>
          <div className={`text-lg font-bold ${status.color}`}>
            {overallScore}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {metrics.map(metric => (
            <div key={metric.id} className="text-center">
              <metric.icon className={`w-4 h-4 mx-auto mb-1 ${getScoreColor(metric.score)}`} />
              <div className={`text-xs font-medium ${getScoreColor(metric.score)}`}>
                {metric.score}
              </div>
              <div className="text-xs text-gray-500">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className={`mt-2 px-2 py-1 rounded text-xs font-medium text-center ${status.bg} ${status.color}`}
          {status.status}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border p-6 max-w-md"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${status.bg}`}>
            {status.status === '优秀' ? <CheckCircle className={`w-5 h-5 ${status.color}`} /> : <AlertCircle className={`w-5 h-5 ${status.color}`} />}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">应用健康监控</h3>
            <p className="text-sm text-gray-600">实时性能追踪</p>
          </div>
        </div>
        
        <div className={`text-2xl font-bold ${status.color}`}
          {overallScore}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">总体健康度</span>
          <span className={`font-medium ${status.color}`}>{status.status}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className={`h-2 rounded-full bg-gradient-to-r ${
              overallScore >= 90 ? 'from-green-400 to-green-600' :
              overallScore >= 80 ? 'from-blue-400 to-blue-600' :
              overallScore >= 70 ? 'from-yellow-400 to-yellow-600' :
              'from-red-400 to-red-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${overallScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        {metrics.map(metric => (
          <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gray-100`}
              >
                <metric.icon className={`w-4 h-4 ${getScoreColor(metric.score)}`} />
              </div>
              <div>
                <div className="font-medium text-gray-800">{metric.label}</div>
                <div className="text-xs text-gray-600">{metric.description}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${getScoreColor(metric.score)}`}
                {metric.score}
              </div>
              {showTrends && (
                <div className="text-xs text-gray-500">
                  {getTrendIcon(trend[metric.id])}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          {lastUpdate && <>
            更新于 {lastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </>}
        </div>
        
        <div className="flex items-center space-x-2"
        >
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-green-600 font-medium">{Math.round(metrics.filter(m => m.score >= m.target).length / metrics.length * 100)}%</span>
          <span className="text-gray-500">达标</span>
        </div>
      </div>
    </motion.div>
  );
}