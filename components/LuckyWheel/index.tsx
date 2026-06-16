"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";

export interface PrizeItem {
  id: string | number;
  text: string;
  iconUrl?: string;
}

export interface LuckyWheelRef {
  stopAt: (targetIndex: number) => void;
  stopWithError: () => void;
}

interface LuckyWheelProps {
  prizes: PrizeItem[];
  wheelBgUrl: string;
  defaultIconUrl?: string;
  onSpinEnd?: (prize: PrizeItem) => void;
  onSpinStart?: () => void;
  duration?: number;
  baseCircles?: number;
  className?: string;
  /** 外框装饰图，不传使用默认 */
  frameBgUrl?: string;
}

const DEFAULT_FRAME_BG = "/images/bg-recl-w.webp";

const LuckyWheel = forwardRef<LuckyWheelRef, LuckyWheelProps>(
  (
    {
      prizes,
      wheelBgUrl,
      defaultIconUrl,
      onSpinEnd,
      onSpinStart,
      duration = 3500,
      baseCircles = 3,
      className = "",
      frameBgUrl = DEFAULT_FRAME_BG,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [spinState, setSpinState] = useState<"idle" | "waiting" | "stopping">(
      "idle",
    );
    const currentAngleRef = useRef(0);
    const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const requestRef = useRef<number | null>(null);
    const stopTimelineRef = useRef({
      startTime: 0,
      startAngle: 0,
      totalChangeAngle: 0,
    });

    const [imagesReady, setImagesReady] = useState(false);

    const prizeCount = prizes.length;
    const anglePerSector = (2 * Math.PI) / prizeCount;

    // ---- 绘制逻辑保持不变 ----
    const drawEllipsisText = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      font: string,
    ) => {
      ctx.save();
      ctx.font = font;
      let displayText = text;
      if (ctx.measureText(displayText).width > maxWidth && text.length > 1) {
        let left = 0,
          right = text.length;
        while (left < right) {
          const mid = Math.ceil((left + right) / 2);
          const testText = text.slice(0, mid) + "...";
          if (ctx.measureText(testText).width <= maxWidth) left = mid;
          else right = mid - 1;
        }
        displayText = text.slice(0, left) + "...";
      }
      ctx.fillText(displayText, x, y);
      ctx.restore();
    };

    const draw = useCallback(
      (angle: number) => {
        if (!imagesReady) return; // 图片未就绪不绘制
        const canvas = canvasRef.current;
        if (!canvas || !canvas.width) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = canvas.width;
        const center = size / 2;
        const radius = center;

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle);

        const wheelBgImg = imgCacheRef.current.get(wheelBgUrl);
        if (wheelBgImg?.complete) {
          ctx.drawImage(wheelBgImg, -radius, -radius, radius * 2, radius * 2);
        }

        for (let i = 0; i < prizeCount; i++) {
          const prize = prizes[i];
          const startAngle = i * anglePerSector;
          const textAngle = startAngle + anglePerSector / 2;
          ctx.save();
          ctx.rotate(textAngle);

          const fontSize = Math.round(radius * 0.08);
          ctx.fillStyle = "#2c3e50";
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.save();
          ctx.translate(radius * 0.7, 0);
          ctx.rotate(Math.PI / 2);
          drawEllipsisText(
            ctx,
            prize.text,
            0,
            0,
            radius * 0.35,
            `bold ${fontSize}px sans-serif`,
          );
          ctx.restore();

          const targetImgUrl = prize.iconUrl || defaultIconUrl;
          if (targetImgUrl) {
            const img = imgCacheRef.current.get(targetImgUrl);
            if (img?.complete) {
              ctx.save();
              ctx.translate(radius * 0.54, 0);
              ctx.rotate(Math.PI / 2);
              const imgSize = radius * 0.18;
              ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
              ctx.restore();
            }
          }
          ctx.restore();
        }
        ctx.restore();
      },
      [
        imagesReady,
        prizes,
        defaultIconUrl,
        wheelBgUrl,
        prizeCount,
        anglePerSector,
      ],
    );

    // ---- 动画 ----
    const easeOutQuartic = (t: number): number => 1 - --t * t * t * t;

    const updateAnimation = useCallback(
      (timestamp: number) => {
        const currentStatus = canvasRef.current?.getAttribute("data-state");
        if (currentStatus === "waiting") {
          currentAngleRef.current =
            (currentAngleRef.current + 0.12) % (2 * Math.PI);
          draw(currentAngleRef.current);
          requestRef.current = requestAnimationFrame(updateAnimation);
        } else if (currentStatus === "stopping") {
          const timeline = stopTimelineRef.current;
          if (!timeline.startTime) timeline.startTime = timestamp;
          const elapsed = timestamp - timeline.startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = easeOutQuartic(progress);
          const currentAngle =
            timeline.startAngle + timeline.totalChangeAngle * easeProgress;
          currentAngleRef.current = currentAngle;
          draw(currentAngle);

          if (progress < 1) {
            requestRef.current = requestAnimationFrame(updateAnimation);
          } else {
            setSpinState("idle");
            currentAngleRef.current = currentAngle % (2 * Math.PI);
            const finalIdx = Number(
              canvasRef.current?.getAttribute("data-target-idx") || 0,
            );
            if (onSpinEnd) onSpinEnd(prizes[finalIdx]);
          }
        }
      },
      [draw, duration, onSpinEnd, prizes],
    );

    useImperativeHandle(ref, () => ({
      stopAt: (targetIndex: number) => {
        if (canvasRef.current?.getAttribute("data-state") !== "waiting") return;
        canvasRef.current.setAttribute("data-target-idx", String(targetIndex));
        const baseRotations = baseCircles * 2 * Math.PI;
        const targetSectorCenter =
          targetIndex * anglePerSector + anglePerSector / 2;
        const currentNormalizedAngle = currentAngleRef.current % (2 * Math.PI);
        const finalAngle = baseRotations - Math.PI / 2 - targetSectorCenter;
        let totalChangeAngle = finalAngle - currentNormalizedAngle;
        if (totalChangeAngle < baseRotations) totalChangeAngle += 2 * Math.PI;
        stopTimelineRef.current = {
          startTime: 0,
          startAngle: currentAngleRef.current,
          totalChangeAngle,
        };
        setSpinState("stopping");
      },
      stopWithError: () => {
        setSpinState("idle");
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      },
    }));

    useEffect(() => {
      canvasRef.current?.setAttribute("data-state", spinState);
    }, [spinState]);

    // ---- 图片加载 & 初始化 ----
    useEffect(() => {
      const urls = new Set<string>();
      if (wheelBgUrl) urls.add(wheelBgUrl);
      if (defaultIconUrl) urls.add(defaultIconUrl);
      prizes.forEach((p) => p.iconUrl && urls.add(p.iconUrl));
      if (frameBgUrl) urls.add(frameBgUrl);
      // GO 按钮图片
      urls.add("/images/go-and-the-btn.webp");

      let loadedCount = 0;
      const total = urls.size;
      if (total === 0) {
        setImagesReady(true);
        return;
      }

      urls.forEach((url) => {
        if (!imgCacheRef.current.has(url)) {
          const img = new Image();
          img.src = url;
          img.onload = img.onerror = () => {
            imgCacheRef.current.set(url, img);
            loadedCount++;
            if (loadedCount >= total) setImagesReady(true);
          };
        } else {
          loadedCount++;
          if (loadedCount >= total) setImagesReady(true);
        }
      });
      if (loadedCount >= total) setImagesReady(true);
    }, [prizes, defaultIconUrl, wheelBgUrl, frameBgUrl]);

    // 当图片就绪或状态改变时调整 Canvas 并绘制
    useEffect(() => {
      if (!imagesReady) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      draw(currentAngleRef.current);
    }, [imagesReady, draw]);

    // 监听窗口 resize
    useEffect(() => {
      if (!imagesReady) return;
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        draw(currentAngleRef.current);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [imagesReady, draw]);

    const handleSpinClick = () => {
      if (spinState !== "idle" || !imagesReady) return;
      setSpinState("waiting");
      if (onSpinStart) onSpinStart();
      stopTimelineRef.current.startTime = 0;
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    return (
      <div className={`relative inline-block ${className}`}  style={{
    containerType: 'inline-size',
   
  }}>
        {/* 外框装饰 */}
        {imagesReady && (
          <div
            className="absolute inset-0 z-10 bg-no-repeat bg-center bg-contain pointer-events-none"
            style={{ backgroundImage: `url(${frameBgUrl})` }}
          />
        )}

        {/* Canvas 转盘，未就绪时显示占位 */}
        {!imagesReady ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            加载中…
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="block w-full h-full relative z-20"
          />
        )}

        {/* GO 按钮（自适应大小） */}
        {/* GO 按钮（自适应大小 + 底部文字） */}
        {imagesReady && (
          <button
            onClick={handleSpinClick}
            disabled={spinState !== "idle"}
            className="absolute z-30 border-none bg-transparent cursor-pointer disabled:opacity-50 flex items-center justify-center"
            style={{
              width: "47.4%",
              height: "69.5%",
              top: "30%",
              left: "50%",
              transform: "translate(-51%, -50%)",
              backgroundImage: `url('/images/go-and-the-btn.webp')`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <span
              className="flex flex-col justify-end items-center w-full h-full text-center font-bold text-[#f8f8d8]"
              style={{
                fontSize: "clamp(0.4rem, 6.15cqi, 1.5rem)",
                paddingBottom: "16%",
                textShadow:
                  "2px 2px 0 #a82a2a, 3px 3px 4px rgba(168,42,42,0.4)",
              }}
            >
              GO
            </span>
          </button>
        )}
      </div>
    );
  },
);

LuckyWheel.displayName = "LuckyWheel";
export default LuckyWheel;
