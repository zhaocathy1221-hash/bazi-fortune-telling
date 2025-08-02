/**
 * 应用健康检查系统
 * 全面的性能和用户体验监控工具
 */

export interface HealthCheckResult {
  overall: {
    score: number;
    status: 'healthy' | 'warning' | 'critical';
    issues: HealthIssue[];
  };
  performance: {
    loadTime: number;
    bundleSize: number;
    lighthouseScore: number;
  };
  accessibility: {
    score: number;
    issues: AccessibilityIssue[];
  };
  seo: {
    score: number;
    issues: SEOIssue[];
  };
  responsive: {
    breakpoints: BreakpointStatus[];
    issues: ResponsiveIssue[];
  };
}

export interface HealthIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  fixable: boolean;
}

export interface AccessibilityIssue {
  rule: string;
  element?: string;
  description: string;
  fix: string;
}

export interface SEOIssue {
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  fix: string;
}

export interface ResponsiveIssue {
  breakpoint: string;
  issue: string;
  impact: string;
}

export interface BreakpointStatus {
  name: string;
  minWidth: number;
  maxWidth: number;
  status: 'pass' | 'warning' | 'fail';
  issues: string[];
}

/**
 * 应用健康检查器
 */
export class HealthChecker {
  private static instance: HealthChecker;
  private checks: Map<string, () => Promise<HealthCheckResult[keyof HealthCheckResult]>>;

  constructor() {
    this.checks = new Map();
    this.initializeChecks();
  }

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  private initializeChecks() {
    this.checks.set('performance', this.checkPerformance.bind(this));
    this.checks.set('accessibility', this.checkAccessibility.bind(this));
    this.checks.set('seo', this.checkSEO.bind(this));
    this.checks.set('responsive', this.checkResponsive.bind(this));
  }

  /**
   * 运行完整的健康检查
   */
  async runFullCheck(): Promise<HealthCheckResult> {
    const results: Partial<HealthCheckResult> = {};
    const issues: HealthIssue[] = [];

    for (const [name, check] of this.checks) {
      try {
        const result = await check();
        results[name as keyof HealthCheckResult] = result;
      } catch (error) {
        issues.push({
          type: `${name}_check_failed`,
          severity: 'medium',
          description: `${name}检查失败: ${error}`,
          recommendation: `检查${name}相关配置`,
          fixable: true
        });
      }
    }

    const overallScore = this.calculateOverallScore(results as HealthCheckResult);
    const overallStatus = this.getOverallStatus(overallScore, issues);

    return {
      overall: {
        score: overallScore,
        status: overallStatus,
        issues: [...issues, ...this.collectAllIssues(results as HealthCheckResult)]
      },
      ...(results as HealthCheckResult)
    };
  }

  /**
   * 性能健康检查
   */
  private async checkPerformance(): Promise<HealthCheckResult['performance']> {
    const issues: HealthIssue[] = [];
    let lighthouseScore = 85;
    let bundleSize = 500; // KB
    let loadTime = 2.5; // seconds

    // 模拟性能检查
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      loadTime = (navigation.loadEventEnd - navigation.navigationStart) / 1000;
      
      // 检查bundle大小
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      bundleSize = scripts.reduce((size, script) => {
        return size + (parseInt(script.getAttribute('data-size') || '0', 10) / 1024);
      }, 0);
    }

    if (loadTime > 3) {
      issues.push({
        type: 'slow_load_time',
        severity: 'high',
        description: `页面加载时间 ${loadTime}s 超过3秒目标`,
        recommendation: '优化图片大小，启用代码分割',
        fixable: true
      });
      lighthouseScore -= 15;
    }

    if (bundleSize > 500) {
      issues.push({
        type: 'large_bundle',
        severity: 'medium',
        description: `打包大小 ${bundleSize}KB 超过500KB限制`,
        recommendation: '使用动态导入，移除未使用的依赖',
        fixable: true
      });
      lighthouseScore -= 10;
    }

    return {
      loadTime,
      bundleSize,
      lighthouseScore: Math.max(0, Math.min(100, lighthouseScore))
    };
  }

  /**
   * 无障碍健康检查
   */
  private async checkAccessibility(): Promise<HealthCheckResult['accessibility']> {
    const issues: AccessibilityIssue[] = [];
    let score = 100;

    if (typeof window !== 'undefined') {
      // 检查ARIA标签
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach(img => {
        issues.push({
          rule: 'image-alt',
          element: img.tagName,
          description: '图片缺少alt属性',
          fix: '添加描述性的alt属性'
        });
        score -= 5;
      });

      // 检查表单标签
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        if (!id || !document.querySelector(`label[for="${id}"]`)) {
          issues.push({
            rule: 'form-labels',
            element: input.tagName,
            description: '表单控件缺少标签',
            fix: '添加label标签或aria-label属性'
          });
          score -= 3;
        }
      });

      // 检查颜色对比
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
      textElements.forEach(element => {
        const style = window.getComputedStyle(element);
        if (style.color === style.backgroundColor) {
          issues.push({
            rule: 'color-contrast',
            element: element.tagName,
            description: '文本颜色与背景颜色可能对比度不足',
            fix: '使用高对比度的颜色组合'
          });
          score -= 3;
        }
      });
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * SEO健康检查
   */
  private async checkSEO(): Promise<HealthCheckResult['seo']> {
    const issues: SEOIssue[] = [];
    let score = 100;

    if (typeof window !== 'undefined') {
      // 检查meta标签
      const title = document.querySelector('title');
      if (!title || title.textContent?.length === 0) {
        issues.push({
          type: 'missing-title',
          description: '缺少标题标签',
          priority: 'high',
          fix: '在head中添加title标签'
        });
        score -= 15;
      }

      const description = document.querySelector('meta[name="description"]');
      if (!description) {
        issues.push({
          type: 'missing-description',
          description: '缺少meta description',
          priority: 'high',
          fix: '添加meta description标签'
        });
        score -= 10;
      }

      // 检查图片alt属性
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.getAttribute('alt') || img.getAttribute('alt') === '') {
          issues.push({
            type: 'missing-alt',
            description: `图片 ${img.src} 缺少alt属性`,
            priority: 'medium',
            fix: '为所有图片添加描述性的alt属性'
          });
          score -= 2;
        }
      });

      // 检查结构化数据
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      if (!structuredData) {
        issues.push({
          type: 'missing-structured-data',
          description: '缺少结构化数据',
          priority: 'low',
          fix: '添加JSON-LD结构化数据'
        });
        score -= 5;
      }
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * 响应式设计健康检查
   */
  private async checkResponsive(): Promise<HealthCheckResult['responsive']> {
    const breakpoints: BreakpointStatus[] = [
      { name: 'mobile', minWidth: 0, maxWidth: 768, status: 'pass', issues: [] },
      { name: 'tablet', minWidth: 769, maxWidth: 1024, status: 'pass', issues: [] },
      { name: 'desktop', minWidth: 1025, maxWidth: 1920, status: 'pass', issues: [] }
    ];

    const issues: ResponsiveIssue[] = [];

    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // 检查不同断点的问题
      if (width <= 768) {
        // 移动端检查
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            breakpoints[0].issues.push('按钮太小，不适合触摸');
            breakpoints[0].status = 'warning';
          }
        });

        // 检查字体大小
        const smallText = document.querySelectorAll('*');
        smallText.forEach(el => {
          const style = window.getComputedStyle(el);
          if (parseFloat(style.fontSize) < 14) {
            breakpoints[0].issues.push('字体太小，移动端阅读困难');
            breakpoints[0].status = 'warning';
          }
        });
      }
    }

    return {
      breakpoints,
      issues
    };
  }

  /**
   * 计算总体健康分数
   */
  private calculateOverallScore(results: HealthCheckResult): number {
    let totalScore = 0;
    let weightSum = 0;

    // 性能权重 40%
    if (results.performance) {
      totalScore += results.performance.lighthouseScore * 0.4;
      weightSum += 0.4;
    }

    // 无障碍权重 30%
    if (results.accessibility) {
      totalScore += results.accessibility.score * 0.3;
      weightSum += 0.3;
    }

    // SEO权重 20%
    if (results.seo) {
      totalScore += results.seo.score * 0.2;
      weightSum += 0.2;
    }

    // 响应式权重 10%
    if (results.responsive) {
      const responsiveScore = this.calculateResponsiveScore(results.responsive);
      totalScore += responsiveScore * 0.1;
      weightSum += 0.1;
    }

    return weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
  }

  private calculateResponsiveScore(responsive: HealthCheckResult['responsive']): number {
    if (!responsive || !responsive.breakpoints) return 0;
    
    const issues = responsive.breakpoints.reduce((sum, bp) => sum + bp.issues.length, 0);
    return Math.max(0, 100 - (issues * 10));
  }

  private getOverallStatus(score: number, issues: HealthIssue[]): 'healthy' | 'warning' | 'critical' {
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) return 'critical';
    
    const highIssues = issues.filter(i => i.severity === 'high');
    if (highIssues.length > 2 || score < 70) return 'warning';
    
    return score >= 80 ? 'healthy' : 'warning';
  }

  private collectAllIssues(results: HealthCheckResult): HealthIssue[] {
    const issues: HealthIssue[] = [];

    // 收集所有检查的问题
    if (results.performance) {
      // 这里可以添加性能相关的问题
    }

    return issues;
  }

  /**
   * 生成健康报告
   */
  generateReport(results: HealthCheckResult): string {
    const report = [
      `# 应用健康报告`,
      ``,
      `## 总体状态: ${results.overall.status.toUpperCase()}`,
      `综合评分: ${results.overall.score}/100`,
      ``,
      `## 详细检查`,
      ``
    ];

    if (results.performance) {
      report.push(`### 性能检查`);
      report.push(`- Lighthouse评分: ${results.performance.lighthouseScore}/100`);
      report.push(`- 加载时间: ${results.performance.loadTime}s`);
      report.push(`- 打包大小: ${results.performance.bundleSize}KB`);
      report.push(``);
    }

    if (results.accessibility) {
      report.push(`### 无障碍检查`);
      report.push(`- 评分: ${results.accessibility.score}/100`);
      report.push(`- 问题数量: ${results.accessibility.issues.length}`);
      report.push(``);
    }

    if (results.seo) {
      report.push(`### SEO检查`);
      report.push(`- 评分: ${results.seo.score}/100`);
      report.push(`- 问题数量: ${results.seo.issues.length}`);
      report.push(``);
    }

    if (results.overall.issues.length > 0) {
      report.push(`## 需要关注的问题`);
      results.overall.issues.forEach(issue => {
        report.push(`- [${issue.severity}] ${issue.description}`);
        report.push(`  建议: ${issue.recommendation}`);
        report.push(``);
      });
    }

    return report.join('\n');
  }
}

/**
 * 快速健康检查工具
 */
export async function quickHealthCheck(): Promise<HealthCheckResult> {
  const checker = HealthChecker.getInstance();
  return await checker.runFullCheck();
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startMeasure(name: string) {
    this.metrics.set(`${name}_start`, performance.now());
  }

  endMeasure(name: string): number {
    const end = performance.now();
    const start = this.metrics.get(`${name}_start`) || 0;
    const duration = end - start;
    this.metrics.set(name, duration);
    return duration;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

/**
 * 错误监控工具
 */
export class ErrorMonitor {
  private errors: Array<{
    type: string;
    message: string;
    timestamp: Date;
    context?: unknown;
  }> = [];

  captureError(error: Error, context?: unknown) {
    this.errors.push({
      type: error.name,
      message: error.message,
      timestamp: new Date(),
      context
    });

    // 发送到分析服务
    if (typeof window !== 'undefined' && (window as { gtag?: (event: string, action: string, params: unknown) => void }).gtag) {
      (window as { gtag?: (event: string, action: string, params: unknown) => void }).gtag!('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

// 全局实例
export const healthChecker = HealthChecker.getInstance();
export const performanceMonitor = new PerformanceMonitor();
export const errorMonitor = new ErrorMonitor();

// 初始化全局错误处理
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorMonitor.captureError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorMonitor.captureError(new Error(event.reason), {
      type: 'unhandledrejection'
    });
  });
}