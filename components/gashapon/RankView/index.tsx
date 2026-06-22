import React from 'react';
import styles from './index.module.scss';
import Image, { StaticImageData } from 'next/image'; // ✨ 引入 Next.js 核心 Image 组件

// 引入前三名的本地奖牌切图（根据你在主页面中 import 的图片做对应修改，或者直接通过路径读取）
/* import rank1Png from '/images/gashapon/1.png';
import rank2Png from '/images/gashapon/2.png';
import rank3Png from '/images/gashapon/3.png'; */

const jumpToUser = (uid: string) => {
  console.log('jumpToUser:', uid);
};

// ==================== 类型定义 ====================
export interface RankingItem {
  uid: string;
  nickname: string;
  avatarurl?: string | StaticImageData; // ✨ 完善支持 StaticImageData
  duid?: string;
  num?: number;
  rank?: number;
}

interface RankViewProps {
  /** 控制显示隐藏，funcState === 5 时显示 */
  funcState: number;
  /** 排行榜列表 */
  rankingList: RankingItem[];
  /** 大奖图片（用于显示奖品图标） */
  prizeImage: string | StaticImageData;
}

// ==================== 函数组件 ====================
const RankView: React.FC<RankViewProps> = ({
  funcState,
  rankingList,
  prizeImage,
}) => {
  // ✨ 定义前三名的奖牌映射
  const topRankMedals = ['/images/gashapon/1.png', '/images/gashapon/2.png', '/images/gashapon/3.png'];

  return (
    <div className={styles['big-prize-rank-main']} style={{ display: funcState === 5 ? 'block' : 'none' }}>
      <div className={styles['rank-scroll-box']}>
        
        {/* ✨ 优化点 1：将 1-3 名和 4 名以后的逻辑合二为一，避免数百行垃圾代码 */}
        {rankingList && rankingList.length > 0 && rankingList.map((item, index) => {
          const isTopThree = index < 3;

          return (
            <div className={styles['user-rank-top']} key={item.uid || index}>
              {/* 排名标识 */}
              <div className={styles['rank-order']}>
                {isTopThree ? (
                  <Image src={topRankMedals[index]} alt={`${styles['rank']} ${index + 1}`} priority width={48} height={48} />
                ) : (
                  item.rank || index + 1
                )}
              </div>

              {/* 用户头像（加兜底判断防止空数据引发崩溃） */}
              <div className={styles['avatar']} onClick={() => jumpToUser(item.uid)}>
                {item.avatarurl && <Image src={item.avatarurl} alt="avatar" />}
              </div>

              {/* 用户信息 */}
              <div className={styles['info']}>
                <div className={styles['name']}>{item.nickname}</div>
                <div className={styles['id']}>ID:{item.duid}</div>
              </div>

              {/* 奖品图标 */}
              <div className={styles['prize-icon-wrap']}>
                <Image src={prizeImage} alt="prize" className={styles['prize-icon']} width={40} height={40} />
              </div>
              
              <div className={styles['prize-num']}>{item.num}</div>
            </div>
          );
        })}
      </div>

      {/* ✨ 优化点 2：空状态切换为 Next.js Image */}
      {(!rankingList || rankingList.length <= 0) && (
        <div className={styles['null']}>
         <Image 
  src="/images/content_null.png" 
  alt="no data" 
  fill // 或者老版本用 layout="fill"

  style={{ objectFit: 'contain' }} // 保持图片比例不被拉伸
/>
        </div>
      )}
    </div>
  );
};

export default RankView;