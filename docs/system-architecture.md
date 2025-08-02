# 八字占卜系统 - 系统架构设计

## 1. 系统架构概览

### 1.1 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js 15)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   首页      │  │  输入页面   │  │  结果页面   │          │
│  │  Landing    │  │  Birth Info │  │  Results    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  分享页面   │  │  用户中心   │  │  支付页面   │          │
│  │   Share     │  │   Profile   │  │   Payment   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      API 网关层                              │
│                  (Next.js API Routes)                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      业务服务层                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  八字计算服务   │  │  运势解读引擎   │  │  分享服务   │  │
│  │  Bazi Service   │  │  Interpretation │  │   Share     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  用户管理服务   │  │  支付管理服务   │  │  缓存服务   │  │
│  │  User Service   │  │ Payment Service │  │    Cache    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   用户信息表    │  │   八字数据表    │  │  解读模板   │  │
│  │   user_info     │  │   bazi_data     │  │  templates  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   支付记录表    │  │   分享记录表    │  │   缓存表    │  │
│  │ payment_records │  │  share_records  │  │    cache    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选择

**前端技术栈**
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **图标**: Lucide React
- **日期处理**: date-fns
- **图片生成**: html2canvas

**后端技术栈**
- **运行时**: Node.js (Next.js API Routes)
- **数据库**: PostgreSQL
- **缓存**: Redis
- **ORM**: Prisma
- **验证**: Zod
- **支付**: 微信支付API

**部署与运维**
- **部署**: Vercel
- **CDN**: Cloudflare
- **监控**: Vercel Analytics
- **日志**: Vercel Logs

## 2. 核心模块设计

### 2.1 八字计算模块

**算法架构**
```typescript
interface BaziCalculation {
  // 基础数据
  birthDateTime: Date;
  gender: 'male' | 'female';
  calendarType: 'lunar' | 'solar';
  
  // 计算结果
  yearPillar: HeavenlyStemEarthlyBranch;
  monthPillar: HeavenlyStemEarthlyBranch;
  dayPillar: HeavenlyStemEarthlyBranch;
  hourPillar: HeavenlyStemEarthlyBranch;
  
  // 衍生属性
  fiveElements: FiveElementsDistribution;
  tenGods: TenGodsRelationship;
  hiddenStems: HiddenStems[];
}
```

**计算流程**
1. **农历转换**: 使用天文算法转换农历到阳历
2. **节气计算**: 基于太阳黄经计算二十四节气
3. **天干地支**: 根据年份、月份、日、时计算对应的天干地支
4. **五行属性**: 计算天干地支对应的五行属性
5. **十神关系**: 基于日主计算十神关系

### 2.2 运势解读引擎

**解读模板系统**
```typescript
interface InterpretationTemplate {
  id: string;
  category: 'personality' | 'wealth' | 'marriage' | 'career' | 'health' | 'academy';
  conditions: BaziCondition[];
  content: InterpretationContent;
  priority: number;
}

interface InterpretationContent {
  title: string;
  summary: string;
  detailed: string;
  advice: string[];
  keywords: string[];
}
```

**解读策略**
- **规则引擎**: 基于命理规则的匹配系统
- **模板渲染**: 动态内容替换和个性化
- **内容优化**: 针对年轻人的语言风格
- **长度控制**: 确保500-700字的合理范围

### 2.3 分享生成系统

**分享模板**
```typescript
interface ShareTemplate {
  id: string;
  type: 'simple' | 'detailed' | 'personalized';
  layout: ShareLayout;
  theme: ShareTheme;
  elements: ShareElement[];
}

interface ShareLayout {
  background: string;
  colorScheme: string;
  typography: string;
  spacing: string;
}
```

**生成流程**
1. **数据准备**: 匿名化处理敏感信息
2. **模板选择**: 根据用户偏好选择模板
3. **内容渲染**: 生成HTML和CSS
4. **图片转换**: 使用html2canvas转换为图片
5. **优化压缩**: 压缩图片大小和质量

## 3. 数据模型设计

### 3.1 核心数据表

**用户表 (user_info)**
```sql
CREATE TABLE user_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(255) UNIQUE,
  unionid VARCHAR(255),
  nickname VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**八字数据表 (bazi_data)**
```sql
CREATE TABLE bazi_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_info(id),
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  gender VARCHAR(10) NOT NULL,
  calendar_type VARCHAR(10) NOT NULL,
  year_pillar VARCHAR(10),
  month_pillar VARCHAR(10),
  day_pillar VARCHAR(10),
  hour_pillar VARCHAR(10),
  five_elements JSONB,
  ten_gods JSONB,
  interpretation_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**解读模板表 (interpretation_templates)**
```sql
CREATE TABLE interpretation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  conditions JSONB NOT NULL,
  title VARCHAR(200),
  content JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 缓存策略

**Redis缓存设计**
- **八字计算结果**: 24小时缓存
- **解读模板**: 7天缓存
- **分享图片**: 30天缓存
- **用户会话**: 2小时缓存

## 4. API接口设计

### 4.1 核心接口

**计算八字**
```typescript
POST /api/bazi/calculate
{
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  calendarType: 'lunar' | 'solar';
}

Response:
{
  success: boolean;
  data: BaziCalculationResult;
}
```

**获取基础解读**
```typescript
GET /api/interpretation/basic?baziId={id}

Response:
{
  success: boolean;
  data: BasicInterpretation;
}
```

**获取衍生解读**
```typescript
POST /api/interpretation/detailed
{
  baziId: string;
  questions: string[];
}

Response:
{
  success: boolean;
  data: DetailedInterpretation[];
}
```

**生成分享图片**
```typescript
POST /api/share/generate
{
  baziId: string;
  template: 'simple' | 'detailed' | 'personalized';
}

Response:
{
  success: boolean;
  data: {
    imageUrl: string;
    shareUrl: string;
  };
}
```

## 5. 性能优化策略

### 5.1 前端优化

**代码分割**
- 按路由分割代码
- 按需加载组件
- 图片懒加载

**缓存策略**
- 浏览器缓存静态资源
- SWR缓存API响应
- 本地存储用户偏好

### 5.2 后端优化

**计算优化**
- 预计算常见日期组合
- 缓存计算结果
- 批量处理请求

**数据库优化**
- 索引优化查询
- 分页处理大量数据
- 读写分离架构

## 6. 安全设计

### 6.1 数据安全

**敏感信息保护**
- 出生信息加密存储
- 分享内容匿名化处理
- API接口鉴权

**隐私保护**
- 最小化数据收集
- 数据删除功能
- 透明的隐私政策

### 6.2 系统安全

**防护机制**
- 输入验证和清理
- 防止SQL注入
- 限制API频率
- HTTPS强制使用

## 7. 监控与运维

### 7.1 监控指标

**业务指标**
- 用户完成率
- 分享率
- 错误率
- 响应时间

**技术指标**
- 系统可用性
- 资源使用率
- API响应时间
- 数据库性能

### 7.2 告警机制

**自动告警**
- 系统异常告警
- 性能下降告警
- 错误率上升告警
- 用户投诉告警

## 8. 部署策略

### 8.1 环境配置

**开发环境**
- 本地开发使用SQLite
- 热重载开发服务器
- 模拟支付环境

**生产环境**
- Vercel部署
- PostgreSQL数据库
- Redis缓存
- 微信支付正式环境

### 8.2 发布流程

**CI/CD流程**
1. 代码提交触发测试
2. 自动化测试通过
3. 代码质量检查
4. 部署到预生产环境
5. 人工验证通过
6. 部署到生产环境

## 9. 扩展性设计

### 9.1 功能扩展

**未来功能**
- 流年运势预测
- 合婚配对功能
- 风水建议
- 起名服务

### 9.2 技术扩展

**架构扩展**
- 微服务架构
- 容器化部署
- CDN加速
- 多语言支持

## 10. 开发规范

### 10.1 代码规范

**前端规范**
- TypeScript严格模式
- ESLint代码检查
- Prettier格式化
- 组件设计模式

**后端规范**
- RESTful API设计
- 错误处理统一
- 日志规范
- 单元测试覆盖

### 10.2 文档规范

**API文档**
- OpenAPI规范
- 示例代码
- 错误码说明

**开发文档**
- 环境搭建指南
- 部署手册
- 运维指南