import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      keyframes: {
        // 原有
        comeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // 新增扭蛋动画
        move1: {
          '0%':   { transform: 'rotate(-30deg)', left: '12.7%', top: '57.9%' },
          '26%':  { transform: 'rotate(60deg)', left: '41.2%', top: '8.9%' },
          '44%':  { transform: 'rotate(-110deg)', left: '52.2%', top: '21.8%' },
          '64%':  { transform: 'rotate(56deg)', left: '72%', top: '38%' },
          '100%': { transform: 'rotate(-30deg)', left: '12.7%', top: '57.9%' },
        },
        move2: {
          '0%':   { transform: 'rotate(85deg)', left: '31.2%', top: '57.9%' },
          '23%':  { transform: 'rotate(210deg)', left: '70%', top: '36%' },
          '45%':  { transform: 'rotate(-120deg)', left: '45%', top: '8%' },
          '72%':  { transform: 'rotate(30deg)', left: '8%', top: '34%' },
          '100%': { transform: 'rotate(-85deg)', left: '31.2%', top: '57.9%' },
        },
        move3: {
          '0%':   { transform: 'rotate(0deg)', left: '50%', top: '57.9%' },
          '38%':  { transform: 'rotate(360deg)', left: '38%', top: '11.4%' },
          '45%':  { transform: 'rotate(-360deg)', left: '45%', top: '8%' },
          '65%':  { transform: 'rotate(-50deg)', left: '7%', top: '38.7%' },
          '100%': { transform: 'rotate(360deg)', left: '50%', top: '57.9%' },
        },
        move4: {
          '0%':   { transform: 'rotate(0deg)', left: '65%', top: '59.9%' },
          '35%':  { transform: 'rotate(360deg)', left: '53.4%', top: '11.3%' },
          '64%':  { transform: 'rotate(-360deg)', left: '24.3%', top: '56%' },
          '100%': { transform: 'rotate(360deg)', left: '65%', top: '59.9%' },
        },
        move5: {
          '0%':   { transform: 'rotate(0deg)', left: '61.4%', top: '38%' },
          '29%':  { transform: 'rotate(360deg)', left: '40%', top: '11.5%' },
          '53%':  { transform: 'rotate(-360deg)', left: '9%', top: '41.3%' },
          '76%':  { transform: 'rotate(-160deg)', left: '21.8%', top: '57.9%' },
          '100%': { transform: 'rotate(360deg)', left: '61.4%', top: '38%' },
        },
        move6: {
          '0%':   { transform: 'rotate(16deg)', left: '44.2%', top: '42%' },
          '28%':  { transform: 'rotate(-60deg)', left: '18%', top: '57%' },
          '40%':  { transform: 'rotate(-45deg)', left: '8%', top: '41.3%' },
          '80%':  { transform: 'rotate(70deg)', left: '52.7%', top: '9.9%' },
          '100%': { transform: 'rotate(-16deg)', left: '44.2%', top: '42%' },
        },
        move7: {
          '0%':   { transform: 'rotate(0deg)', left: '27.5%', top: '39.9%' },
          '17%':  { transform: 'rotate(360deg)', left: '37.5%', top: '57.9%' },
          '44%':  { transform: 'rotate(-360deg)', left: '75%', top: '41.3%' },
          '67%':  { transform: 'rotate(42deg)', left: '50.18%', top: '8%' },
          '100%': { transform: 'rotate(360deg)', left: '27.5%', top: '39.9%' },
        },
        move8: {
          '0%':   { transform: 'rotate(46deg)', left: '14.4%', top: '33.9%' },
          '20%':  { transform: 'rotate(97deg)', left: '45.6%', top: '7.8%' },
          '45%':  { transform: 'rotate(-143deg)', left: '76.8%', top: '41.6%' },
          '65%':  { transform: 'rotate(85deg)', left: '64.6%', top: '57%' },
          '100%': { transform: 'rotate(-46deg)', left: '14.4%', top: '33.9%' },
        },
        move9: {
          '0%':   { transform: 'rotate(65deg)', left: '36.4%', top: '20%' },
          '41%':  { transform: 'rotate(-130deg)', left: '74.3%', top: '42.9%' },
          '76%':  { transform: 'rotate(94deg)', left: '46.5%', top: '57.9%' },
          '100%': { transform: 'rotate(-65deg)', left: '36.4%', top: '20%' },
        },
        move10: {
          '0%':   { transform: 'rotate(-92deg)', left: '53.6%', top: '22.11%' },
          '20%':  { transform: 'rotate(-142deg)', left: '37%', top: '58.5%' },
          '47%':  { transform: 'rotate(198deg)', left: '6.7%', top: '37.3%' },
          '67%':  { transform: 'rotate(-135deg)', left: '23%', top: '10.7%' },
          '100%': { transform: 'rotate(92deg)', left: '53.6%', top: '22.11%' },
        },
        eggFall: {
          '0%':   { opacity: '0', transform: 'translateY(-2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%':   { transform: 'translate(0, 0)' },
          '50%':  { transform: 'translate(-0.05rem, 0)' },
          '100%': { transform: 'translate(0.05rem, 0)' },
        },
        switchAnim: { // 避免与关键字冲突，用 switchAnim
          '0%':   { transform: 'rotate(0)' },
          '50%':  { transform: 'rotate(180deg)' },
          '100%': { transform: 'rotate(0)' },
        },
        switch2: {
          '0%':   { transform: 'rotate(5deg)' },
          '50%':  { transform: 'rotate(25deg)' },
          '100%': { transform: 'rotate(5deg)' },
        },
        highLight: {
          '0%':   { transform: 'translate(-50%, -50%) scale(1) rotate(0)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1) rotate(360deg)' },
        },
        fade: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        updone: {
          '0%':   { transform: 'translate(-50%, -50%)' },
          '100%': { transform: 'translate(-50%, -53%)' },
        },
        heartBeat: {
          '0%':   { boxShadow: 'none' },
          '100%': { boxShadow: '0 0 0.25rem rgb(58, 58, 247)' },
        },
        come: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleAnim: { // 避免与 scale 工具类冲突
          '0%':   { opacity: '0', transform: 'scale(1)' },
          '50%':  { opacity: '0.5', transform: 'scale(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        hand: {
          '0%':   { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(10%, 10%)' },
        },
        xz: {
          '0%':   { transform: 'rotate(0)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        // 保留你原有的快捷方式
        'come-in': 'comeIn 0.8s ease-out both',
        'scale-in': 'scaleIn 0.5s ease-out both',
        'bounce-in': 'bounceIn 0.6s ease-out both',
        // 新增几个常用动画快捷方式（可选）
        'fade': 'fade 0.5s linear',
        'heart-beat': 'heartBeat 1s infinite alternate',
        'xz': 'xz 10s linear infinite',
        'hand': 'hand 1s linear infinite alternate',
        // 其他复杂动画（如 move1-10、eggFall 等）组件已通过任意值使用，这里可不定义
      },
    },
  },
  // ... 其他配置保持不变
}
export default config