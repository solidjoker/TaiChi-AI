# TaiChi AI - 太极智能健身

🎮 基于 AI 动作识别的太极健身应用

## 功能特性

- 📷 **实时摄像头追踪** - 使用 MediaPipe Pose 实时捕捉动作
- 🤖 **AI 动作评估** - 实时对比标准太极动作，智能评分
- 🎨 **水墨风格** - 沉浸式中国传统美学体验
- 📱 **跨平台支持** - iOS / Android / Web

## 快速开始

### 环境要求

- Node.js 18+
- 现代浏览器 (Chrome/Firefox/Safari)
- 摄像头权限

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/TaiChi-AI.git
cd TaiChi-AI

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
TaiChi-AI/
├── src/
│   ├── components/     # React 组件
│   │   ├── TaiChiGame.tsx    # 主游戏组件
│   │   └── Game.module.css   # 水墨风格样式
│   ├── hooks/         # 自定义 Hooks
│   │   └── usePoseDetection.ts  # 姿态检测
│   ├── utils/         # 工具函数
│   │   └── poseUtils.ts      # 姿态评估算法
│   ├── store/         # 状态管理
│   │   └── gameStore.ts      # Zustand 状态
│   ├── data/          # 数据定义
│   │   └── taijiActions.ts   # 太极动作定义
│   └── styles/        # 全局样式
├── public/            # 静态资源
├── tests/             # 测试文件
└── package.json
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 游戏引擎 | PixiJS 7 |
| 姿态识别 | MediaPipe Pose |
| 动画 | Framer Motion |
| 状态管理 | Zustand |
| 构建工具 | Vite 5 |
| 测试 | Vitest |

## 支持的动作

### MVP 包含

1. **起势** - 太极基础站姿
2. **左右野马分鬃** - 弓步搂膝
3. **白鹤亮翅** - 独立平衡

### 后续更新

- 单鞭
- 提手上势
- 白蛇吐信
- 十字手
- 收势

## 核心算法

### 动作评估流程

```
摄像头画面
    ↓
姿态检测 (MediaPipe)
    ↓
骨骼点提取 (33个关键点)
    ↓
角度计算 (关节点夹角)
    ↓
对比标准动作
    ↓
实时评分 (0-100)
    ↓
反馈提示
```

### 评分维度

| 维度 | 权重 | 说明 |
|------|------|------|
| 角度准确度 | 40% | 与标准角度的偏差 |
| 时间同步 | 25% | 动作完成时间 |
| 流畅度 | 20% | 动作连贯性 |
| 稳定性 | 15% | 抖动程度 |

## 开发指南

### 添加新动作

```typescript
// src/data/taijiActions.ts

{
  name: '新动作名称',
  description: '动作描述',
  duration: 6, // 秒
  keypoints: [
    {
      name: 'left_elbow',
      targetAngle: 90,  // 目标角度
      tolerance: 20    // 容差
    }
  ],
  stages: [
    {
      name: '阶段1',
      progress: [0, 0.5],
      description: '描述'
    }
  ]
}
```

### 自定义样式

在 `Game.module.css` 中修改水墨风格：

```css
.gameContainer {
  /* 背景渐变 */
  background: linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%);
}

/* 按钮样式 */
.startButton {
  background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
}
```

## API 参考

### usePoseDetection

```typescript
const {
  videoRef,      // video 元素引用
  canvasRef,     // canvas 元素引用
  startDetection, // 开始检测
  stopDetection,  // 停止检测
  isCameraReady  // 摄像头是否就绪
} = usePoseDetection();
```

### useGameStore

```typescript
const {
  currentPose,    // 当前姿态数据
  gameState,      // 游戏状态
  score,          // 当前分数
  combo,          // 连击数
  feedback,       // 即时反馈
  setCurrentAction, // 设置当前动作
  setScore,        // 设置分数
  incrementCombo,  // 增加连击
  resetCombo       // 重置连击
} = useGameStore();
```

## 性能优化

- 使用 Web Workers 进行姿态检测
- 降级处理低端设备
- 懒加载非关键资源
- 姿态数据本地处理（隐私）

## 测试

```bash
# 运行所有测试
npm test

# 运行覆盖率
npm test -- --coverage
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

## 致谢

- [MediaPipe](https://mediapipe.dev/) - Google 姿态识别
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [PixiJS](https://pixijs.com/) - 2D 渲染引擎

---

**练太极，找太极AI** 🦆
