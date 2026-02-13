// 太极AI - 状态管理
import { create } from 'zustand';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface GameState {
  // 摄像头状态
  isCameraReady: boolean;
  cameraStream: MediaStream | null;
  
  // 姿态数据
  currentPose: PoseLandmark[] | null;
  previousPose: PoseLandmark[] | null;
  
  // 评估状态
  currentAction: string;
  actionProgress: number;
  score: number;
  feedback: string;
  
  // 游戏状态
  gameState: 'idle' | 'ready' | 'playing' | 'completed';
  combo: number;
  
  // 方法
  setCameraReady: (ready: boolean, stream?: MediaStream) => void;
  setCurrentPose: (pose: PoseLandmark[]) => void;
  setCurrentAction: (action: string) => void;
  setActionProgress: (progress: number) => void;
  setScore: (score: number) => void;
  setFeedback: (feedback: string) => void;
  setGameState: (state: 'idle' | 'ready' | 'playing' | 'completed') => void;
  incrementCombo: () => void;
  resetCombo: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // 初始状态
  isCameraReady: false,
  cameraStream: null,
  currentPose: null,
  previousPose: null,
  currentAction: '',
  actionProgress: 0,
  score: 0,
  feedback: '',
  gameState: 'idle',
  combo: 0,
  
  // 方法
  setCameraReady: (ready, stream = null) => 
    set({ isCameraReady: ready, cameraStream: stream }),
    
  setCurrentPose: (pose) => 
    set((state) => ({ 
      previousPose: state.currentPose,
      currentPose: pose 
    })),
    
  setCurrentAction: (action) => 
    set({ currentAction: action, actionProgress: 0 }),
    
  setActionProgress: (progress) => 
    set({ actionProgress: progress }),
    
  setScore: (score) => set({ score }),
    
  setFeedback: (feedback) => set({ feedback }),
    
  setGameState: (state) => set({ gameState: state }),
    
  incrementCombo: () => 
    set((state) => ({ combo: state.combo + 1 })),
    
  resetCombo: () => set({ combo: 0 })
}));
