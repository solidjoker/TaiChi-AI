// 摄像头姿态追踪 Hook
import { useEffect, useRef, useCallback } from 'react';
import { Pose } from '@mediapipe/pose';
import { useGameStore } from '../store/gameStore';

export function usePoseDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const { setCameraReady, setCurrentPose, isCameraReady } = useGameStore();

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true, stream);
        return true;
      }
      return false;
    } catch (error) {
      console.error('摄像头访问失败:', error);
      setCameraReady(false);
      return false;
    }
  }, [setCameraReady]);

  const initializePose = useCallback(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      if (results.poseLandmarks) {
        setCurrentPose(results.poseLandmarks);
        drawPose(results.poseLandmarks);
      }
    });

    poseRef.current = pose;
  }, [setCurrentPose]);

  const drawPose = (landmarks: any[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制骨骼连线
    const connections = [
      [11, 12], // 肩膀
      [11, 13], [13, 15], // 左臂
      [12, 14], [14, 16], // 右臂
      [11, 23], [12, 24], // 躯干
      [23, 24], // 臀部
      [23, 25], [25, 27], // 左腿
      [24, 26], [26, 28]  // 右腿
    ];

    // 水墨风格绘制
    ctx.strokeStyle = 'rgba(30, 30, 30, 0.8)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && p1.visibility > 0.3 && p2.visibility > 0.3) {
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
    });

    // 绘制关节点（水墨风格圆点）
    landmarks.forEach((point, index) => {
      if (point.visibility > 0.3) {
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          6,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(80, 80, 80, 0.9)';
        ctx.fill();
        
        // 外圈光晕
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          10,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const startDetection = useCallback(async () => {
    const cameraReady = await initializeCamera();
    if (!cameraReady) return;

    initializePose();
    
    const detectFrame = () => {
      if (videoRef.current && poseRef.current) {
        poseRef.current.send({ image: videoRef.current });
      }
      requestAnimationFrame(detectFrame);
    };
    
    detectFrame();
  }, [initializeCamera, initializePose]);

  const stopDetection = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, [setCameraReady]);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    isCameraReady
  };
}
