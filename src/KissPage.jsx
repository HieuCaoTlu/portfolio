import { useEffect, useRef, useState } from 'react'

const KISS_EMOJIS = ['💋', '😘', '💋', '💏', '💋', '😽', '💋']

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function KissPage() {
  const [kisses, setKisses] = useState([])
  const containerRef = useRef(null)
  const countRef = useRef(0)

  useEffect(() => {
    const total = 1000
    const batchSize = 100
    const delay = 30

    const spawn = () => {
      if (countRef.current >= total) return

      const batch = []
      const now = countRef.current
      for (let i = 0; i < batchSize && now + i < total; i++) {
        batch.push({
          id: now + i,
          x: randomBetween(0, 98),
          y: randomBetween(0, 95),
          size: randomBetween(14, 48),
          opacity: randomBetween(0.4, 1),
          rotation: randomBetween(-45, 45),
          emoji: KISS_EMOJIS[Math.floor(Math.random() * KISS_EMOJIS.length)],
          animDelay: randomBetween(0, 3),
        })
      }
      countRef.current += batch.length
      setKisses(prev => [...prev, ...batch])

      if (countRef.current < total) {
        setTimeout(spawn, delay)
      }
    }

    spawn()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #fff0f6, #ffe4f0, #ffd6eb)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes kissFloat {
          0%   { transform: translateY(0) rotate(var(--rot)); opacity: var(--op); }
          50%  { transform: translateY(-18px) rotate(calc(var(--rot) + 10deg)); opacity: 1; }
          100% { transform: translateY(0) rotate(var(--rot)); opacity: var(--op); }
        }
      `}</style>

      {kisses.map(k => (
        <span
          key={k.id}
          style={{
            position: 'absolute',
            left: `${k.x}%`,
            top: `${k.y}%`,
            fontSize: k.size,
            opacity: k.opacity,
            '--rot': `${k.rotation}deg`,
            '--op': k.opacity,
            transform: `rotate(${k.rotation}deg)`,
            animation: `kissFloat ${randomBetween(2, 5).toFixed(1)}s ease-in-out ${k.animDelay.toFixed(1)}s infinite`,
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          {k.emoji}
        </span>
      ))}

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none',
        zIndex: 999,
      }}>
        <div style={{
          fontSize: 72, fontWeight: 900, color: 'black',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          textShadow: '0 0 30px rgba(232,121,160,0.6), 0 4px 20px rgba(0,0,0,0.15)',
          lineHeight: 1,
        }}>
          {kisses.length.toLocaleString()}
        </div>
        <div style={{
          fontSize: 20, fontWeight: 700, color: 'black',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          textShadow: '0 0 16px rgba(232,121,160,0.5)',
          marginTop: 6, opacity: 0.85,
        }}>
          💋 kisses for you 💋
        </div>
      </div>
    </div>
  )
}
