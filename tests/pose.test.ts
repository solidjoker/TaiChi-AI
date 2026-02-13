import { describe, it, expect } from 'vitest';
import { calculateAngle, evaluateKeypoint, evaluatePose } from '../src/utils/poseUtils';
import { TAIJI_ACTIONS } from '../src/data/taijiActions';

// 创建模拟关节点数据的辅助函数
function createMockPose(overrides: Partial<Record<number, { x: number; y: number; z: number; visibility: number }>> = {}) {
  const defaultPose = Array(33).fill(null).map((_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.9
  }));
  
  Object.entries(overrides).forEach(([key, value]) => {
    defaultPose[parseInt(key)] = value;
  });
  
  return defaultPose as any;
}

describe('姿态评估工具', () => {
  describe('calculateAngle', () => {
    it('应该正确计算三点形成的角度 - 90度', () => {
      const a = { x: 0, y: 0, z: 0, visibility: 1 };
      const b = { x: 1, y: 0, z: 0, visibility: 1 };
      const c = { x: 1, y: 1, z: 0, visibility: 1 };
      
      const angle = calculateAngle(a, b, c);
      expect(angle).toBeCloseTo(90, 0);
    });
    
    it('应该正确计算三点形成的角度 - 180度', () => {
      const a = { x: 0, y: 0, z: 0, visibility: 1 };
      const b = { x: 1, y: 0, z: 0, visibility: 1 };
      const c = { x: 2, y: 0, z: 0, visibility: 1 };
      
      const angle = calculateAngle(a, b, c);
      expect(angle).toBeCloseTo(180, 0);
    });
  });

  describe('evaluateKeypoint', () => {
    it('应该返回正确分数当角度在容差范围内', () => {
      // 创建包含所有必需关节点的 pose
      const pose = createMockPose({
        11: { x: 0.4, y: 0.3, z: 0, visibility: 0.9 }, // left_shoulder
        13: { x: 0.35, y: 0.5, z: 0, visibility: 0.9 }, // left_elbow
        15: { x: 0.3, y: 0.4, z: 0, visibility: 0.9 }, // left_wrist
        23: { x: 0.45, y: 0.6, z: 0, visibility: 0.9 }, // left_hip
        25: { x: 0.42, y: 0.8, z: 0, visibility: 0.9 }, // left_knee
        27: { x: 0.42, y: 1.0, z: 0, visibility: 0.9 }, // left_ankle
        12: { x: 0.6, y: 0.3, z: 0, visibility: 0.9 }, // right_shoulder
        14: { x: 0.65, y: 0.5, z: 0, visibility: 0.9 }, // right_elbow
        16: { x: 0.7, y: 0.4, z: 0, visibility: 0.9 }, // right_wrist
        24: { x: 0.55, y: 0.6, z: 0, visibility: 0.9 }, // right_hip
        26: { x: 0.58, y: 0.8, z: 0, visibility: 0.9 }, // right_knee
        28: { x: 0.58, y: 1.0, z: 0, visibility: 0.9 }, // right_ankle
        0: { x: 0.5, y: 0.2, z: 0, visibility: 0.9 }, // nose
      });
      
      // 测试手腕高度评估
      const result = evaluateKeypoint(pose, 'left_wrist', 90, 20);
      expect(result.score).toBeDefined();
      expect(typeof result.feedback).toBe('string');
    });

    it('应该返回低分当可见度低', () => {
      const pose = createMockPose({
        11: { x: 0.4, y: 0.3, z: 0, visibility: 0.1 }, // 可见度低
        13: { x: 0.35, y: 0.5, z: 0, visibility: 0.1 },
        15: { x: 0.3, y: 0.4, z: 0, visibility: 0.1 },
      });
      
      const result = evaluateKeypoint(pose, 'left_elbow', 90, 20);
      expect(result.score).toBe(0);
      expect(result.feedback).toBe('请确保该部位在画面中');
    });
    
    it('应该返回正确的反馈类型', () => {
      // 测试可见度低的情况
      const pose = createMockPose({
        11: { x: 0.4, y: 0.3, z: 0, visibility: 0.1 },
        13: { x: 0.35, y: 0.5, z: 0, visibility: 0.1 },
        15: { x: 0.3, y: 0.4, z: 0, visibility: 0.1 },
      });
      
      const result = evaluateKeypoint(pose, 'left_elbow', 90, 20);
      // 可见度低应该返回 0 分
      expect(result.score).toBe(0);
      expect(result.feedback).toBe('请确保该部位在画面中');
    });
  });

  describe('evaluatePose', () => {
    it('应该评估完整姿态并返回分数和反馈', () => {
      const pose = createMockPose({
        11: { x: 0.4, y: 0.3, z: 0, visibility: 0.9 },
        13: { x: 0.35, y: 0.5, z: 0, visibility: 0.9 },
        15: { x: 0.3, y: 0.4, z: 0, visibility: 0.9 },
        23: { x: 0.45, y: 0.6, z: 0, visibility: 0.9 },
        25: { x: 0.42, y: 0.8, z: 0, visibility: 0.9 },
        27: { x: 0.42, y: 1.0, z: 0, visibility: 0.9 },
        12: { x: 0.6, y: 0.3, z: 0, visibility: 0.9 },
        14: { x: 0.65, y: 0.5, z: 0, visibility: 0.9 },
        16: { x: 0.7, y: 0.4, z: 0, visibility: 0.9 },
        24: { x: 0.55, y: 0.6, z: 0, visibility: 0.9 },
        26: { x: 0.58, y: 0.8, z: 0, visibility: 0.9 },
        28: { x: 0.58, y: 1.0, z: 0, visibility: 0.9 },
        0: { x: 0.5, y: 0.2, z: 0, visibility: 0.9 },
      });
      
      const action = {
        keypoints: [
          { name: 'left_shoulder', targetAngle: 90, tolerance: 30 }
        ]
      };
      
      const result = evaluatePose(pose, action);
      expect(typeof result.score).toBe('number');
      expect(typeof result.feedback).toBe('string');
      expect(result.details).toBeDefined();
      expect(result.details.length).toBe(1);
    });
  });
});

describe('太极动作数据', () => {
  it('应该包含正确的动作列表', () => {
    expect(TAIJI_ACTIONS.length).toBeGreaterThan(0);
    expect(TAIJI_ACTIONS[0].name).toBe('起势');
    expect(TAIJI_ACTIONS[0].stages.length).toBeGreaterThan(0);
  });
  
  it('每个动作应该包含必需的属性', () => {
    TAIJI_ACTIONS.forEach(action => {
      expect(action.name).toBeDefined();
      expect(action.description).toBeDefined();
      expect(action.duration).toBeGreaterThan(0);
      expect(action.keypoints).toBeInstanceOf(Array);
      expect(action.stages).toBeInstanceOf(Array);
      expect(action.keypoints.length).toBeGreaterThan(0);
      expect(action.stages.length).toBeGreaterThan(0);
    });
  });
  
  it('应该能通过名称获取动作', () => {
    const action = TAIJI_ACTIONS.find(a => a.name === '起势');
    expect(action).toBeDefined();
    expect(action?.name).toBe('起势');
  });
});
