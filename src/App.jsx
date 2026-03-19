import { useState, useEffect, useRef } from 'react'

// ─── Kaomoji sets per state ────────────────────────────────────────────────────
const KAO = {
  idle:    ['(=^･ω･^=)', '(≧◡≦)', '(=^‥^=)', 'ฅ^•ﻌ•^ฅ', '(^･o･^)ﾉ"'],
  sit:     ['(=｀ω´=)', '( ᵕ—ᴗ— )', '(˘•ω•˘)', '(=^-ω-^=)', 'U^ェ^U'],
  happy:   ['(=^▽^=)', '(*≧ω≦*)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'ヽ(=^･ω･^=)ﾉ', '(๑>ᴗ<๑)'],
  sleepy:  ['(=｀-ω-´=)', '(-ω-) zzz', '(=ω=.)..zzzZZ', '(ᴗ˳ᴗ)', '(눈_눈)'],
}

const QUOTES = [
  'Ổn áp đấy Huy.',
  'Làm tốt rồi đó Huy.',
  'Làm vậy là người ta yên tâm rồi.',,
  'Tiếp tục nhé Huy.',
  'Ổn rồi, đừng dừng.',
  'Nice, Huy làm được mà.',
]

const LONG_QUOTES = [
  '60 phút rồi, Huy giữ phong độ tốt đấy.',
  'Kiên trì vậy là rất ổn, tiếp tục phát huy.',
  'Tập trung 60 phút liên tục — làm tốt lắm.',
]

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// ─── Kaomoji Cat component ─────────────────────────────────────────────────────
function KaoCat({ state = 'idle', onClick, pulse }) {
  const list = KAO[state] || KAO.idle
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
    const id = setInterval(() => setIdx(i => (i + 1) % list.length), 1200)
    return () => clearInterval(id)
  }, [state, list.length])

  return (
    <div
      onClick={onClick}
      style={{
        fontSize: 36,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        letterSpacing: 1,
        animation: pulse ? 'catPulse 1.1s ease-in-out infinite' : 'none',
        transition: 'transform .15s',
        padding: '8px 16px',
        borderRadius: 16,
        background: pulse ? '#fff0f6' : 'transparent',
        border: pulse ? '2px dashed #f9a8d4' : '2px solid transparent',
      }}
    >
      {list[idx]}
    </div>
  )
}

// ─── Spin slot ─────────────────────────────────────────────────────────────────
function SpinSlot({ spinning, result }) {
  const items = ['🌸', '💋', '😿', '🌸', '💋', '🌸', '😿']
  const [display, setDisplay] = useState('🌸')
  useEffect(() => {
    if (!spinning) { if (result) setDisplay(result); return }
    let i = 0
    const id = setInterval(() => { setDisplay(items[i++ % items.length]) }, 75)
    return () => clearInterval(id)
  }, [spinning, result])
  return (
    <div style={{
      width: 96, height: 96, background: '#fff', border: '3px solid #e8c4d8',
      borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 52, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transform: spinning ? 'scale(1.08)' : 'scale(1)', transition: 'transform .2s',
    }}>
      {display}
    </div>
  )
}

// ─── Counter chip ──────────────────────────────────────────────────────────────
function Counter({ icon, value, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: '#fdf0f6', border: '1px solid #f9c0d8',
      borderRadius: 10, padding: '5px 11px',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 16, color: '#e879a0' }}>{value}</span>
      <span style={{ fontSize: 11, color: '#c08090' }}>{label}</span>
    </div>
  )
}

const mainBtn = {
  background: 'linear-gradient(135deg,#f9a8d4,#e879a0)',
  border: 'none', borderRadius: 14, padding: '13px 36px',
  color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(232,121,160,.3)',
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode]             = useState('idle')
  const [duration, setDuration]     = useState(30)
  const [elapsed, setElapsed]       = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  const [spins, setSpins]       = useState(1)
  const [scents, setScents]     = useState(0)
  const [kisses, setKisses]     = useState(0)
  const [totalMins, setTotalMins] = useState(0)

  const [catState, setCatState]   = useState('idle')
  const [showPulse, setShowPulse] = useState(false)
  const [catMsg, setCatMsg]       = useState(null)

  const [spinning, setSpinning]     = useState(false)
  const [showSpin, setShowSpin]     = useState(false)
  const [spinResult, setSpinResult] = useState(null)
  const [spinMsg, setSpinMsg]       = useState(null)

  const [fishVisible, setFishVisible] = useState(false)
  const [fishCaught, setFishCaught]   = useState(false)

  const firstFocusDone = useRef(false)
  const timerRef   = useRef(null)
  const msgTimeout = useRef(null)
  const pulseTimer = useRef(null)

  // ── Idle pulse hint ──
  useEffect(() => {
    if (mode !== 'idle') { clearInterval(pulseTimer.current); setShowPulse(false); return }
    pulseTimer.current = setInterval(() => {
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 1800)
    }, 5000)
    return () => clearInterval(pulseTimer.current)
  }, [mode])

  // ── Timer tick ──
  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1
        const target = duration * 60
        if (duration === 60 && !fishCaught && next > 60 && next < target - 30) {
          if (Math.random() < 0.004) setFishVisible(true)
        }
        if (next >= target) {
          clearInterval(timerRef.current)
          setTimerActive(false)
          handleDone(duration)
          return target
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, duration, fishCaught])

  const showMsg = (msg, dur = 4500) => {
    setCatMsg(msg)
    clearTimeout(msgTimeout.current)
    msgTimeout.current = setTimeout(() => setCatMsg(null), dur)
  }

  const doSpin = (extraSpins = 0) => {
    const available = spins + extraSpins
    if (available <= 0) return
    setSpins(available - 1)
    setShowSpin(true)
    setSpinning(true)
    setSpinResult(null)
    setSpinMsg(null)
    setTimeout(() => {
      const r = Math.random()
      let result, msg
      if (r < 0.2) { result = '💋'; msg = '💋 Trúng phiếu hôn!! Lucky!!'; setKisses(k => k + 1) }
      else if (r < 0.7) { result = '🌸'; msg = '🌸 Được phiếu thơm~'; setScents(s => s + 1) }
      else { result = '😿'; msg = '😿 Không được gì... Cố lên!' }
      setSpinResult(result)
      setSpinning(false)
      setSpinMsg(msg)
    }, 2000)
  }

  const handleDone = (mins) => {
    setTotalMins(t => t + mins)
    setMode('done')
    setCatState('happy')
    if (mins >= 60) {
      setKisses(k => k + 1)
      showMsg(LONG_QUOTES[Math.floor(Math.random() * LONG_QUOTES.length)], 6000)
    } else {
      setScents(s => s + 1)
      showMsg(QUOTES[Math.floor(Math.random() * QUOTES.length)] + ' +🌸 Phiếu thơm!', 5000)
    }
    setTimeout(() => setCatState('idle'), 3000)
    if (!firstFocusDone.current) {
      firstFocusDone.current = true
      setTimeout(() => doSpin(), 800)
    }
  }

  const startFocus = () => {
    setElapsed(0)
    setFishVisible(false)
    setFishCaught(false)
    setTimerActive(true)
    setMode('focusing')
    setCatState('sit')
    showMsg('Bắt đầu nào! 🐾', 3000)
  }

  const stopFocus = () => {
    clearInterval(timerRef.current)
    setTimerActive(false)
    setMode('idle')
    setCatState('idle')
    showMsg('Ừ thôi nghỉ ngơi đi... 😿', 3000)
  }

  const handleCatClick = () => {
    showMsg(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    if (mode !== 'focusing') {
      setCatState('happy')
      setTimeout(() => setCatState(mode === 'done' ? 'idle' : 'idle'), 1200)
    }
  }

  const handleFishClick = () => {
    setFishVisible(false)
    setFishCaught(true)
    showMsg('Bắt được cá! +1 lượt quay 🐟', 2500)
    // Auto spin with 1 extra spin from fish
    doSpin(1)
  }

  const closeSpin = () => { if (!spinning) setShowSpin(false) }

  const progress = elapsed / (duration * 60)
  const remaining = duration * 60 - elapsed

  return (
    <div style={{
      height: '100%', overflow: 'hidden', background: '#fafaf8',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    }}>
      <style>{`
        html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
        @keyframes catPulse {
          0%,100% { transform:scale(1) translateY(0); }
          50%      { transform:scale(1.08) translateY(-5px); }
        }
        @keyframes fishFloat {
          0%,100% { transform:translateY(0) rotate(-8deg); }
          50%      { transform:translateY(-12px) rotate(8deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(.88); }
          to   { opacity:1; transform:scale(1); }
        }
        * { box-sizing:border-box; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 54,
        background: '#fff', borderBottom: '1px solid #ede8e0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 100,
      }}>
          <Counter icon="⏱" value={totalMins > 0 ? `${Math.floor(totalMins/60) > 0 ? Math.floor(totalMins/60)+'h ' : ''}${totalMins%60}p` : '0p'} label="Focus" />
          <Counter icon="🌸" value={scents} label="Thơm" />
          <Counter icon="💋" value={kisses} label="Hôn" />
          <button onClick={() => doSpin()} disabled={spins <= 0} style={{
            background: spins > 0 ? 'linear-gradient(135deg,#f9a8d4,#e879a0)' : '#eee',
            border: 'none', borderRadius: 10, padding: '7px 13px',
            color: spins > 0 ? '#fff' : '#bbb', fontWeight: 600, fontSize: 13,
            cursor: spins > 0 ? 'pointer' : 'default',
          }}>
            🎰 Quay ({spins})
          </button>
      </div>

      {/* ── Main content: fills remaining height ── */}
      <div style={{
        flex: 1, width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-evenly', padding: '8px 20px 12px',
        overflow: 'hidden', marginTop: 54,
      }}>

      {/* Description */}
      <div style={{
        width: '100%', background: '#fff',
        border: '1px solid #ede8e0', borderRadius: 14,
        padding: '12px 16px', fontSize: 13, color: '#555', lineHeight: 1.75,
      }}>
        <div style={{ fontWeight: 700, color: '#333', marginBottom: 5, fontSize: 14 }}>Cách chơi</div>
        <div>🎯 Chọn <b>30 phút</b> hoặc <b>60 phút</b> → bấm <b>Bắt đầu Focus</b></div>
        <div>🌸 30 phút xong → 1 phiếu thơm &nbsp;|&nbsp; 💋 60 phút xong → 1 phiếu hôn</div>
        <div>🐟 Focus 60 phút: cá ngẫu nhiên xuất hiện → click → tự quay ngay</div>
        <div>🎰 Quay: <b>50%</b> phiếu thơm · <b>20%</b> phiếu hôn · <b>30%</b> không được gì</div>
        <div style={{ color: '#bbb', fontSize: 11, marginTop: 3 }}>⚠️ Data mất khi refresh · Click mèo để nói chuyện bất cứ lúc nào</div>
      </div>

      {/* Cat + bubble */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ minHeight: 50, display: 'flex', alignItems: 'center' }}>
          {catMsg && (
            <div style={{
              background: '#fff', border: '1.5px solid #f9c0d8',
              borderRadius: 14, padding: '9px 16px',
              fontSize: 14, color: '#333', maxWidth: 320, textAlign: 'center',
              boxShadow: '0 2px 14px rgba(249,168,212,0.2)',
              animation: 'fadeUp .2s ease', lineHeight: 1.6,
            }}>
              {catMsg}
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <KaoCat state={catState} pulse={showPulse && mode === 'idle'} onClick={handleCatClick} />
          {showPulse && mode === 'idle' && (
            <div style={{
              position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
              fontSize: 11, color: '#e879a0', whiteSpace: 'nowrap',
              fontWeight: 600, animation: 'fadeUp .3s ease',
            }}>click me~</div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
        {mode === 'idle' && (
          <>
            <div style={{ display: 'flex', gap: 12 }}>
              {[30, 60].map(m => (
                <button key={m} onClick={() => setDuration(m)} style={{
                  padding: '10px 30px', borderRadius: 12,
                  border: `2px solid ${duration === m ? '#e879a0' : '#ddd'}`,
                  background: duration === m ? '#fce4ec' : '#fff',
                  color: duration === m ? '#e879a0' : '#777',
                  fontWeight: duration === m ? 700 : 500,
                  fontSize: 15, cursor: 'pointer', transition: 'all .15s',
                }}>
                  {m} phút
                </button>
              ))}
            </div>
            <button onClick={startFocus} style={mainBtn}>
              🎯 Bắt đầu Focus
            </button>
          </>
        )}

        {mode === 'focusing' && (
          <>
            <div style={{ position: 'relative', width: 150, height: 150 }}>
              <svg width={150} height={150} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={75} cy={75} r={62} fill="none" stroke="#f0e0ea" strokeWidth={10} />
                <circle cx={75} cy={75} r={62} fill="none" stroke="#f9a8d4" strokeWidth={10}
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - progress)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#333', letterSpacing: 1 }}>{fmt(remaining)}</div>
                <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>{duration} phút</div>
              </div>
            </div>
            <button onClick={stopFocus} style={{ ...mainBtn, background: '#f0f0f0', color: '#999', boxShadow: 'none', fontSize: 14 }}>
              Dừng lại
            </button>
          </>
        )}

        {mode === 'done' && (
          <button onClick={() => setMode('idle')} style={mainBtn}>
            🔄 Focus tiếp nào!
          </button>
        )}
      </div>

      </div>{/* end main content flex */}

      {/* ── Fish ── */}
      {fishVisible && (
        <div onClick={handleFishClick} style={{
          position: 'fixed', top: '30%', right: '10%', zIndex: 50,
          fontSize: 46, cursor: 'pointer', userSelect: 'none',
          animation: 'fishFloat 2s ease-in-out infinite',
          filter: 'drop-shadow(0 0 8px rgba(100,200,255,.7))',
        }}>🐟</div>
      )}

      {/* ── Spin overlay ── */}
      {showSpin && (
        <div onClick={closeSpin} style={{
          position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.9)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 200, gap: 18, animation: 'popIn .2s ease',
          cursor: spinning ? 'default' : 'pointer',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#555' }}>
            {spinning ? 'Đang quay...' : spinMsg || ''}
          </div>
          <SpinSlot spinning={spinning} result={spinResult} />
          {!spinning && (
            <div style={{ fontSize: 13, color: '#bbb', marginTop: 4 }}>click bất kỳ để đóng</div>
          )}
        </div>
      )}
    </div>
  )
}
