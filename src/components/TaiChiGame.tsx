// 太极AI - React 组件
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useGameStore } from '../store/gameStore';
import { TAIJI_ACTIONS } from '../data/taijiActions';
import { evaluatePose } from '../utils/poseUtils';
import styles from './Game.module.css';

// 太极动作组件
function TaiJiPose({ pose, isPlaying }: { pose: any; isPlaying: boolean }) {
  if (!pose) return null;

  return (
    <svg viewBox="0 0 640 480" className={styles.poseSvg}>
      {/* 骨骼连线 */}
      <g stroke="rgba(40,40,40,0.8)" strokeWidth="4" strokeLinecap="round">
        <line x1={pose[11]?.x * 640} y1={pose[11]?.y * 480} x2={pose[12]?.x * 640} y2={pose[12]?.y * 480} />
        <line x1={pose[11]?.x * 640} y1={pose[11]?.y * 480} x2={pose[13]?.x * 640} y2={pose[13]?.y * 480} />
        <line x1={pose[13]?.x * 640} y1={pose[13]?.y * 480} x2={pose[15]?.x * 640} y2={pose[15]?.y * 480} />
        <line x1={pose[12]?.x * 640} y1={pose[12]?.y * 480} x2={pose[14]?.x * 640} y2={pose[14]?.y * 480} />
        <line x1={pose[14]?.x * 640} y1={pose[14]?.y * 480} x2={pose[16]?.x * 640} y2={pose[16]?.y * 480} />
        <line x1={pose[11]?.x * 640} y1={pose[11]?.y * 480} x2={pose[23]?.x * 640} y2={pose[23]?.y * 480} />
        <line x1={pose[12]?.x * 640} y1={pose[12]?.y * 480} x2={pose[24]?.x * 640} y2={pose[24]?.y * 480} />
        <line x1={pose[23]?.x * 640} y1={pose[23]?.y * 480} x2={pose[24]?.x * 640} y2={pose[24]?.y * 480} />
        <line x1={pose[23]?.x * 640} y1={pose[23]?.y * 480} x2={pose[25]?.x * 640} y2={pose[25]?.y * 480} />
        <line x1={pose[25]?.x * 640} y1={pose[25]?.y * 480} x2={pose[27]?.x * 640} y2={pose[27]?.y * 480} />
        <line x1={pose[24]?.x * 640} y1={pose[24]?.y * 480} x2={pose[26]?.x * 640} y2={pose[26]?.y * 480} />
        <line x1={pose[26]?.x * 640} y1={pose[26]?.y * 480} x2={pose[28]?.x * 640} y2={pose[28]?.y * 480} />
      </g>

      {/* 关节点 */}
      {pose.map((point: any, i: number) => (
        point.visibility > 0.3 && (
          <circle
            key={i}
            cx={point.x * 640}
            cy={point.y * 480}
            r={isPlaying ? 8 : 6}
            fill="rgba(60,60,60,0.9)"
            className={styles.joint}
          />
        )
      ))}
    </svg>
  );
}

// 分数显示组件
function ScoreDisplay({ score, combo }: { score: number; combo: number }) {
  return (
    <div className={styles.scoreContainer}>
      <motion.div 
        className={styles.score}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={score}
      >
        <span className={styles.scoreLabel}>得分</span>
        <span className={styles.scoreValue}>{score}</span>
      </motion.div>
      
      {combo > 1 && (
        <motion.div 
          className={styles.combo}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
        >
          🔥 {combo} 连击!
        </motion.div>
      )}
    </div>
  );
}

// 动作阶段指示器
function ActionStage({ action, progress }: { action: any; progress: number }) {
  const currentStage = action?.stages.find(
    (s: any) => progress >= s.progress[0] && progress < s.progress[1]
  );

  return (
    <div className={styles.stageContainer}>
      <h3 className={styles.actionName}>{action?.name || '准备开始'}</h3>
      
      <div className={styles.progressBar}>
        <motion.div 
          className={styles.progressFill}
          initial={{ width: '0%' }}
          animate={{ width: `${progress * 100}%` }}
        />
      </div>
      
      {currentStage && (
        <motion.div 
          className={styles.stageInfo}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={styles.stageName}>{currentStage.name}</span>
          <span className={styles.stageDesc}>{currentStage.description}</span>
        </motion.div>
      )}
    </div>
  );
}

// 主游戏组件
export default function TaiChiGame() {
  const { 
    videoRef, 
    canvasRef, 
    startDetection, 
    stopDetection,
    isCameraReady 
  } = usePoseDetection();
  
  const {
    currentPose,
    gameState,
    currentAction,
    actionProgress,
    score,
    combo,
    feedback,
    setGameState,
    setCurrentAction,
    setActionProgress,
    setScore,
    setFeedback,
    incrementCombo
  } = useGameStore();

  const [showFeedback, setShowFeedback] = useState(false);

  // 开始检测
  const handleStart = async () => {
    await startDetection();
    setGameState('ready');
    setCurrentAction(TAIJI_ACTIONS[0].name);
  };

  // 停止检测
  const handleStop = () => {
    stopDetection();
    setGameState('idle');
  };

  // 评估当前姿态
  useEffect(() => {
    if (currentPose && gameState === 'ready') {
      const action = TAIJI_ACTIONS.find(a => a.name === currentAction);
      if (action) {
        const result = evaluatePose(currentPose, action);
        setScore(result.score);
        setFeedback(result.feedback);
        
        if (result.score >= 70) {
          incrementCombo();
        }
        
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 1500);
      }
    }
  }, [currentPose, currentAction, gameState]);

  return (
    <div className={styles.gameContainer}>
      {/* 背景 - 水墨风格 */}
      <div className={styles.background}>
        <div className={styles.paperTexture} />
        <div className={styles.inkWash} />
      </div>

      {/* 主内容区 */}
      <div className={styles.mainContent}>
        {/* 标题 */}
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          太极<span className={styles.highlight}>AI</span>
        </motion.h1>

        {/* 摄像头画面 */}
        <div className={styles.videoContainer}>
          <video 
            ref={videoRef}
            className={styles.video}
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef}
            className={styles.canvas}
          />
          
          {/* 骨骼叠加 */}
          <TaiJiPose pose={currentPose} isPlaying={gameState === 'ready'} />

          {/* 开始按钮 */}
          {!isCameraReady && (
            <motion.button
              className={styles.startButton}
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              开始练习
            </motion.button>
          )}

          {/* 停止按钮 */}
          {isCameraReady && (
            <motion.button
              className={styles.stopButton}
              onClick={handleStop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              结束
            </motion.button>
          )}
        </div>

        {/* 状态显示 */}
        <AnimatePresence>
          {isCameraReady && (
            <motion.div
              className={styles.statusPanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {/* 分数 */}
              <ScoreDisplay score={score} combo={combo} />

              {/* 动作阶段 */}
              <ActionStage 
                action={TAIJI_ACTIONS.find(a => a.name === currentAction)} 
                progress={actionProgress}
              />

              {/* 即时反馈 */}
              <AnimatePresence>
                {showFeedback && feedback && (
                  <motion.div
                    className={styles.feedback}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部装饰 */}
      <div className={styles.footer}>
        <div className={styles.seal}>太极AI</div>
      </div>
    </div>
  );
}
