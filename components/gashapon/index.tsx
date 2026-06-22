import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image'; // ✨ 引入 Next.js 核心图片组件
import styles from './index.module.scss';
import langM from './lang';
import ResultPopUp from './ResultPopUp';
import RewardView from './RewardView';
import ToastColor from './ToastColor';
import RankView from './RankView';
import Loading from './Loading';


/* import titlePng from '/images/gashapon/title.png';

import rwBgPng from '/images/gashapon/rw_bg.png';
import rank1Png from '/images/gashapon/1.png';
import rank2Png from '/images/gashapon/2.png';
import rank3Png from '/images/gashapon/3.png';
import v5Png from '/images/gashapon/v5.png';
import fragmentPng from '/images/gashapon/fragment.png';
import closePng from '/images/gashapon/close.png';
import music1Png from '/images/gashapon/music_1.png';
import music2Png from '/images/gashapon/music_2.png';
import loadingGif from '/images/gashapon/loading.gif';
import lightPng from '/images/gashapon/light.png';
import goldIconPng from '/images/gashapon/gold.png';
import egg5Png from '/images/gashapon/egg5.png';
import goldwebPng from '/images/gashapon/gold-web.webp';
import bannerPng from '/images/gashapon/banner.png'; */
import lightPng from '../../public/images/gashapon/light.png';
import musicOn from '../../public/images/gashapon/music_2.png'; 
import musicOff from '../../public/images/gashapon/music_1.png';
import jackpotPng from '../../public/images/gashapon/jackpot.png';

import egg5Png from '../../public/images/gashapon/egg5.png';

// ==================== 完善更精准的 TS 类型定义 ====================
interface RankingItem {
  uid: string;
  nickname: string;
  score: number;
  avatar: string | StaticImageData;
}

interface RewardItem {
  id: number;
  image: string | StaticImageData;
  name: string;
  gold: number;
}

interface ShopItem {
  itemId: number;
  image: string | StaticImageData;
  eggShopid: number;
  price: number;
}

interface BetItem {
  winNum: number;
  gold: number;
  image: string | StaticImageData;
}

interface HistoryItem {
  ts: number;
  ptype: number;
  list: Array<{ image: string | StaticImageData; winNum: number }>;
  bigResult: {
    isBetBig: boolean;
    image: string | StaticImageData;
  };
}

interface ExchangeItem {
  ts: number;
  image: string | StaticImageData;
  count: number;
}

interface GashaponProps {
  location?: {
    query?: {
      language?: string;
      [key: string]: string | number | undefined;
    };
  };
}

// ==================== 模拟外部函数 ====================
const setDocumentTitle = (title: string) => console.log('[mock] setDocumentTitle:', title);
const setUidToken = async (query: Record<string, any>): Promise<string> => 'mock-uid-12345';
const jumpToWallet = () => console.log('jumpToWallet');
const closeWebview = () => console.log('closeWebview');
const closeWebViewPage = () => console.log('closeWebViewPage');

export const unix2date6 = (unix: number | string, tr?: boolean): string => {
  if (unix == 0) return '';
  let timestamp = typeof unix === 'string' ? parseInt(unix, 10) : unix;
  if (timestamp > 9000000000) timestamp = Math.floor(timestamp / 1000);
  
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return tr ? `${year}-${day}-${month} ${hour}:${minutes}:${seconds}` : `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
};

// ==================== 假数据 ====================
const mockRanking = {
  res: {
    list: [
      { uid: 'u1', nickname: '玩家A', score: 999, avatar: '' },
      { uid: 'u2', nickname: '玩家B', score: 888, avatar: '' },
      { uid: 'u3', nickname: '玩家C', score: 777, avatar: '' },
    ],
  },
};

const mockRewardLow = {
  res: [
    { id: 1, image: '/images/gashapon/gold-web.webp', name: '10金币', gold: 10 },
    { id: 2, image: '/images/gashapon/gold-web.webp', name: '20金币', gold: 20 },
    { id: 3, image: '/images/gashapon/gold-web.webp', name: '50金币', gold: 50 },
  ],
};

const mockRewardHigh = {
  res: [
    { id: 101, image: "/images/gashapon/v5.png", name: '人鱼大奖', gold: 500 },
    { id: 102, image: "/images/gashapon/v5.png", name: '龙蛋', gold: 300 },
  ],
};

const mockShopList = {
  res: [
    { itemId: 1, image: "/images/gashapon/v5.png", eggShopid: 1, price: 50 },
    { itemId: 2, image: "/images/gashapon/v5.png", eggShopid: 2, price: 100 },
  ],
};

const mockBetResult = (poolLevel: number, times: number) => {
  const list: BetItem[] = [];
  for (let i = 0; i < times; i++) {
    const gold = Math.floor(Math.random() * (poolLevel === 1 ? 50 : 300)) + 1;
    list.push({ winNum: 1, gold, image: '/images/gashapon/egg5.png' });
  }
  const isBig = Math.random() > 0.85;
  return {
    res: {
      list,
      bigResult: { isBetBig: isBig, image: isBig ? '/images/gashapon/egg5.png' : '' },
      probability: (Math.random() * 10 + 1).toFixed(2),
    },
  };
};

const mockHistory = () => {
  const base: HistoryItem[] = [
    { ts: Date.now() - 3600000, ptype: 1, list: [{ image: "/images/gashapon/fragment.png", winNum: 2 }], bigResult: { isBetBig: false, image: '' } },
    { ts: Date.now() - 7200000, ptype: 2, list: [{ image: "/images/gashapon/fragment.png", winNum: 1 }], bigResult: { isBetBig: true, image: '/images/gashapon/egg5.png' } },
  ];
  return { res: { list: base, hasMore: false, scroll: 'end' } };
};

const mockExHistory = {
  res: {
    list: [
      { ts: Date.now() - 1800000, image: "/images/gashapon/fragment.png", count: 2 },
    ],
    hasMore: false,
    scroll: 'end',
  },
};

const Gashapon: React.FC<GashaponProps> = (props) => {
  // ---------- 所有的状态定义（补充明确的范型） ----------
  const [position, setPosition] = useState('0');
  const [position2, setPosition2] = useState('0');
  const [isSwitch, setIsSwitch] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFall, setIsFall] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [isShowResult, setIsShowResult] = useState(false);
  const [poolLevel, setPoolLevel] = useState(1);
  const [poolLevelShow, setPoolLevelShow] = useState(1);
  const [funcState, setFuncState] = useState(0);
  const [shopReminder, setShopReminder] = useState(0);
  const [isBigPrize, setIsBigPrize] = useState(false);
  const [isBigPrizeMain, setIsBigPrizeMain] = useState(false);
  const [rankingList, setRankingList] = useState<RankingItem[]>([]);
  const [resultList, setResultList] = useState<BetItem[]>([]);
  const [shopList, setShopList] = useState<ShopItem[]>([]);
  const [userGold, setUserGold] = useState(0);
  const [prob, setProb] = useState<number | string>(0);
  const [chip, setChip] = useState(-1);
  const [bigPrizeImage, setBigPrizeImage] = useState<string | StaticImageData>(egg5Png);
  const [times, setTimes] = useState(10);
  const [eggColor, setEggColor] = useState('');
  const [shopGiftImage, setShopGiftImage] = useState<string | StaticImageData>('');
  const [eggShopId, setEggShopId] = useState(0);
  const [currentGoodsPrice, setCurrentGoodsPrice] = useState(0);
  const [recordState, setRecordState] = useState(1);
  const [isMore, setIsMore] = useState(false);
  const [historyScroll, setHistoryScroll] = useState('');
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isExMore, setIsExMore] = useState(false);
  const [shopHistoryScroll, setShopHistoryScroll] = useState('');
  const [exchangeRecordList, setExchangeRecordList] = useState<ExchangeItem[]>([]);
  const [popUpTips, setPopUpTips] = useState('');
  const [popUpColor, setPopUpColor] = useState('');
  const [loadingPopUp, setLoadingPopUp] = useState(false);
  const [isCanMore, setIsCanMore] = useState(true);
  const [loadGif, setLoadGif] = useState(false);
  const [handFirstShow, setHandFirstShow] = useState(true);
  const [normalList, setNormalList] = useState<RewardItem[]>([]);
  const [deluxeList, setDeluxeList] = useState<RewardItem[]>([]);
  const [playMusic, setPlayMusic] = useState(false);
  const [moreloading, setMoreloading] = useState(false);
  const [lang, setLang] = useState<Record<string, string>>(langM.en);
  const [language, setLanguage] = useState('en');
  const [uid, setUid] = useState<string | undefined>(undefined);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const toastRef = useRef<any>(null);

  const onClickPopUp = useCallback((txt: string, color: string) => {
    setPopUpTips(txt);
    setPopUpColor(color);
    toastRef.current?.hideRule?.(true);
  }, []);

  const RunOnStart = useCallback(async (uid: string) => {
    setLoadingPopUp(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setUid(uid);
    setRankingList(mockRanking.res.list);
    setUserGold(10000);
    setProb(6.8);
    setShopList(mockShopList.res);
    setLoadingPopUp(false);
    setNormalList(mockRewardLow.res);
    setDeluxeList(mockRewardHigh.res);
  }, []);

  const getEggColor = useCallback((): string => {
    const arr = resultList.map((item) => item.gold);
    if (arr.length === 0) return 'egg-blue';
    const max = Math.max(...arr);
    if (poolLevel === 1) {
      if (max >= 100) return 'egg-gold';
      if (max >= 5 && max < 100) return 'egg-purple';
      return 'egg-blue';
    } else {
      if (max >= 300) return 'egg-gold';
      if (max >= 100 && max <= 200) return 'egg-purple';
      return 'egg-blue';
    }
  }, [resultList, poolLevel]);

  const canBet = useCallback(async (): Promise<boolean> => {
    try {
      setLoadGif(true);
      setHandFirstShow(false);
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockRes = mockBetResult(poolLevel, times);

      if (playMusic && audioRef2.current) {
        audioRef2.current.currentTime = 0;
        audioRef2.current.play().catch(() => {});
      }

      setResultList(mockRes.res.list);
      setIsBigPrizeMain(mockRes.res.bigResult.isBetBig);
      setBigPrizeImage(mockRes.res.bigResult.image || bigPrizeImage);
      setProb(mockRes.res.probability);
      setLoadGif(false);

      const color = getEggColor();
      setEggColor(color || '');

      const cost = poolLevel === 1 ? 10 : 100;
      setUserGold((prev) => prev - times * cost);

      if (playMusic && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return true;
    } catch (error) {
      onClickPopUp('网络繁忙', 'rgba(0,0,0,.6)');
      return false;
    }
  }, [poolLevel, times, playMusic, bigPrizeImage, getEggColor, onClickPopUp]);

  const onSwitch = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    const multiple = poolLevel === 1 ? 10 : 100;
    if (userGold - multiple * times < 0) {
      onClickPopUp(lang.noG, 'rgba(0,0,0,.6)');
      setIsLoading(false);
      return;
    }

    const res = await canBet();
    if (!res) {
      setIsLoading(false);
      onClickPopUp(lang.nw, 'rgba(0,0,0,.6)');
      return;
    }

    setIsSwitch(true);
    setTimeout(() => setIsStart(true), 2000);
    setTimeout(() => {
      setIsStart(false);
      setIsFall(true);
      setTimeout(() => {
        setIsShake(true);
        setTimeout(() => {
          setIsLoading(false);
          setIsFall(false);
          setIsShake(false);
          setIsSwitch(false);
          setIsShowResult(true);
          setIsBigPrize(isBigPrizeMain);
          setTimeout(() => {
            if (playMusic && audioRef2.current) {
              audioRef2.current.currentTime = 0;
              audioRef2.current.pause();
            }
          }, 2000);
        }, 1000);
      }, 1000);
    }, 6500);
  }, [isLoading, poolLevel, userGold, times, lang, canBet, playMusic, isBigPrizeMain, onClickPopUp]);

  const changePoolLevel = useCallback((val: number, flag: boolean) => {
    if (flag) {
      setPosition2('0');
      setPoolLevelShow(val);
    } else {
      setPosition('0');
      setPoolLevel(val);
    }
  }, []);

  const onChangeFuncState = useCallback(async (val: number) => {
    setFuncState(val);
    if (val === 0) setShopReminder(0);
    if (val === 1) {
      const record = mockHistory();
      const exRecord = mockExHistory;
      setIsMore(record.res.hasMore);
      setHistoryScroll(record.res.scroll);
      setHistoryList(record.res.list);
      setIsExMore(exRecord.res.hasMore);
      setShopHistoryScroll(exRecord.res.scroll);
      setExchangeRecordList(exRecord.res.list);
    }
    if (val === 3) setChip(Math.floor(Math.random() * 200) + 50);
    if (val === 5) setRankingList(mockRanking.res.list);
  }, []);

  const isShowShop = useCallback((val: number, img: string | StaticImageData, id: number, price: number) => {
    setShopReminder(val);
    setShopGiftImage(img);
    setEggShopId(id);
    setCurrentGoodsPrice(price);
  }, []);

  const exchangeGift = useCallback(async () => {
    if (chip - currentGoodsPrice < 0) {
      onClickPopUp(lang.noF, 'rgba(0,0,0,.6)');
      return;
    }
    onClickPopUp(lang.exSuc, '#7d35ff');
    setShopReminder(0);
    setChip((prev) => prev - currentGoodsPrice);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, [chip, currentGoodsPrice, lang, onClickPopUp]);

  const getMore = useCallback(async (val: number) => {
    if (!isCanMore) return;
    setIsCanMore(false);
    setMoreloading(true);
    if (val === 1 && isMore) {
      const rc = mockHistory();
      setHistoryList((prev) => [...prev, ...rc.res.list]);
      setIsMore(rc.res.hasMore);
      setHistoryScroll(rc.res.scroll);
      setIsCanMore(true);
      setMoreloading(false);
    }
    if (val === 2 && isExMore) {
      const rc = mockExHistory;
      setExchangeRecordList((prev) => [...prev, ...rc.res.list]);
      setIsExMore(rc.res.hasMore);
      setShopHistoryScroll(rc.res.scroll);
      setIsCanMore(true);
      setMoreloading(false);
    }
  }, [isCanMore, isMore, isExMore]);

  const onChangeRecord = useCallback((val: number) => setRecordState(val), []);
  const onChangeTimes = useCallback((val: number) => setTimes(val), []);
  const onChangeIsShowResult = useCallback((val: boolean) => setIsShowResult(val), []);
  
  const changePlay = useCallback(async () => {
    setPlayMusic((prev) => !prev);
    if (!playMusic) {
      audioRef.current?.play().catch(() => {});
    } else {
      audioRef.current?.pause();
    }
  }, [playMusic]);

  const closeWebviewShow = useCallback(() => {
    closeWebview();
    closeWebViewPage();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLang(langM.en);
      setLanguage('en');
      setPosition('0');
      setPosition2('0');
      const uidRes = await setUidToken(props.location?.query || {});
      await RunOnStart(uidRes);
      setDocumentTitle(langM.en?.pageTitle || '');
    };
    init();
  }, [props.location, RunOnStart]);

  // ---------- 🚀 提取并封装 Next Image 的判断逻辑 ----------
  const renderItemImage = (imgSrc: string | StaticImageData, isScale: boolean = false) => {
    const isFragment = typeof imgSrc === 'string' ? imgSrc.includes('egg_fragment') : false;
    return (
      <Image 
        src={imgSrc} 
        alt="item" 
        style={{ transform: isScale && isFragment ? 'scale(0.75)' : '' }}
        placeholder="blur" 
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+"
      />
    );
  };

  // ---------- 辅助渲染组件 ----------
  const jackPotHeaderComp = () => (
    <div className={styles['jackpot-main-wrap']}>
      <div className={styles['jackpot-rank-main']}>
        <Image className={styles['jackpot-pic']} src={jackpotPng} alt="jackpot" priority />
        <div className={styles['jackpot-rank']}>
          <div className={styles['avatar']}></div>
          <div className={styles['desc']} onClick={() => onChangeFuncState(5)}>
            {lang.jackPotRankTitle}
          </div>
        </div>
      </div>
      <div className={styles['jackpot-right']}>
        <div className={styles['jackpot-rule-main']} onClick={() => onChangeFuncState(4)}></div>
        <div className={styles['jackpot-count-main']}>
          <div className={styles['jackpot-gift']}>
            <div className={styles['bubble']}></div>
            {bigPrizeImage && <Image className={styles['gift']} src={egg5Png} alt="grand prize" priority />}
          </div>
          <div className={styles['jackpot-count']}>
            <div className={styles['title']} dangerouslySetInnerHTML={{ __html: lang.jackPotPro }}></div>
            <div className={styles['count']}>{prob}%</div>
          </div>
        </div>
        <div className={styles['jackpot-close-main']} onClick={closeWebviewShow}></div>
      </div>
    </div>
  );

  const gashaponContentMainComp = () => (
    <div className={styles['gashapon-content-wrap']}>
      {handFirstShow && <div className={styles['hand']}></div>}
      <div className={styles['pool-mode-main']}>
        <div className={styles['pool-mode']}>
          <div className={styles['pool-active']} style={{ backgroundPosition: `${position} center` }}></div>
          <div className={styles['pool-txt']}>
            <div className={styles['low-pool']} onClick={() => changePoolLevel(1, false)}>{lang.poolL}</div>
            <div className={styles['hight-pool']} onClick={() => changePoolLevel(2, false)}>{lang.poolH}</div>
          </div>
        </div>
      </div>
      <div className={styles['gashapon-machine']}>
        <div className={styles['gashapon-rule']} onClick={() => onChangeFuncState(2)}>{lang.rule}</div>
        <div className={styles['gashapon-shop']} onClick={() => onChangeFuncState(3)}><span>{lang.shop}</span></div>
        <div className={styles['gashapon-reward']} onClick={() => onChangeFuncState(6)}>{lang.goodsList}</div>
        <div className={styles['gold-record-box']}>
          <div className={styles['gashapon-gold']}>
            <div className={styles['gold-main']}>
              <div className={styles['gold-box']}>
                <div className={styles['gold-pic']}></div>
                <div className={styles['gold-num']}>{userGold}</div>
              </div>
              <div className={styles['gold-add']} onClick={jumpToWallet}></div>
            </div>
          </div>
          <div className={styles['gashapon-record']} onClick={() => onChangeFuncState(1)}>{lang.record}</div>
        </div>
        <div
          className={`${styles['gashapon-10']} ${times === 10 ? styles['gashapon-prize-active'] : ''}`}
          onClick={() => onChangeTimes(10)}
        >
          {lang.ten}<br />
          <span>
            ({poolLevel === 1 ? 10 * 10 : 10 * 100}
            <Image src={'/images/gashapon/gold.png'} alt="gold" width={20} height={20} style={{ display: 'inline-block', verticalAlign: 'middle' }} />)
          </span>
        </div>
        <div
          className={`${styles['gashapon-50']} ${times === 50 ? styles['gashapon-prize-active'] : ''}`}
          onClick={() => onChangeTimes(50)}
        >
          {lang.fifty}<br />
          <span>
            ({poolLevel === 1 ? 50 * 10 : 50 * 100}
            <Image src={'/images/gashapon/gold.png'} alt="gold" width={20} height={20} style={{ display: 'inline-block', verticalAlign: 'middle' }} />)
          </span>
        </div>
        <div className={styles['gashapon-egg']}>
          <div className={`${styles['egg']} ${styles[eggColor]} ${isFall ? styles['egg-ani'] : ''} ${isShake ? styles['egg-shake-ani'] : ''}`}></div>
        </div>
        <div className={`${styles['gashapon-switch']} ${isSwitch ? styles['switch-ani'] : ''}`} onClick={onSwitch}></div>
      </div>
      <div
        className={`${styles['gashapon-egg-list']} ${poolLevel === 1 ? styles['egg-fade'] : ''}`}
        style={{ display: poolLevel === 1 ? 'block' : 'none' }}
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`${styles[`egg-item${String(i + 1).padStart(2, '0')}`]} ${isStart ? styles[`egg${i + 1}-ani`] : ''}`}></div>
        ))}
      </div>
      <div
        className={`${styles['gashapon-egg-list']} ${poolLevel === 2 ? styles['egg-fade'] : ''}`}
        style={{ display: poolLevel === 2 ? 'block' : 'none' }}
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`${styles['egg-item']}${String(i + 1).padStart(3, '0')} ${isStart ? styles[`egg${i + 1}-ani`] : ''}`}></div>
        ))}
      </div>
      <div className={`${styles['gashapon-bar']} ${isSwitch ? styles['bar-ani'] : ''}`}></div>
    </div>
  );

  const popUpTitleComp = () => {
    const titles: Record<number, string> = {
      1: lang.record,
      2: lang.rule,
      3: lang.shop,
      4: lang.bigPrizeRule,
      5: lang.rank,
      6: lang.goodsList,
    };
    return <div className={styles['gashapon-reminder-title']}>{titles[funcState] || ''}</div>;
  };

  const recordComp = () => (
    <div className={styles['record-content-main']}>
      <div className={styles['record-tab']}>
        <div className={`${styles['record-lottery']} ${recordState === 1 ? styles['record-active'] : ''}`} onClick={() => onChangeRecord(1)}>{lang.cjRc}</div>
        <div className={`${styles['record-exchange']} ${recordState === 2 ? styles['record-active'] : ''}`} onClick={() => onChangeRecord(2)}>{lang.exRc}</div>
      </div>
      <div className={styles['record-content']} style={{ display: recordState === 1 ? 'block' : 'none' }}>
        {historyList.map((item, index) => (
          <div className={styles['record-item']} key={index}>
            <div className={styles['record-time']}>
              <div className={styles['time']}>{unix2date6(item.ts, false)}</div>
              {item.ptype === 1 ? <div className={styles['modeL']}>({lang.poolL})</div> : <div className={styles['modeH']}>({lang.poolH})</div>}
            </div>
            <div className={styles['record-table']}>
              <div className={styles['re-td']}>
                <div className={styles['record-desc']}>{lang.goods}</div>
                <div className={styles['h']}></div>
                <div className={styles['record-count']}>{lang.count}</div>
              </div>
              {item.bigResult.isBetBig && item.bigResult.image && (
                <div className={styles['re-td-big']}>
                  <div className={styles['record-prize']}>
                    <div className={styles['circle']}></div>
                    <Image src={item.bigResult.image} alt="prize" />
                  </div>
                  <div className={styles['h']}></div>
                  <div className={styles['record-prize-num']}>1</div>
                </div>
              )}
              {item.list.map((subItem, idx) => (
                <div className={styles['re-td']} key={idx}>
                  <div className={styles['record-pic']}>
                    {renderItemImage(subItem.image, true)}
                  </div>
                  <div className={styles['h']}></div>
                  <div className={styles['record-num']}>{subItem.winNum}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {isMore ? (
          <div className={styles['more']} onClick={() => getMore(1)}>
            {lang.seeMore}
            {moreloading && (
              <div className={styles['moreloading']}><Image src="/images/gashapon/loading.gif" alt="loading" width={16} height={16} /></div>
            )}
          </div>
        ) : (
          <div className={styles['noMore']}>{lang.noMore}</div>
        )}
      </div>
      <div className={styles['record-content']} style={{ display: recordState === 2 ? 'block' : 'none' }}>
        {exchangeRecordList.map((item, index) => (
          <div className={styles['record-item']} key={index}>
            <div className={styles['record-time']}><div className={styles['time']}>{unix2date6(item.ts, false)}</div></div>
            <div className={styles['record-table']}>
              <div className={styles['re-td']}>
                <div className={styles['record-desc']}>{lang.gf}</div>
                <div className={styles['h']}></div>
                <div className={styles['record-count']}>{lang.count}</div>
              </div>
              <div className={styles['re-td']}>
                <div className={styles['record-pic']}>
                  {renderItemImage(item.image, true)}
                </div>
                <div className={styles['h']}></div>
                <div className={styles['record-num']}>{item.count}</div>
              </div>
            </div>
          </div>
        ))}
        {isExMore ? (
          <div className={styles['more']} onClick={() => getMore(2)}>
            {lang.seeMore}
            {moreloading && (
              <div className={styles['moreloading']}><Image src="/images/gashapon/loading.gif" alt="loading" width={16} height={16} /></div>
            )}
          </div>
        ) : (
          <div className={styles['noMore']}>{lang.noMore}</div>
        )}
      </div>
    </div>
  );

  const ruleComp = () => (
    <div className={styles['rule-content-main']} style={{ display: funcState === 2 ? 'block' : 'none' }}>
      <div className={styles['rule-box']} dangerouslySetInnerHTML={{ __html: lang.ruleTxt }}></div>
    </div>
  );

  const shopComp = () => (
    <div className={styles['fragement-content-main']} style={{ display: funcState === 3 ? 'block' : 'none' }}>
      <div className={styles['fra-top']}>
        <div className={styles['fra-banner']}>
          <div className={styles['fra-img']}></div>
          <div className={styles['fra-desc']}>
            {lang.fra}：
            {chip === -1 ? <Image src="/images/gashapon/loading.gif" alt="loading" width={16} height={16} style={{ display: 'inline' }} /> : chip}
          </div>
        </div>
      </div>
      <div className={styles['fra-content']}>
        {shopList.map((item) => (
          <div className={styles['fra-item']} key={item.itemId} onClick={() => isShowShop(1, item.image, item.eggShopid, item.price)}>
            <div className={styles['fra-box']}>
              <div className={styles['bubble']}></div>
              <div className={styles['gift']}><Image src={item.image} alt="goods" /></div>
              <div className={styles['shadow']}></div>
            </div>
            <div className={styles['fra-exchange']}>
              <div className={styles['fra-pic']}></div>
              <div className={styles['fra-num']}>{item.price}</div>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`fra-reminder ${shopReminder !== 0 ? 'bounceAni' : ''}`}
        style={{ display: shopReminder !== 0 ? 'flex' : 'none' }}
      >
        <div className={styles['fra-rm-pic']}>{shopGiftImage && <Image src={shopGiftImage} alt="gift to exchange" />}</div>
        <div className={styles['desc']}><span>{lang.isExchange}</span></div>
        <div className={styles['fra-comfirm']}>
          <div className={styles['no']} onClick={() => isShowShop(0, '', 0, 0)}>{lang.no}</div>
          <div className={styles['h']}></div>
          <div className={styles['yes']} onClick={() => exchangeGift()}>{lang.yes}</div>
        </div>
      </div>
    </div>
  );

  const prizeRuleComp = () => (
    <div className={styles['rule-big-prize-main']} style={{ display: funcState === 4 ? 'block' : 'none' }}>
      <div className={styles['prize-rule-box']} dangerouslySetInnerHTML={{ __html: lang.prizeRuleTxt }}></div>
    </div>
  );

  const prizePopUpComp = () => {
    const show = isBigPrize && isBigPrizeMain;
    return (
      <div
        className={styles['big-prize-tip']}
        style={{ display: show ? 'block' : 'none' }}
        onClick={() => { setIsBigPrize(false); setIsBigPrizeMain(false); }}
      >
        <div className={styles['big-prize-pic']}>
          <div className={styles['circle']}><Image src={lightPng} alt="light" /></div>
          <div className={styles['prize-img']}>{bigPrizeImage && <Image src={egg5Png} alt="big prize" />}</div>
        </div>
        <div className={styles['big-prize-desc']}>{lang.congratulate}</div>
      </div>
    );
  };

  return (
    <div className={`${styles['gashapon-main-wrap']} ${language === 'ar' ? styles['gashapon-ar'] : ''}`}>
      <div className={`${styles['play-icon']} ${playMusic ? styles['play-circle'] : ''}`} onClick={changePlay}>
        <Image src={playMusic ? musicOn : musicOff} alt="music icon" />
      </div>
      <audio loop autoPlay src="/images/gashapon/bg.mp3" ref={audioRef}></audio>
      <audio src="/images/gashapon/music.mp3" ref={audioRef2}></audio>
      
      {loadGif && <Loading />}
      {loadingPopUp && <Loading delay={200} />}
      <ToastColor color={popUpColor} ref={toastRef} toastContent={popUpTips} />

      <div className={styles['disable-mask']} style={{ display: isLoading ? 'block' : 'none' }}></div>

      {jackPotHeaderComp()}
      {gashaponContentMainComp()}

      <div
        className={`${styles['gashapon-reminder']} ${funcState !== 0 ? styles['bounceAni'] : ''}`}
        style={{ display: funcState !== 0 ? 'block' : 'none' }}
      >
        <div className={styles['close']} onClick={() => onChangeFuncState(0)}></div>
        {popUpTitleComp()}
        {funcState === 1 && recordComp()}
        {funcState === 2 && ruleComp()}
        {funcState === 3 && shopComp()}
        {funcState === 4 && prizeRuleComp()}
        <RewardView
          funcState={funcState}
          position2={position2}
          lang={lang}
          poolLevelShow={poolLevelShow}
          normalList={normalList}
          deluxeList={deluxeList}
          changePoolLevel={(val: number, bool: boolean) => changePoolLevel(val, bool)}
        />
      </div>
      
      <RankView funcState={funcState} rankingList={rankingList} prizeImage={bigPrizeImage} />
      <ResultPopUp lang={lang} isShowResult={isShowResult} onChangeIsShowResult={() => onChangeIsShowResult(false)} resultList={resultList} />
      {prizePopUpComp()}

      <div className={styles['gashapon-mask']} style={{ display: funcState !== 0 || isShowResult ? 'block' : 'none' }}></div>
    </div>
  );
};

export default Gashapon;