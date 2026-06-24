'use client'
import React from 'react'
import Image from 'next/image'
import { StaticImageData } from 'next/image'

export interface ResultItem {
  id?: number | string
  image: string | StaticImageData
  name?: string
  winNum: number
  bubbleUrl?: string | StaticImageData
  gold?: number
}

interface ResultPopUpProps {
  isShowResult: boolean
  onChangeIsShowResult: () => void
  resultList: ResultItem[]
  lang: any
}

const ResultPopUp: React.FC<ResultPopUpProps> = ({
  isShowResult,
  onChangeIsShowResult,
  resultList,
  lang,
}) => {
  return (
    <div
      className={`
        fixed inset-0 z-[900] flex items-center justify-center
        ${isShowResult ? 'flex' : 'hidden'}
      `}
    >
      {/* 半透明遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onChangeIsShowResult}
      />

      {/* 主弹窗 */}
      <div
        className={`
          relative w-[92%] max-w-[580px] min-h-[500px]
          bg-[url('/images/gashapon/bg.png')] bg-cover bg-no-repeat
          border-2 border-[#7E5EFD] rounded-[10px]
          flex flex-col items-center justify-center
          text-white
          ${isShowResult ? 'animate-bounce-in' : ''}
        `}
      >
        {/* 描述文字 */}
        <div className="w-full text-center py-2 text-[clamp(14px,5vw,26px)]">
          {lang.rwDesc}
        </div>

        {/* 奖品列表容器 */}
        <div className="relative w-full flex justify-center">
          <div
            className="
              w-full max-w-[550px]
              bg-[url('/images/gashapon/rw_bg.png')] bg-cover bg-no-repeat
              relative overflow-visible
            "
            style={{ aspectRatio: '521 / 425' }}
          >
            <div className="flex flex-wrap justify-center items-start content-start gap-[2%] pt-[8%] pb-[10%] px-[2%]">
              {resultList.map((item, index) => {
                const imgUrl =
                  typeof item.image === 'string'
                    ? item.image
                    : item.image?.src || ''
                const isFragment = imgUrl.includes('egg_fragment')

                return (
                  <div
                    key={item.id || index}
                    className="
                      relative opacity-0
                      animate-come-in
                    "
                    style={{
                      width: '16.36%', // 90/550
                      height: '37.65%', // 160/425
                      animationDelay: `${0.5 + index * 0.5}s`,
                    }}
                  >
                    {/* 数量气泡 */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <div className="relative w-full h-full flex items-center justify-center">
                        {item.bubbleUrl && (
                          <Image
                            src={item.bubbleUrl}
                            alt="bubble"
                            width={90}
                            height={90}
                            className="w-full h-full object-contain"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+"
                          />
                        )}
                        <div className="absolute -top-[5%] -right-[5%] w-[30%] h-[30%] bg-red-500 text-white rounded-full flex items-center justify-center text-[clamp(8px,2vw,12px)]">
                          x{item.winNum}
                        </div>
                      </div>
                    </div>

                    {/* 礼物图片 */}
                    <div
                      className="absolute inset-0 z-30 flex items-center justify-center"
                      style={{
                        transform: isFragment ? 'scale(0.75)' : 'scale(0.8)',
                      }}
                    >
                      <Image
                        src={item.image}
                        alt={item.name || 'reward'}
                        width={90}
                        height={90}
                        className="w-full h-full object-contain"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+"
                      />
                    </div>

                    {/* 阴影 */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[88.89%] h-[13.75%] bg-[#3a0796] rounded-full" />

                    {/* 名称 */}
                    <div className="absolute -bottom-[25%] left-1/2 -translate-x-1/2 w-[111.11%] text-center text-[clamp(10px,3.5vw,20px)] text-white break-all leading-tight">
                      {item.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 关闭按钮 */}
        <div
          onClick={onChangeIsShowResult}
          className={`
            absolute -top-[40px] right-0
            w-[10%] max-w-[56px] aspect-square
            bg-[url('/images/gashapon/close.png')] bg-cover bg-no-repeat
            opacity-0 cursor-pointer
            ${isShowResult ? 'animate-scale-in' : ''}
          `}
          style={{ animationDelay: '1s' }}
        />
      </div>
    </div>
  )
}

export default ResultPopUp