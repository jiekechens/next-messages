import React from 'react';
import Image, { StaticImageData } from 'next/image'; // ✨ 引入 Next.js 核心 Image 组件
import styles from './index.module.scss';

// ==================== 类型定义 ====================
export interface RewardItem {
  id?: number;
  image: string | StaticImageData;
  name?: string;
  gold?: number;
  bubbleUrl?: string | StaticImageData; 
}

interface RewardViewProps {
  funcState: number;
  lang: any;
  position2: string;
  poolLevelShow: number;
  normalList: RewardItem[];
  deluxeList: RewardItem[];
  changePoolLevel: (val: number, flag: boolean) => void;
}

// ==================== 函数组件 ====================
const RewardView: React.FC<RewardViewProps> = ({
  funcState,
  position2,
  poolLevelShow,
  changePoolLevel,
  lang,
  normalList,
  deluxeList,
}) => {
  
  // 渲染单个奖品项
  const renderRewardItem = (item: RewardItem, index: number) => {
    // ✨ 安全检查：先确保 image 是字符串，再判断是否包含 egg_fragment
    const isFragment = typeof item.image === 'string' && item.image.includes('egg_fragment');
    const transformStyle = isFragment ? 'scale(0.75)' : '';

    return (
      <div className={styles['rw-item']} key={index}>
        <div className={styles['bubble']}>
          {item.bubbleUrl && (
            <Image 
              src={item.bubbleUrl} 
              alt="bubble" 
              placeholder="blur" 
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+" 
            />
          )}
        </div>
        <div className={styles['gift']}>
          {/* ✨ 使用 Next.js Image 组件渲染 */}
          <Image 
            src={item.image} 
            style={{ transform: transformStyle }} 
            alt={item.name || 'reward'} 
            placeholder="blur" 
            width={80}
            height={80}
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+" 
          />
        </div>
        <div className={styles['shadow']}></div>
        <div className={styles['name']}>{item.name}</div>
      </div>
    );
  };

  // 普通池的第一行（前5个）
  const renderNormalList1 = () => {
    if (!normalList || normalList.length === 0) return null; // ✨ 修复：不再盲目返回 null，改为有数据时正常渲染
    return normalList
      .filter((_, index) => index >= 0 && index < 5)
      .map((item, index) => renderRewardItem(item, index));
  };

  // 普通池的第二行（第6个及以后）
  const renderNormalList2 = () => {
    if (normalList.length <= 5) return null;
    return normalList
      .filter((_, index) => index > 4)
      .map((item, index) => renderRewardItem(item, index));
  };

  // 高级池的第一行
  const renderDeluxeList1 = () => {
    if (!deluxeList || deluxeList.length === 0) return null;
    return deluxeList
      .filter((_, index) => index >= 0 && index < 5)
      .map((item, index) => renderRewardItem(item, index));
  };

  // 高级池的第二行
  const renderDeluxeList2 = () => {
    if (deluxeList.length <= 5) return null;
    return deluxeList
      .filter((_, index) => index > 4)
      .map((item, index) => renderRewardItem(item, index));
  };

  return (
    <div className={styles['reward-pool-main']} style={{ display: funcState === 6 ? 'block' : 'none' }}>
      {/* 模式切换 */}
      <div className={styles['pool-mode']}>
        <div className={styles['pool-active']} style={{ backgroundPosition: `${position2} center` }}></div>
        <div className={styles['pool-txt']}>
          <div className={styles['low-pool']} onClick={() => changePoolLevel(1, true)}>{lang.poolL}</div>
          <div className={styles['hight-pool']} onClick={() => changePoolLevel(2, true)}>{lang.poolH}</div>
        </div>
      </div>
      {/* 奖励列表 */}
      <div className={styles['reward-main']}>
        <div className={styles['rw-bg']}>
          {/* 普通池第一行 */}
          <div className={styles['rw-list1']} style={{ display: poolLevelShow === 1 ? 'flex' : 'none' }}>
            {renderNormalList1()}
          </div>
          {/* 普通池第二行 */}
          <div className={styles['rw-list2']} style={{ display: poolLevelShow === 1 ? 'flex' : 'none' }}>
            {renderNormalList2()}
          </div>
          {/* 高级池第一行 */}
          <div className={styles['rw-list1']} style={{ display: poolLevelShow === 2 ? 'flex' : 'none' }}>
            {renderDeluxeList1()}
          </div>
          {/* 高级池第二行 */}
          <div className={styles['rw-list2']} style={{ display: poolLevelShow === 2 ? 'flex' : 'none' }}>
            {renderDeluxeList2()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardView;