import React from 'react';

interface LoadingCompProps {
  show: boolean;
}

const LoadingComp: React.FC<LoadingCompProps> = ({ show }) => {
  if (!show) return null;

  // 定义球的配置
  const eggs = [
    { delay: '0s', img: '/images/gashapon/egg2.png' },
    { delay: '0.2s', img: '/images/gashapon/egg3.png' },
    { delay: '0.4s', img: '/images/gashapon/egg4.png' },
  ];

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/40">
      {/* 蛋的动画部分 */}
      <div className="mb-[0.6rem] h-[1.5rem] w-[1.5rem] animate-shake-slow">
        {/* 如果你原本有图片，这里可以用 Image 组件或者 img 标签 */}
        <img src="/images/gashapon/shakeEgg.png" alt="egg" className="h-full w-full object-contain" />
      </div>

      {/* 加载点部分 */}
      <div className="flex">
        {eggs.map((egg, index) => (
          <div
            key={index}
            className="mx-[0.15rem] h-[0.4rem] w-[0.4rem] animate-loader rounded-full bg-cover bg-center"
            style={{ 
              animationDelay: egg.delay,
              backgroundImage: `url('${egg.img}')` 
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingComp;