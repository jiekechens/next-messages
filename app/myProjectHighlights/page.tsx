"use client";
import { useRef } from "react";
import LuckyWheel, {
  type LuckyWheelRef,
  type PrizeItem,
} from "@/components/LuckyWheel";

import Gashapon from "@/components/gashapon";
const WHEEL_BG = "/images/shanxing.webp";
const DEFAULT_GOLD_ICON = "/images/gold-web.webp";

const prizeList: PrizeItem[] = [
  { id: 187, text: "10 Coins", iconUrl: "https://static.stargoparty.com/admin/20260527/system/186bc4ce-e568-4c87-af92-0e6d757e64621779868044276.png" },
  { id: 186, text: "Frame", iconUrl: "https://static.stargoparty.com/admin/20260529/system/9c63b336-31bc-4e90-871f-f5249604402c1780048028465-d3bad631cdadd.png" },
  { id: 183, text: "10K Coins", iconUrl: "https://static.stargoparty.com/admin/20260527/system/e4989cba-9b90-4e80-87bc-254bd790e4b01779868336815.png" },
  { id: 188, text: "Wave", iconUrl: "https://static.stargoparty.com/admin/20260529/system/83432521-75a1-41ee-b590-5db95405be961780050300383-b536ae9648b688.png" },
  { id: 182, text: "100 Coins", iconUrl: "https://static.stargoparty.com/admin/20260527/system/0d2400d5-ab14-45c5-b654-71a5dd2092211779868228733.png" },
  { id: 184, text: "500K Coins", iconUrl: "https://static.stargoparty.com/admin/20260527/system/0a655825-d878-431f-9af0-eddcb41ed97f1779868322832.png" },
  { id: 187, text: "Badge", iconUrl: "https://static.stargoparty.com/admin/20260529/system/63e3dfc3-98b4-4ccf-ad00-ec25ee4690371780048378530-9c26ad8034d7a8.png" },
  { id: 185, text: "4M Coins", iconUrl: "https://static.stargoparty.com/admin/20260527/system/dff89235-b57a-4ee2-9a7b-5fd8cf6a61371779868619166.png" },
];

export default function LuckyPage() {
  const wheelRef = useRef<LuckyWheelRef>(null);

  const handleSpinStart = () => {
    console.log("转盘开始转动");
    const randomIndex = Math.floor(Math.random() * prizeList.length);
    setTimeout(() => {
      wheelRef.current?.stopAt(randomIndex);
    }, 800);
  };

  const handleSpinEnd = (prize: PrizeItem) => {
    alert(`恭喜抽到：${prize.text}`);
    console.log("中奖奖品", prize);
  };

  return (
    // 1. 全屏沉浸式背景：加入优雅的暗紫色渐变与网格遮罩效果
    <>
    <div className="min-height-screen w-full bg-gradient-to-b from-[#4d1f85] via-[#2d1252] to-[#1a0736] flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden select-none">
      
      {/* 2. 炫酷头部标题区域 */}
      <div className="text-center mb-8 relative">
        <h1 className="text-3xl md:text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ffe875] via-[#fcd116] to-[#f39c12] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] uppercase">
          Lucky Wheel
        </h1>
        <p className="text-xs md:text-sm text-[#cfa8ff] mt-2 font-medium tracking-widest uppercase opacity-80">
          Spin to win ultimate rewards
        </p>
        {/* 标题发光环境光 */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-yellow-500/10 blur-2xl rounded-full" />
      </div>

      {/* 3. 核心大转盘舞台容器 */}
      <div className="relative w-full max-w-[24rem] md:max-w-[28rem] aspect-square flex items-center justify-center p-3 rounded-full bg-gradient-to-b from-[#6c3ba9] to-[#3a1c6a] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_4px_12px_rgba(255,255,255,0.15)] border-4 border-[#8e4fd4]/30">
        
        {/* 外圈跑马灯炫光环境特效 */}
        <div className="absolute inset-2 rounded-full border border-dashed border-yellow-400/20 animate-[spin_60s_linear_infinite]" />
        
        {/* 4. 你的核心转盘组件（尺寸自适应放大，完美撑满舞台） */}
        <LuckyWheel
          className="w-full h-full"
          prizes={prizeList}
          wheelBgUrl={WHEEL_BG}
          defaultIconUrl={DEFAULT_GOLD_ICON}
          ref={wheelRef}
          onSpinStart={handleSpinStart}
          onSpinEnd={handleSpinEnd}
          duration={3500}
          baseCircles={3}
        />

        {/* 转盘底座阴影特效，增强立体感 */}
        <div className="absolute -bottom-6 w-[80%] h-6 bg-black/40 blur-xl rounded-full -z-10" />
      </div>

      {/* 5. 底部装饰/状态小卡片 */}
      <div className="mt-10 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 text-white text-sm shadow-xl">
        <div className="flex -space-x-2">
          {prizeList.slice(0, 3).map((p, i) => (
            <img key={i} src={p.iconUrl} alt="" className="w-6 h-6 rounded-full border border-purple-500 bg-purple-900/50" />
          ))}
        </div>
        <span className="text-[#e2cbff]">已有超过 <strong className="text-yellow-400">9,999+</strong> 玩家斩获豪华大奖</span>
      </div>

    </div>
    <div>
        <Gashapon />
    </div>
    < div className="pb-10" />
    </>
  );
}