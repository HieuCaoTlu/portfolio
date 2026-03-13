import { useState, useEffect } from "react";

const cards = [
  {
    id: 1,
    emoji: "🎓",
    title: "Học vấn",
    content: "Cử nhân loại Xuất Sắc ngành Trí Tuệ Nhân Tạo",
    sub: "Đại học Thăng Long · GPA 9.4",
    color: "#FFD700",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    particles: ["⭐", "📚", "🏆", "💡"],
  },
  {
    id: 2,
    emoji: "💻",
    title: "Công việc",
    content: "Kỹ sư phần mềm tại FaceNet",
    sub: "Công ty Cổ phần Công nghệ cao FaceNet",
    color: "#00f5d4",
    bg: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2128 100%)",
    particles: ["⚙️", "🖥️", "🔧", "✨"],
  },
  {
    id: 3,
    emoji: "🏫",
    title: "Trung học",
    content: "THPT Trần Nhân Tông, Hà Nội",
    sub: "Học sinh khối A1 nhưng đi thi A0",
    color: "#ff9a9e",
    bg: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
    particles: ["🌸", "📖", "🎒", "🌺"],
  },
  {
    id: 4,
    emoji: "🎨",
    title: "Sở thích",
    content: "Vẽ vời · Viết văn",
    sub: "Gam màu đặc biệt nhất chính là trí tưởng tượng",
    color: "#f9ca24",
    bg: "linear-gradient(135deg, #7a2400 0%, #8a5500 100%)",
    particles: ["🖌️", "✍️", "💕", "🌈"],
  },
  {
    id: 5,
    emoji: "🌙",
    title: "Ước mơ",
    content: "Để những người xung quanh cảm thấy an tâm",
    sub: "",
    color: "#a8edea",
    bg: "linear-gradient(135deg, #243b55 0%, #141e30 100%)",
    particles: ["🕊️", "💫", "🌙", "⭐"],
  },
  {
    id: 6,
    emoji: "🎵",
    title: "Âm nhạc",
    content: "A Little Dream of Me · Cảm ơn người đã thức cùng tôi · Love Potions",
    sub: "K-pop · US-UK · J-pop · V-pop",
    color: "#e0e0e0",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #222222 100%)",
    particles: ["🎵", "🎧", "🎤", "✨"],
  },
  {
    id: 7,
    emoji: "🏙️",
    title: "Quê hương",
    content: "Sinh ra và lớn lên tại Hà Nội",
    sub: "Yên Sở, Hoàng Mai",
    color: "#7ec8e3",
    bg: "linear-gradient(135deg, #020c1b 0%, #0a1628 50%, #0d2137 100%)",
    particles: ["🏙️", "🌌", "🌙", "⭐"],
  },
  {
    id: 8,
    emoji: "🐱",
    title: "Chân ái",
    content: "Siêu thích mèo — Mèo là chân ái!",
    sub: "Tôi yêu các loài động vật dễ thương",
    color: "#fdcb6e",
    bg: "linear-gradient(135deg, #7a5500 0%, #8a3800 100%)",
    particles: ["🐱", "🐾", "😻", "🐈"],
  },
  {
    id: 9,
    emoji: "♌",
    title: "Cung hoàng đạo",
    content: "Cung Sư Tử",
    sub: "Yêu hết mình và hết lòng",
    color: "#ffffff",
    bg: "linear-gradient(135deg, #7a4500 0%, #8a7000 100%)",
    particles: ["♌", "🔥", "👑", "🦁"],
  },
];

function FloatingParticle({ emoji, index }) {
  const style = {
    position: "absolute",
    fontSize: `${Math.random() * 16 + 14}px`,
    left: `${Math.random() * 80 + 10}%`,
    top: `${Math.random() * 80 + 10}%`,
    opacity: 0,
    animation: `floatUp ${2 + Math.random() * 2}s ease-out ${index * 0.3}s forwards`,
    pointerEvents: "none",
    userSelect: "none",
  };
  return <span style={style}>{emoji}</span>;
}

function Card({ card, isFlipped, onClick, isActive }) {
  const [particles, setParticles] = useState([]);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      setParticles(
        Array.from({ length: 8 }, (_, i) => ({
          id: i,
          emoji: card.particles[i % card.particles.length],
        }))
      );
      setShowParticles(true);
      const t = setTimeout(() => setShowParticles(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isFlipped]);

  return (
    <div
      onClick={onClick}
      style={{
        width: "100%",
        maxWidth: 340,
        height: 220,
        perspective: "1000px",
        cursor: "pointer",
        transition: "transform 0.2s",
        transform: isActive ? "scale(1.03)" : "scale(1)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 20,
            background: "linear-gradient(135deg, #1a0533 0%, #2d1065 100%)",
            border: "2px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <div style={{
            fontSize: 48,
            filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))",
            animation: "pulse 2s ease-in-out infinite",
          }}>
            {card.emoji}
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: card.color,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            {card.title}
          </div>
          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.15em",
            fontFamily: "monospace",
          }}>
            CHẠM ĐỂ KHÁM PHÁ →
          </div>

          {/* decorative corners */}
          {["0,0", "calc(100% - 20px),0", "0,calc(100% - 20px)", "calc(100% - 20px),calc(100% - 20px)"].map((pos, i) => (
            <div key={i} style={{
              position: "absolute",
              left: pos.split(",")[0],
              top: pos.split(",")[1],
              width: 20,
              height: 20,
              border: `2px solid ${card.color}`,
              borderRadius: 4,
              opacity: 0.4,
              borderRight: i % 2 === 0 ? "none" : undefined,
              borderLeft: i % 2 !== 0 ? "none" : undefined,
              borderBottom: i < 2 ? "none" : undefined,
              borderTop: i >= 2 ? "none" : undefined,
            }} />
          ))}
        </div>

        {/* Back */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 20,
            background: card.bg,
            border: `2px solid ${card.color}44`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "24px 20px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${card.color}22, inset 0 1px 0 rgba(255,255,255,0.15)`,
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          {showParticles && particles.map((p, i) => (
            <FloatingParticle key={`${p.id}-${isFlipped}`} emoji={p.emoji} index={i} />
          ))}

          <div style={{ fontSize: 40, zIndex: 1, animation: "bounceIn 0.5s ease-out" }}>
            {card.emoji}
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 14,
            fontWeight: 700,
            color: card.color,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            zIndex: 1,
          }}>
            {card.title}
          </div>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.6,
            zIndex: 1,
            textShadow: "0 1px 8px rgba(0,0,0,0.7)",
          }}>
            {card.content}
          </div>
          <div style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.5,
            zIndex: 1,
            textShadow: "0 1px 6px rgba(0,0,0,0.6)",
          }}>
            {card.sub}
          </div>

          {/* glow blob */}
          <div style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${card.color}33, transparent 70%)`,
            bottom: -40,
            right: -40,
            pointerEvents: "none",
          }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [flipped, setFlipped] = useState({});
  const [hovered, setHovered] = useState(null);

  const toggle = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;500;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0011;
          min-height: 100vh;
          font-family: 'Lato', sans-serif;
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) rotate(0deg) scale(0.5); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-80px) rotate(20deg) scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 10px) scale(0.98); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 20px #b57bff55; }
          50% { text-shadow: 0 0 40px #b57bff99, 0 0 80px #ff79c644; }
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          padding: 20px;
          max-width: 1100px;
          margin: 0 auto;
        }

        @media (max-width: 600px) {
          .card-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#08000f",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background blobs */}
        {["#3d0099", "#1a0060", "#6600cc"].map((c, i) => (
          <div key={i} style={{
            position: "fixed",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${c}55, transparent 70%)`,
            left: `${[10, 60, 30][i]}%`,
            top: `${[20, 60, 80][i]}%`,
            transform: "translate(-50%, -50%)",
            animation: `floatBg ${8 + i * 2}s ease-in-out infinite`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: "fixed",
            width: 2,
            height: 2,
            borderRadius: "50%",
            background: "#fff",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `starTwinkle ${1.5 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Header */}
        <div style={{
          textAlign: "center",
          padding: "60px 20px 40px",
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🌟</div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            animation: "titleGlow 3s ease-in-out infinite",
            marginBottom: 8,
          }}>
            Cao Trung Hiếu
          </h1>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #b57bff, #ff79c6, #b57bff)",
            backgroundSize: "400px 100%",
            animation: "shimmer 3s linear infinite",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Lato', sans-serif",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            ✦ Nhấn vào từng thẻ để khám phá ✦
          </div>
        </div>

        {/* Cards */}
        <div className="card-grid" style={{ position: "relative", zIndex: 1 }}>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              isFlipped={!!flipped[card.id]}
              isActive={hovered === card.id}
              onClick={() => toggle(card.id)}
            />
          ))}
        </div>

        <div style={{
          textAlign: "center",
          padding: "40px 20px 60px",
          color: "rgba(255,255,255,0.25)",
          fontSize: 13,
          letterSpacing: "0.1em",
          fontFamily: "monospace",
          position: "relative",
          zIndex: 1,
        }}>
          made with 🩷 · hà nội
        </div>
      </div>
    </>
  );
}