import React from 'react';
import styles from './index.module.scss';
import { StaticImageData } from 'next/image';
import Image from 'next/image';

// ==================== 类型定义 ====================
export interface ResultItem {
  id?: number | string;
  image: string | StaticImageData;
  name?: string;
  winNum: number;
  bubbleUrl?: string | StaticImageData; // ✨ 补充支持 StaticImageData
  gold?: number;
}

interface ResultPopUpProps {
  /** 是否显示弹窗 */
  isShowResult: boolean;
  /** 关闭弹窗的回调 */
  onChangeIsShowResult: () => void;
  /** 中奖结果列表 */
  resultList: ResultItem[];
  /** 语言对象 */
  lang: any;
}

// ==================== 函数组件 ====================
const ResultPopUp: React.FC<ResultPopUpProps> = ({
  isShowResult,
  onChangeIsShowResult,
  resultList,
  lang,
}) => {
  return (
    <div
      className={`${styles['gashapon-draw-prize-main']} ${isShowResult ? styles['bounceAni'] : ''}`}
      style={{ display: isShowResult ? 'flex' : 'none' }}
    >
      <div className={styles['desc']}>{lang.rwDesc}</div>
      <div className={styles['result-pool-main']}>
        <div className={styles['reward-main']}>
          <div className={styles['rw-bg']}>
            <div className={styles['rw-list']}>
              {resultList.map((item, index) => {
                
                // ✨ 优雅安全检查：通过 src 属性提取字符串来判断是否包含 egg_fragment
                const imgUrl = typeof item.image === 'string' ? item.image : item.image?.src || '';
                const isFragment = imgUrl.includes('egg_fragment');
                const transformStyle = isFragment ? 'scale(0.75)' : '';

                return (
                  <div
                    className={`${styles['rw-item']} ${styles[`come${index + 1}`]}`} // ✨ 修复类名拼接写法：styles['come']${index + 1} 是错的，应放入模板字符串内部
                    key={item.id || index}
                  >
                    <div className={styles['bubble']}>
                      {/* ✨ 防空保护：确保 bubbleUrl 存在时才渲染 Image组件 */}
                      {item.bubbleUrl && (
                        <Image 
                          src={item.bubbleUrl} 
                          alt="bubble" 
                          placeholder="blur"
                          width={90}
                          height={90}
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+"
                        />
                      )}
                      <div className={styles['count']}>x{item.winNum}</div>
                    </div>
                    <div className={styles['gift']}>
                      <Image 
                        src={item.image} 
                         width={90}
                          height={90}
                        style={{ transform: transformStyle }} 
                        alt={item.name || 'reward'} 
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+"
                      />
                    </div>
                    <div className={styles['shadow']}></div>
                    <div className={styles['name']}>{item.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          className={`${styles['close']} ${isShowResult ? styles['close-ani'] : ''}`}
          onClick={onChangeIsShowResult}
        ></div>
      </div>
    </div>
  );
};

export default ResultPopUp;