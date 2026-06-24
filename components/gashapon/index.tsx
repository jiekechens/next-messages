import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image';
import langM from './lang';
import ResultPopUp from './ResultPopUp';
import RewardView from './RewardView';
import ToastColor from './ToastColor';
import RankView from './RankView';
import Loading from './Loading';

import lightPng from '../../public/images/gashapon/light.png';
import musicOn from '../../public/images/gashapon/music_2.png';
import musicOff from '../../public/images/gashapon/music_1.png';
import jackpotPng from '../../public/images/gashapon/jackpot.png';
import egg5Png from '../../public/images/gashapon/egg5.png';

// ==================== 类型定义 ====================
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

// ==================== 模拟函数（保持不变） ====================
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

// ==================== 假数据（保持不变） ====================
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

// ==================== 组件 ====================
const Gashapon: React.FC<GashaponProps> = (props) => {
  // ---------- 状态（保持不变） ----------
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

  // ---------- 函数实现（保持不变） ----------
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
        audioRef2.current.play().catch(() => { });
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
        audioRef.current.play().catch(() => { });
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
      setPosition(val === 1 ? '0%' : '100%');    // 0% → 低池，100% → 高池
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
      audioRef.current?.play().catch(() => { });
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

  // ---------- 辅助渲染函数 ----------
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

  // ==================== 子组件定义（全部使用 em 单位） ====================
  const jackPotHeaderComp = () => (
    <div className="w-full h-[1.28em] bg-gradient-to-b from-[#402BF9] via-[#5C0DF8] to-[#007BE1] flex justify-between items-center">
      <div className="flex flex-col ml-[0.32em]">
        <Image className="w-[1.53em] h-[0.4em]" src={jackpotPng} alt="jackpot" priority />
        <div className="h-[0.4em] leading-[0.4em] flex bg-[rgba(34,26,169,0.61)] rounded-[0.2em] text-center mt-[0.11em]">
          <div className="w-[0.4em] h-[0.4em] rounded-full"></div>
          <div className="text-[0.2em] text-[#F5E78B] mx-[0.06em] px-[0.08em]" onClick={() => onChangeFuncState(5)}>
            {lang.jackPotRankTitle}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-[0.96em] h-[0.96em] relative mx-[0.12em]">
            <div className="w-[0.96em] h-[0.96em] absolute top-0 left-0 bg-[url('/images/gashapon/bubble.png')] bg-cover z-10"></div>
            {bigPrizeImage && <Image className="w-[0.7em] h-[0.7em] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] rounded-full z-20" src={egg5Png} alt="grand prize" priority />}
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[#F5E78B] text-[0.2em] mb-[0.1em] text-center" dangerouslySetInnerHTML={{ __html: lang.jackPotPro }}></div>
            <div className="flex justify-center items-center w-[1.4em] h-[0.44em] rounded-[0.11em] border border-[#43DFFF] bg-gradient-to-t from-[#402BF9] via-[#5C0DF8] to-[#007BE1] tracking-[0.1em] text-[#F5E78B] font-black text-[0.28em] font-sans">
              {prob}%
            </div>
          </div>
        </div>
        <div className="w-[0.42em] h-[0.42em] bg-[url('/images/gashapon/question.png')] bg-cover mx-[0.1em]" onClick={() => onChangeFuncState(4)}></div>
        <div className="w-[0.5em] h-[0.5em] bg-[url('/images/gashapon/close.png')] bg-cover mx-[0.2em]" onClick={closeWebviewShow}></div>
      </div>
    </div>
  );

  const gashaponContentMainComp = () => (
    <div className="w-full h-[9.8em] bg-[url('/images/gashapon/bg.png')] bg-cover overflow-hidden relative">
      {handFirstShow && <div className="w-[1em] h-[1em] absolute bottom-[-0.2em] right-[1.2em] bg-[url('/images/gashapon/hand.png')] bg-cover z-[5] animate-[hand_1s_linear_infinite_alternate]"></div>}
      <div className="w-full h-[1.2em] flex justify-center items-center">
        {/* 池子模式选择器 */}
        <div className="w-full h-[3em] flex justify-center items-center">
          <div className="relative w-[10.75em] h-[1.95em] text-[0.3em] font-adobe">

            {/* 大背景图（pool_bg.png） */}
            <Image
              src="/images/gashapon/pool_bg.png"
              alt="池子背景"
              width={430 * 2.5}
              height={78 * 2.5}
              className="absolute inset-0 w-full h-full"
            />

            {/* 激活滑块（pool_active.png），宽度为容器一半 */}
            <Image
              src="/images/gashapon/pool_active.png"
              alt="激活滑块"
              width={221 * 2.5}
              height={79 * 2.5}
              className="absolute top-0 left-0 h-full w-1/2 transition-all duration-200"
              style={{ transform: `translateX(${position})` }}
            />

            {/* 文字（低池 / 高池） */}
            <div className="absolute inset-0 flex">
              <div
                className={`w-1/2 flex items-center justify-center cursor-pointer ${poolLevel === 2 ? 'text-yellow-300' : 'text-white'}`}
                onClick={() => changePoolLevel(1, false)}
              >
                {lang.poolL}
              </div>
              <div
                className={`w-1/2 flex items-center justify-center cursor-pointer ${poolLevel === 1 ? 'text-yellow-300' : 'text-white'}`}
                onClick={() => changePoolLevel(2, false)}
              >
                {lang.poolH}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-[8.54em] bg-[url('/images/gashapon/gashapon.png')] bg-cover relative z-[2]">
        <div className="w-[3.525em] h-[1.65em] bg-[url('/images/gashapon/rule.png')] bg-cover absolute top-[0.28em] right-[-0.2em] flex justify-center items-center text-center text-[0.28em] text-white" onClick={() => onChangeFuncState(2)}>{lang.rule}</div>
        <div className="w-[0.91em] h-[1.11em] bg-[url('/images/gashapon/shop.png')] bg-cover absolute top-[1.2em] right-0 text-center text-white">
          <span className="text-[0.24em] block w-full absolute bottom-[0.1em] left-1/2 -translate-x-1/2" onClick={() => onChangeFuncState(3)}>{lang.shop}</span>
        </div>
        <div className="h-[0.5em] leading-[0.5em] text-[0.28em] text-white absolute bottom-[35%] left-1/2 -translate-x-1/2 text-shadow-[0_0_0.1em_yellow]" onClick={() => onChangeFuncState(6)}>{lang.goodsList}</div>
        <div className="w-[84%] h-[0.71em] absolute bottom-[1.74em] left-1/2 -translate-x-1/2 flex justify-between items-center">
          <div className="w-[2.71em] h-[0.71em] bg-[url('/images/gashapon/gold_bg.png')] bg-cover flex justify-center items-center">
            <div className="w-full flex justify-between items-center px-3">
              <div className="flex justify-between items-center">
                <div className="w-[0.4em] h-[0.4em] bg-[url('/images/gashapon/gold.png')] bg-cover"></div>
                <div className=" text-[0.26em] text-white  font-adobe truncate mx-1">{userGold}</div>
              </div>
              <div className="w-[0.38em] h-[0.38em] bg-[url('/images/gashapon/add.png')] bg-cover" onClick={jumpToWallet}></div>
            </div>
          </div>
          <div className="w-[4.275em] h-[1.775em] bg-[url('/images/gashapon/record.png')] bg-cover flex justify-center items-center text-white text-[0.28em]" onClick={() => onChangeFuncState(1)}>{lang.record}</div>

        </div>
        {/* 10 次按钮 */}
        <div
          className={`w-[1.98em] h-[0.69em] bg-cover flex flex-col justify-center items-center text-[0.28em] text-white absolute bottom-[10.5%] left-[33%] leading-[0.3em] ${times === 10 ? "bg-[url('/images/gashapon/prize_active.png')] text-shadow-[0_0_0.1em_red] animate-[beBig1_0.4s_linear]" : "bg-[url('/images/gashapon/prize_default.png')] text-shadow-[0_0_0.1em_#0061D3]"}`}
          onClick={() => onChangeTimes(10)}
        >
          {lang.ten}<br />
          <span className="text-[0.19em] flex justify-center items-center">
            ({poolLevel === 1 ? 100 : 1000}
            <Image src={'/images/gashapon/gold.png'} alt="gold" width={20} height={20} className="inline-block align-middle w-[0.2em] h-[0.2em]" />)
          </span>
        </div>
        {/* 50 次按钮 */}
        <div
          className={`w-[1.98em] h-[0.69em] bg-cover flex flex-col justify-center items-center text-[0.28em] text-white absolute bottom-[1.5%] left-[33%] leading-[0.3em] ${times === 50 ? "bg-[url('/images/gashapon/prize_active.png')] text-shadow-[0_0_0.1em_red] animate-[beBig1_0.4s_linear]" : "bg-[url('/images/gashapon/prize_default.png')] text-shadow-[0_0_0.1em_#0061D3]"}`}
          onClick={() => onChangeTimes(50)}
        >
          {lang.fifty}<br />
          <span className="text-[0.19em] flex justify-center items-center">
            ({poolLevel === 1 ? 500 : 5000}
            <Image src={'/images/gashapon/gold.png'} alt="gold" width={20} height={20} className="inline-block align-middle w-[0.2em] h-[0.2em]" />)
          </span>
        </div>
        <div className="w-[1.1em] h-[1.1em] absolute bottom-[3.5%] left-[14.2%] rounded-full overflow-hidden">
          <div className={`w-[1.1em] h-[1.1em] bg-no-repeat bg-cover -translate-y-[2em] ${eggColor === 'egg-gold' ? "bg-[url('/images/gashapon/egg.png')]" : eggColor === 'egg-purple' ? "bg-[url('/images/gashapon/egg5.png')]" : "bg-[url('/images/gashapon/egg2.png')]"} ${isFall ? 'animate-[eggFall_1s_ease-in-out_forwards]' : ''} ${isShake ? 'animate-[shake_0.2s_4_ease-in_alternate_forwards]' : ''}`}></div>
        </div>
        <div className={`w-[1.08em] h-[1.08em] bg-[url('/images/gashapon/switch.png')] bg-cover absolute bottom-[-0.2%] right-[20.9%] rounded-full ${isSwitch ? 'animate-[switchAnim_1s_1_ease-in-out_alternate]' : 'animate-[heartBeat_1s_infinite_alternate]'}`} onClick={onSwitch}></div>
      </div>
      {/* 蛋列表 1 */}
      <div className={`w-[3.8em] h-[3.8em] absolute top-[20%] left-1/2 -translate-x-1/2 ${poolLevel === 1 ? 'animate-[fade_0.5s_linear]' : 'hidden'}`}>
        {[
          { bg: '/images/gashapon/egg3.png', pos: 'bottom-[0.1em] left-[0.7em] z-[2] rotate-[10deg] scale-110' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[-0.1em] left-[1.4em] z-[3] rotate-[-10deg] scale-110' },
          { bg: '/images/gashapon/egg5.png', pos: 'bottom-0 right-[0.5em] z-[4] rotate-0 scale-110' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[0.6em] left-[0.3em] z-[5]' },
          { bg: '/images/gashapon/egg2.png', pos: 'bottom-[0.8em] left-[1em] z-[2] rotate-0 scale-105' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[0.75em] left-[1.85em] z-[2] rotate-0 scale-110' },
          { bg: '/images/gashapon/egg2.png', pos: 'bottom-[0.75em] right-0 z-[3]' },
          { bg: '/images/gashapon/egg4.png', pos: 'bottom-[1.1em] left-[0.2em] z-[2] rotate-[50deg] scale-100' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[1.4em] left-[1.1em] z-[1] rotate-[80deg] scale-120' },
          { bg: '/images/gashapon/egg4.png', pos: 'bottom-[1.2em] left-[2.1em] z-[0] rotate-[40deg] scale-110' },
        ].map((item, i) => (
          <div key={i} className={`w-[1.06em] h-[1.06em] bg-no-repeat bg-cover absolute ${item.pos} ${isStart ? `animate-[move${i + 1}_0.7s_infinite_linear]` : ''}`} style={{ backgroundImage: `url(${item.bg})` }}></div>
        ))}
      </div>
      {/* 蛋列表 2 */}
      <div className={`w-[3.8em] h-[3.8em] absolute top-[39%] left-1/2 -translate-x-1/2 ${poolLevel === 2 ? 'animate-[fade_0.5s_linear]' : 'hidden'}`}>
        {[
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[0.1em] left-[0.7em] z-[2] rotate-[30deg] scale-110' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[-0.1em] left-[1.4em] z-[3] rotate-[10deg] scale-110' },
          { bg: '/images/gashapon/egg5.png', pos: 'bottom-0 right-[0.75em] z-[4] rotate-[-30deg] scale-115' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[0.6em] left-[0.3em] z-[5] rotate-[-30deg] scale-115' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[0.8em] left-[1em] z-[2] rotate-[-50deg] scale-105' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[0.75em] left-[1.85em] z-[2] rotate-[50deg] scale-110' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[0.75em] right-0 z-[3] rotate-[40deg] scale-120' },
          { bg: '/images/gashapon/egg2.png', pos: 'bottom-[1.1em] left-[0.2em] z-[2] rotate-[150deg] scale-100' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[1.4em] left-[1.1em] z-[1] rotate-[80deg] scale-110' },
          { bg: '/images/gashapon/egg.png', pos: 'bottom-[1.3em] left-[2.1em] z-[0] rotate-[160deg] scale-120' },
        ].map((item, i) => (
          <div key={i} className={`w-[1.06em] h-[1.06em] bg-no-repeat bg-cover absolute ${item.pos} ${isStart ? `animate-[move${i + 1}_0.7s_infinite_linear]` : ''}`} style={{ backgroundImage: `url(${item.bg})` }}></div>
        ))}
      </div>
      <div className={`w-[0.57em] h-[1.07em] bg-[url('/images/gashapon/bar.png')] bg-cover absolute bottom-[32%] right-[9%] z-[1] rotate-[5deg] origin-[10%_90%] ${isSwitch ? 'animate-[switch2_1s_linear]' : ''}`} style={{ animationDelay: '1s' }}></div>
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
    return <div className="absolute top-[-1em] left-1/2 -translate-x-1/2 w-[4.18em] h-[1.73em] bg-[url('/images/gashapon/title.png')] bg-cover text-white text-[0.29em] text-center leading-[2.1em] text-shadow-[0_0_0.1em_#513DDC]">{titles[funcState] || ''}</div>;
  };

  const recordComp = () => (
    <div className="px-[0.3em] pt-[0.7em] pb-0">
      <div className="flex justify-around items-center w-full h-[0.5em] text-[0.2em] mb-[0.1em]">
        <div
          className={`w-[40%] h-full flex justify-center items-center text-white bg-[rgba(0,0,0,0.3)] rounded-[0.1em] bg-cover bg-[120%] bg-center ${recordState === 1 ? "bg-[url('/images/gashapon/prize_active.png')]" : "bg-[url('/images/gashapon/prize_default.png')]"}`}
          onClick={() => onChangeRecord(1)}
        >
          {lang.cjRc}
        </div>
        <div
          className={`w-[40%] h-full flex justify-center items-center text-white bg-[rgba(0,0,0,0.3)] rounded-[0.1em] bg-cover bg-[120%] bg-center ${recordState === 2 ? "bg-[url('/images/gashapon/prize_active.png')]" : "bg-[url('/images/gashapon/prize_default.png')]"}`}
          onClick={() => onChangeRecord(2)}
        >
          {lang.exRc}
        </div>
      </div>
      <div className="h-[4.2em] overflow-y-scroll scrollbar-none">
        {historyList.map((item, index) => (
          <div key={index} className="flex flex-col mt-[0.2em] first:mt-0">
            <div className="text-[#9280FF] my-[0.14em] text-center flex justify-center items-center">
              <div className="text-[0.22em] pt-[0.05em]">{unix2date6(item.ts, false)}</div>
              {item.ptype === 1 ? <div className="flex justify-center items-center mx-[0.1em] text-[0.2em] text-[#ddd]">({lang.poolL})</div> : <div className="flex justify-center items-center mx-[0.1em] text-[0.2em] text-yellow-300">({lang.poolH})</div>}
            </div>
            <div className="[&_.re-td]:h-[0.8em] [&_.re-td]:flex [&_.re-td]:justify-around [&_.re-td]:items-center [&_.re-td]:border-[0.015em] [&_.re-td]:border-[#7533EC]">
              <div className="re-td h-[0.6em] bg-[#5512D0] rounded-tl-[0.15em] rounded-tr-[0.15em]">
                <div className="flex-1 text-center text-[0.24em] text-white">{lang.goods}</div>
                <div className="w-[0.015em] h-full bg-[#7533EC]"></div>
                <div className="flex-1 text-center text-[0.24em] text-white">{lang.count}</div>
              </div>
              {item.bigResult.isBetBig && item.bigResult.image && (
                <div className="re-td-big h-[0.9em] bg-[rgba(0,0,0,0.3)] flex justify-around items-center border-[0.015em] border-[#7533EC]">
                  <div className="flex-1 flex justify-center items-center relative">
                    <div className="w-[1em] h-[1em] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[url('/images/gashapon/circle.png')] bg-cover animate-[highLight_10s_linear_infinite]"></div>
                    <Image src={item.bigResult.image} alt="prize" className="w-[0.58em] h-[0.58em] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]" />
                  </div>
                  <div className="w-[0.015em] h-full bg-[#7533EC]"></div>
                  <div className="flex-1 text-center text-[0.24em] text-[#F5E78B] font-bold">1</div>
                </div>
              )}
              {item.list.map((subItem, idx) => (
                <div key={idx} className="re-td flex justify-around items-center border-[0.015em] border-[#7533EC]">
                  <div className="flex-1 flex justify-center items-center">
                    {renderItemImage(subItem.image, true)}
                  </div>
                  <div className="w-[0.015em] h-full bg-[#7533EC]"></div>
                  <div className="flex-1 text-center text-[0.28em] text-white">{subItem.winNum}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {isMore ? (
          <div className="flex justify-center items-center text-[0.24em] text-white pt-[0.2em]" onClick={() => getMore(1)}>
            {lang.seeMore}
            {moreloading && <div className="ml-[0.03em] mt-[0.05em]"><Image src="/images/gashapon/loading.gif" alt="loading" width={16} height={16} className="w-[0.25em] h-[0.25em]" /></div>}
          </div>
        ) : (
          <div className="text-[0.2em] text-center text-[#aaa] mt-[0.2em]">{lang.noMore}</div>
        )}
      </div>
    </div>
  );

  const ruleComp = () => (
    <div className="px-[0.3em] pt-[0.7em] text-[0.24em] text-white leading-[0.48em]" style={{ display: funcState === 2 ? 'block' : 'none' }}>
      <div className="h-[4.8em] overflow-y-scroll" dangerouslySetInnerHTML={{ __html: lang.ruleTxt }}></div>
    </div>
  );

  const shopComp = () => (
    <div className="px-[0.3em] pt-[0.7em]" style={{ display: funcState === 3 ? 'block' : 'none' }}>
      <div className="flex justify-center items-center bg-[url('/images/gashapon/banner.png')] bg-cover">
        <div className="w-[3.08em] h-[0.52em] text-[#F5E78B] flex justify-center items-center py-[0.05em] text-center">
          <div className="w-[0.41em] h-[0.41em] bg-[url('/images/gashapon/fragment.png')] bg-cover"></div>
          <div className="mx-[0.1em] text-[0.26em] flex justify-center items-center">
            {lang.fra}：
            {chip === -1 ? <Image src="/images/gashapon/loading.gif" alt="loading" width={16} height={16} className="w-[0.3em] h-[0.3em] inline" /> : chip}
          </div>
        </div>
      </div>
      <div className="h-[4em] mt-[0.2em] overflow-y-scroll flex justify-around flex-wrap">
        {shopList.map((item) => (
          <div key={item.itemId} className="w-[1.48em] h-[1.9em] rounded-[0.1em] border-[0.01em] border-[#7058F9] bg-[#5512D0] m-[0.2em] flex flex-col" onClick={() => isShowShop(1, item.image, item.eggShopid, item.price)}>
            <div className="w-[1.48em] h-[1.48em] relative flex-8">
              <div className="w-[1em] h-[1em] bg-[url('/images/gashapon/bubble.png')] bg-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] animate-[updone_1s_linear_infinite_alternate]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] animate-[updone_1s_linear_infinite_alternate]">
                <Image src={item.image} alt="goods" className="w-[0.6em] h-[0.6em]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[0.08em] w-[0.8em] h-[0.22em] bg-[#3a0796] rounded-full"></div>
            </div>
            <div className="flex justify-center items-center text-[0.28em] text-[#F5E78B] h-[0.42em] bg-[#4104B0] rounded-b-[0.1em]">
              <div className="w-[0.3em] h-[0.3em] bg-[url('/images/gashapon/fragment.png')] bg-cover mt-[0.05em]"></div>
              <div className="mx-[0.05em]">{item.price}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3.5em] bg-[rgba(0,0,0,0.6)] rounded-[0.1em] z-[901] flex flex-col border-[0.02em] border-[#7E5EFD] ${shopReminder !== 0 ? 'animate-[beBig2_0.4s_linear]' : ''}`} style={{ display: shopReminder !== 0 ? 'flex' : 'none' }}>
        <div className="w-full h-[2.5em] relative flex-9 my-[0.2em] mt-[0.3em]">
          {shopGiftImage && <Image src={shopGiftImage} alt="gift to exchange" className="w-[1.5em] h-[1.5em] mx-auto" />}
        </div>
        <div className="w-[90%] mx-auto py-[0.2em] text-center text-white text-[0.21em]">{lang.isExchange}</div>
        <div className="flex justify-around items-center text-center w-full bg-[#5512D0] rounded-b-[0.1em] h-[0.5em] text-white">
          <div className="flex-1 flex justify-center items-center h-[0.5em] border-t-[0.01em] border-[#7E5EFD] text-[0.22em]" onClick={() => isShowShop(0, '', 0, 0)}>{lang.no}</div>
          <div className="w-[0.02em] h-[0.5em] bg-[#7E5EFD]"></div>
          <div className="flex-1 flex justify-center items-center h-[0.5em] border-t-[0.01em] border-[#7E5EFD] text-[0.22em]" onClick={() => exchangeGift()}>{lang.yes}</div>
        </div>
      </div>
    </div>
  );

  const prizeRuleComp = () => (
    <div className="px-[0.3em] pt-[0.7em] text-[0.24em] text-white leading-[0.48em]" style={{ display: funcState === 4 ? 'block' : 'none' }}>
      <div className="h-[5em] overflow-y-scroll" dangerouslySetInnerHTML={{ __html: lang.prizeRuleTxt }}></div>
    </div>
  );

  const prizePopUpComp = () => {
    const show = isBigPrize && isBigPrizeMain;
    return (
      <div
        className="w-full h-full bg-[rgba(0,0,0,0.3)] absolute top-0 left-0 z-[9999] flex items-center justify-center"
        style={{ display: show ? 'flex' : 'none' }}
        onClick={() => { setIsBigPrize(false); setIsBigPrizeMain(false); }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-[5em] h-[5em] absolute animate-[highLight_8s_linear_infinite]">
            <Image src={lightPng} alt="light" className="w-full h-full" />
          </div>
          <div className="w-[2.5em] h-[2.5em] absolute z-10">
            {bigPrizeImage && <Image src={egg5Png} alt="big prize" className="w-full h-full" />}
          </div>
        </div>
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-white text-[0.7em] text-shadow-[0_0_0.1em_yellow]">{lang.congratulate}</div>
      </div>
    );
  };

  // ==================== 最终渲染 ====================
  return (
    <div className={`w-full relative overflow-hidden ${language === 'ar' ? 'rtl' : ''}`} style={{ fontSize: 'clamp(50px, 10vw, 100px)' }}>
      <div className={`${playMusic ? 'animate-[xz_10s_linear_infinite]' : ''} absolute right-[3%] top-[15%] z-10 rounded-full flex justify-center items-center`} style={{ boxShadow: '0 0 0.3em 0.05em #000', width: '0.7em', height: '0.7em' }}>
        <Image src={playMusic ? musicOn : musicOff} alt="music icon" width={70} height={70} className="w-full h-full" onClick={changePlay} />
      </div>
      <audio loop autoPlay src="/images/gashapon/bg.mp3" ref={audioRef}></audio>
      <audio src="/images/gashapon/music.mp3" ref={audioRef2}></audio>

      {loadGif && <Loading />}
      {loadingPopUp && <Loading delay={200} />}
      <ToastColor color={popUpColor} ref={toastRef} toastContent={popUpTips} />

      <div className="w-full h-full bg-transparent absolute top-0 left-0 z-[999]" style={{ display: isLoading ? 'block' : 'none' }}></div>

      {jackPotHeaderComp()}
      {gashaponContentMainComp()}

      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[900] w-[5.8em] h-[5.91em] bg-[#4104B0] border-[0.06em] border-[#7E5EFD] rounded-[0.4em] ${funcState !== 0 ? 'animate-[beBig2_0.4s_linear]' : ''}`} style={{ display: funcState !== 0 ? 'block' : 'none' }}>
        <div className="w-[0.56em] h-[0.56em] bg-[url('/images/gashapon/close.png')] bg-cover absolute right-0 -top-[0.35em]" onClick={() => onChangeFuncState(0)}></div>
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

      <div className="w-full h-full bg-[rgba(0,0,0,0.64)] absolute top-0 left-0 z-[800]" style={{ display: funcState !== 0 || isShowResult ? 'block' : 'none' }}></div>

    </div>
  );
};

export default Gashapon;