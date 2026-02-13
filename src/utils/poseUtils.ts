// 姿态评估工具函数
import { PoseLandmark } from '@mediapipe/pose';

const LANDMARKS = {
  nose: 0,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28
};

// 计算两点之间的角度
export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
}

// 获取指定关节点
export function getLandmark(pose: PoseLandmark[], name: keyof typeof LANDMARKS): PoseLandmark | null {
  const index = LANDMARKS[name];
  const landmark = pose[index];
  if (landmark && landmark.visibility > 0.3) {
    return landmark;
  }
  return null;
}

// 评估单个关节点角度
export function evaluateKeypoint(
  pose: PoseLandmark[],
  landmarkName: string,
  targetAngle: number,
  tolerance: number
): { score: number; feedback: string } {
  const landmarks = LANDMARKS as Record<string, number>;
  const index = landmarks[landmarkName];
  const landmark = pose[index];
  
  if (!landmark || landmark.visibility < 0.3) {
    return { score: 0, feedback: '请确保该部位在画面中' };
  }
  
  // 根据不同关节点计算角度
  let currentAngle = 0;
  
  switch (landmarkName) {
    case 'left_elbow':
      currentAngle = calculateAngle(
        getLandmark(pose, 'left_shoulder')!,
        landmark,
        getLandmark(pose, 'left_wrist')!
      );
      break;
    case 'right_elbow':
      currentAngle = calculateAngle(
        getLandmark(pose, 'right_shoulder')!,
        landmark,
        getLandmark(pose, 'right_wrist')!
      );
      break;
    case 'left_knee':
      currentAngle = calculateAngle(
        getLandmark(pose, 'left_hip')!,
        landmark,
        getLandmark(pose, 'left_ankle')!
      );
      break;
    case 'right_knee':
      currentAngle = calculateAngle(
        getLandmark(pose, 'right_hip')!,
        landmark,
        getLandmark(pose, 'right_ankle')!
      );
      break;
    case 'left_shoulder':
      currentAngle = calculateAngle(
        getLandmark(pose, 'left_elbow')!,
        landmark,
        getLandmark(pose, 'left_hip')!
      );
      break;
    case 'right_shoulder':
      currentAngle = calculateAngle(
        getLandmark(pose, 'right_elbow')!,
        landmark,
        getLandmark(pose, 'right_hip')!
      );
      break;
    case 'left_wrist':
      // 计算手腕相对于肩膀的高度
      const leftShoulder = getLandmark(pose, 'left_shoulder');
      if (leftShoulder) {
        currentAngle = 180 - ((landmark.y - leftShoulder.y) / (leftShoulder.y - getLandmark(pose, 'left_ankle')!.y)) * 180;
      }
      break;
    case 'right_wrist':
      const rightShoulder = getLandmark(pose, 'right_shoulder');
      if (rightShoulder) {
        currentAngle = 180 - ((landmark.y - rightShoulder.y) / (rightShoulder.y - getLandmark(pose, 'right_ankle')!.y)) * 180;
      }
      break;
  }
  
  const diff = Math.abs(currentAngle - targetAngle);
  
  if (diff <= tolerance) {
    return { 
      score: 100 - (diff / tolerance) * 20, 
      feedback: '动作标准' 
    };
  } else if (diff <= tolerance * 2) {
    return { 
      score: 60 - ((diff - tolerance) / tolerance) * 40, 
      feedback: `偏差 ${diff.toFixed(1)}°` 
    };
  } else {
    return { 
      score: Math.max(0, 30 - (diff - tolerance * 2) / tolerance * 20), 
      feedback: diff > targetAngle ? '角度偏大' : '角度偏小' 
    };
  }
}

// 评估完整动作
export function evaluatePose(
  pose: PoseLandmark[],
  targetAction: { keypoints: { name: string; targetAngle: number; tolerance: number }[] }
): { score: number; feedback: string; details: { keypoint: string; score: number; feedback: string }[] } {
  const details = targetAction.keypoints.map(kp => {
    const result = evaluateKeypoint(pose, kp.name, kp.targetAngle, kp.tolerance);
    return {
      keypoint: kp.name,
      ...result
    };
  });
  
  const avgScore = details.reduce((sum, d) => sum + d.score, 0) / details.length;
  
  // 生成综合反馈
  let feedback = '';
  const goodParts = details.filter(d => d.score >= 80);
  const badParts = details.filter(d => d.score < 50);
  
  if (avgScore >= 90) {
    feedback = '动作非常标准！';
  } else if (avgScore >= 70) {
    feedback = goodParts.length > 0 
      ? `${goodParts.map(g => g.feedback).join('，')}保持良好`
      : '整体不错，继续保持';
  } else if (avgScore >= 50) {
    feedback = badParts.length > 0
      ? `${badParts.map(b => b.feedback).join('，')}需要调整`
      : '继续调整动作';
  } else {
    feedback = '请参考标准动作重新尝试';
  }
  
  return {
    score: Math.round(avgScore),
    feedback,
    details
  };
}

// 计算身体中心点（用于居中显示）
export function getBodyCenter(pose: PoseLandmark[]): { x: number; y: number } {
  const leftShoulder = getLandmark(pose, 'left_shoulder');
  const rightShoulder = getLandmark(pose, 'right_shoulder');
  
  if (leftShoulder && rightShoulder) {
    return {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
  }
  
  // 备用：使用鼻子
  const nose = getLandmark(pose, 'nose');
  if (nose) {
    return { x: nose.x, y: nose.y };
  }
  
  return { x: 0.5, y: 0.5 };
}
