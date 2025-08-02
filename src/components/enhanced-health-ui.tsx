'use client';

import { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  ChevronRight,
  X,
  Zap,
  Shield,
  Eye,
  Smartphone,
  Globe,
  Clock,
  Award,
  Target,
  Sparkles,
  BarChart3,
  PieChart
} from 'lucide-react';
import { quickHealthCheck, HealthCheckResult } from '@/lib/health-checker';

interface EnhancedHealthUIProps {
  isDev?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
}

export default function EnhancedHealthUI({ 
  isDev = false, 
  position = 'bottom-right',
  theme = 'auto' 
}: EnhancedHealthUIProps) {
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'accessibility' | 'seo' | 'responsive'>('overview');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const runHealthCheck = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (isDev) {
      runHealthCheck();
      
      // 自动刷新（每30秒）
      if (autoRefresh) {
        const interval = setInterval(runHealthCheck, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [isDev, autoRefresh, runHealthCheck]);

  const getStatusConfig = (status: string) => {
    const configs = {
      healthy: { 
        color: 'text-green-600', 
        bg: 'bg-green-100', 
        border: 'border-green-200',
        icon: CheckCircle,
        label: '优秀'
      },
      warning: { 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100', 
        border: 'border-yellow-200',
        icon: AlertCircle,
        label: '警告'
      },
      critical: { 
        color: 'text-red-600', 
        bg: 'bg-red-100', 
        border: 'border-red-200',
        icon: AlertCircle,
        label: '严重'
      }
    };
    return configs[status as keyof typeof configs] || configs.healthy;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'from-green-400 to-green-600';
    if (score >= 80) return 'from-blue-400 to-blue-600';
    if (score >= 70) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const CircularProgress = ({ score, size = 60, strokeWidth = 4 }: { score: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`text-current transition-all duration-1000 ${getScoreColor(score)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
    );
  };

  const HealthMetricCard = ({ 
    title, 
    score, 
    icon: Icon, 
    color,
    issues = [],
    description,
    improvement
  }: {
    title: string;
    score: number;
    icon: any;
    color: string;
    issues?: any[];
    description?: string;
    improvement?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-xs text-gray-500">/100</div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <motion.div 
            className={`h-1.5 rounded-full bg-gradient-to-r ${getProgressColor(score)}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {issues.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600">
            {issues.length} 个问题需要关注
          </div>
          {improvement && (
            <div className="text-xs text-blue-600 font-medium">
              {improvement}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  const QuickActions = () => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <button
          onClick={runHealthCheck}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
        
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span>自动刷新</span>
        </label>
      </div>

      {lastCheck && (
        <div className="text-xs text-gray-500">
          更新于 {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-4">
      {healthData?.overall && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">总体健康评分</h3>
              <p className="text-purple-100 text-sm">
                {healthData.overall.status === 'healthy' 
                  ? '应用状态优秀，继续保持！'
                  : healthData.overall.status === 'warning'
                  ? '发现一些需要优化的问题'
                  : '需要立即关注的关键问题'}
              </p>
            </div>
            <div className="text-center">
              <CircularProgress score={healthData.overall.score} size={80} />
              <div className="text-sm mt-1 font-medium">
                {getStatusConfig(healthData.overall.status).label}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {healthData?.performance && (
          <HealthMetricCard
            title="性能评分"
            score={healthData.performance.lighthouseScore}
            icon={Zap}
            color="text-blue-600"
            description="Lighthouse性能评估"
            improvement="优化图片和代码分割"
          />
        )}
        
        {healthData?.accessibility && (
          <HealthMetricCard
            title="无障碍评分"
            score={healthData.accessibility.score}
            icon={Shield}
            color="text-green-600"
            description="WCAG合规性检查"
            improvement="添加ARIA标签"
          />
        )}
        
        {healthData?.seo && (
          <HealthMetricCard
            title="SEO评分"
            score={healthData.seo.score}
            icon={Search}
            color="text-purple-600"
            description="搜索引擎优化"
            improvement="完善meta标签"
          />
        )}
        
        {healthData?.responsive && (
          <HealthMetricCard
            title="响应式评分"
            score={100 - (healthData.responsive.breakpoints.reduce((sum, bp) => sum + bp.issues.length, 0) * 10)}
            icon={Smartphone}
            color="text-orange-600"
            description="多设备兼容性"
            improvement="优化移动端体验"
          />
        )}
      </div>

      <QuickActions />
    </div>
  );

  const DetailedTab = (category: string) => {
    const data = healthData?.[category as keyof HealthCheckResult];
    if (!data) return null;

    const icons = {
      performance: { icon: Zap, color: 'text-blue-600' },
      accessibility: { icon: Shield, color: 'text-green-600' },
      seo: { icon: Search, color: 'text-purple-600' },
      responsive: { icon: Smartphone, color: 'text-orange-600' }
    };

    const Icon = icons[category as keyof typeof icons]?.icon || Activity;
    const color = icons[category as keyof typeof icons]?.color || 'text-gray-600';

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <Icon className={`w-6 h-6 ${color}`} />
          <div>
            <h3 className="font-bold text-gray-800">
              {category === 'performance' ? '性能分析' :
               category === 'accessibility' ? '无障碍分析' :
               category === 'seo' ? 'SEO分析' : '响应式分析'}
            </h3>
            <p className="text-sm text-gray-600">详细的健康指标和优化建议</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          {category === 'performance' && data && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.loadTime}s</div>
                  <div className="text-xs text-gray-600">加载时间</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.bundleSize}KB</div>
                  <div className="text-xs text-gray-600">打包大小</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.lighthouseScore}</div>
                  <div className="text-xs text-gray-600">Lighthouse</div>
                </div>
              </div>
            </div>
          )}

          {category === 'accessibility' && data.issues && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">
                发现 {data.issues.length} 个无障碍问题
              </div>
              {data.issues.slice(0, 3).map((issue, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-800">{issue.description}</div>
                  <div className="text-xs text-red-600 mt-1">{issue.fix}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: '总览', icon: PieChart },
    { id: 'performance', label: '性能', icon: Zap },
    { id: 'accessibility', label: '无障碍', icon: Shield },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'responsive', label: '响应式', icon: Smartphone }
  ];

  if (!isDev) return null;

  return (
    <>
      {/* 悬浮按钮 */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative">
          <Activity className="w-5 h-5" />
          {healthData?.overall && (
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${healthData.overall.status === 'healthy' ? 'bg-green-500' : healthData.overall.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          )}
        </div>
      </motion.button>

      {/* 主面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${positionClasses[position]} z-40 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden`}
          >
            {/* 标题栏 */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold">应用健康监控</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 标签页 */}
            <div className="border-b border-gray-100">
              <div className="flex space-x-0 overflow-x-auto">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab !== 'overview' && <DetailedTab category={activeTab} />}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}