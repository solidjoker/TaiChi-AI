// 太极标准动作定义
export interface TaiJiAction {
  name: string;
  description: string;
  duration: number; // 秒
  keypoints: {
    name: string;
    targetAngle: number;
    tolerance: number;
  }[];
  stages: {
    name: string;
    progress: [number, number];
    description: string;
  }[];
}

export const TAIJI_ACTIONS: TaiJiAction[] = [
  {
    name: '起势',
    description: '太极起势 - 沉肩坠肘、虚领顶劲',
    duration: 5,
    keypoints: [
      { name: 'left_elbow', targetAngle: 170, tolerance: 15 },
      { name: 'right_elbow', targetAngle: 170, tolerance: 15 },
      { name: 'left_shoulder', targetAngle: 90, tolerance: 20 },
      { name: 'right_shoulder', targetAngle: 90, tolerance: 20 }
    ],
    stages: [
      { name: '准备', progress: [0, 0.2], description: '双脚与肩同宽' },
      { name: '抬手', progress: [0.2, 0.5], description: '双手缓慢上抬' },
      { name: '下落', progress: [0.5, 0.8], description: '双手缓慢下落' },
      { name: '收势', progress: [0.8, 1.0], description: '回到起始位置' }
    ]
  },
  {
    name: '左右野马分鬃',
    description: '左右野马分鬃 - 开步搂膝、弓步分掌',
    duration: 8,
    keypoints: [
      { name: 'left_knee', targetAngle: 160, tolerance: 20 },
      { name: 'right_knee', targetAngle: 160, tolerance: 20 },
      { name: 'left_hip', targetAngle: 90, tolerance: 25 },
      { name: 'right_hip', targetAngle: 90, tolerance: 25 }
    ],
    stages: [
      { name: '左式准备', progress: [0, 0.25], description: '重心右移' },
      { name: '左弓步', progress: [0.25, 0.5], description: '左脚开步、左手搂膝' },
      { name: '右式准备', progress: [0.5, 0.75], description: '重心左移' },
      { name: '右弓步', progress: [0.75, 1.0], description: '右脚开步、右手搂膝' }
    ]
  },
  {
    name: '白鹤亮翅',
    description: '白鹤亮翅 - 提膝亮掌、独立平衡',
    duration: 6,
    keypoints: [
      { name: 'left_knee', targetAngle: 120, tolerance: 25 },
      { name: 'right_knee', targetAngle: 90, tolerance: 20 },
      { name: 'left_wrist', targetAngle: 180, tolerance: 30 },
      { name: 'right_wrist', targetAngle: 180, tolerance: 30 }
    ],
    stages: [
      { name: '过渡', progress: [0, 0.3], description: '重心左移' },
      { name: '提膝', progress: [0.3, 0.6], description: '右腿提膝' },
      { name: '亮掌', progress: [0.6, 0.85], description: '双掌展开' },
      { name: '保持', progress: [0.85, 1.0], description: '稳定姿势' }
    ]
  }
];

export const getActionByName = (name: string): TaiJiAction | undefined => {
  return TAIJI_ACTIONS.find(action => action.name === name);
};
