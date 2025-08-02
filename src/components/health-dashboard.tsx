'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Heart, 
  TrendingUp, 
  Monitor, 
  Search,
  Settings,
  RefreshCw
} from 'lucide-react';
import { quickHealthCheck, HealthCheckResult } from '@/lib/health-checker';

interface HealthDashboardProps {
  isDev?: boolean;
}

export default function HealthDashboard({ isDev = false }: HealthDashboardProps) {
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'accessibility' | 'seo' | 'responsive'>('overview');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const results = await quickHealthCheck();
      setHealthData(results);
      setLastCheck(new Date());
    } catch (error) {
      console.error('健康检查失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDev) {
      runHealthCheck();
    }
  }, [isDev]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'critical': return AlertCircle;
      default: return Activity;
    }
  };

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-xs text-gray-600">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  const HealthMetricCard = ({ 
    title, 
    score, 
    icon: Icon, 
    color,
    issues = []
  }: {
    title: string;
    score: number;
    icon: any;
    color: string;
    issues?: any[];
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 ${color} mr-2`} />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className={`text-sm font-medium ${color}`}>
          {score}/100
        </div>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              score >= 80 ? 'bg-green-500' : 
              score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {issues.length > 0 && (
        <div className="text-sm">
          <div className="text-gray-600 mb-2">{issues.length} 个问题</div>
          <ul className="space-y-1">
            {issues.slice(0, 2).map((issue, index) => (
              <li key={index} className="text-gray-500 text-xs">
                • {issue.description || issue.message}
              </li>
            ))}
            {issues.length > 2 && (
              <li className="text-gray-400 text-xs">
                ... 还有 {issues.length - 2} 个
              </li>
            )}
          </ul>
        </div>
      )}
    </motion.div>
  );

  const PerformanceDetails = ({ data }: { data: any }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data?.loadTime || '-'}s</div>
          <div className="text-sm text-blue-800">加载时间</div>
          <div className="text-xs text-blue-600 mt-1">
            {data?.loadTime > 3 ? '需要优化' : '良好'}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{data?.bundleSize || '-'}KB</div>
          <div className="text-sm text-green-800">打包大小</div>
          <div className="text-xs text-green-600 mt-1">
            {data?.bundleSize > 500 ? '较大' : '正常'}
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{data?.lighthouseScore || '-'}/100</div>
          <div className="text-sm text-purple-800">Lighthouse评分</div>
          <div className="text-xs text-purple-600 mt-1">
            {data?.lighthouseScore >= 80 ? '优秀' : '需改进'}
          </div>
        </div>
      </div>
    </div>
  );

  const IssueList = ({ issues, title }: { issues: any[]; title: string }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-800">{title} ({issues.length})</h4>
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {issue.description || issue.message}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {issue.recommendation || issue.fix}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (!isDev) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 快速访问按钮 */}
      <motion.button
        onClick={() => setHealthData(null)}
        className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      {/* 健康检查面板 */}
      <AnimatePresence>
        {healthData && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">应用健康检查</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={runHealthCheck}
                    disabled={loading}
                    className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setHealthData(null)}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  {/* 总体评分 */}
                  {healthData.overall && (
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center space-x-2">
                        <ScoreCircle score={healthData.overall.score} label="总体" />
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(healthData.overall.status)}`}>
                          {healthData.overall.status === 'healthy' ? '健康' : 
                           healthData.overall.status === 'warning' ? '警告' : '严重'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 详细指标 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {healthData.performance && (
                      <HealthMetricCard
                        title="性能"
                        score={healthData.performance.lighthouseScore}
                        icon={TrendingUp}
                        color="text-blue-600"
                      />
                    )}
                    {healthData.accessibility && (
                      <HealthMetricCard
                        title="无障碍"
                        score={healthData.accessibility.score}
                        icon={Heart}
                        color="text-green-600"
                        issues={healthData.accessibility.issues}
                      />
                    )}
                    {healthData.seo && (
                      <HealthMetricCard
                        title="SEO"
                        score={healthData.seo.score}
                        icon={Search}
                        color="text-purple-600"
                        issues={healthData.seo.issues}
                      />
                    )}
                    {healthData.responsive && (
                      <HealthMetricCard
                        title="响应式"
                        score={
                          100 - (healthData.responsive.breakpoints.reduce((sum, bp) => sum + bp.issues.length, 0) * 10)
                        }
                        icon={Monitor}
                        color="text-orange-600"
                      />
                    )}
                  </div>

                  {/* 问题列表 */}
                  {healthData.overall.issues.length > 0 && (
                    <div className="border-t pt-4">
                      <IssueList 
                        issues={healthData.overall.issues} 
                        title="需要关注的问题"
                      />
                    </div>
                  )}

                  {lastCheck && (
                    <div className="text-xs text-gray-500 text-center mt-4">
                      最后检查: {lastCheck.toLocaleTimeString()}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}