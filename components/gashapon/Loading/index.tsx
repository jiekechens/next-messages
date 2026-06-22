'use client';
import { useEffect, useState } from "react";

export default function LoadingComponent({ delay = 200 }: { delay?: number }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // 修复水合：在客户端获取 URL 参数
    const searchParams = new URLSearchParams(window.location.search);
    setLang(searchParams.get("lang") || searchParams.get("language") || "en");

    const timer = setTimeout(() => setShouldRender(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[888] flex items-center justify-center bg-white/40 ${lang === "ar" ? "direction-ltr" : ""}`}>
      <div className="absolute top-[44%] left-[50%] flex -translate-x-1/2 -translate-y-1/2 text-[0.4rem] font-bold h-[2.4rem]">
        {/* 这里使用数组映射，避免重复写 span */}
        {['L', 'oo', 'a', 'd', '.', '.'].map((char, index) => (
          <span
            key={index}
            className="inline-block mx-[0.01rem] animate-a1"
            style={{ 
              animationDelay: `${index * 0.2}s`,
              color: ['#17b9fe', '#f8b15a', '#f794f0', '#05c7f8', '#4e9711'][index] || 'inherit'
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}