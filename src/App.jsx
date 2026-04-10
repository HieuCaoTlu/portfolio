import React, { useState } from 'react';

const TuanAnhChallenge = () => {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const handleIteration = () => {
    if (isFinished) return;
    setCount((prev) => {
      const next = prev + 1;
      if (next >= 50) setIsFinished(true);
      return next;
    });
  };

  return (
    <div style={styles.body}>

      <div style={styles.container}>
        <img
          src="avt.png"
          alt="Bùi Tuấn Anh"
          onAnimationIteration={handleIteration}
          style={{
            ...styles.avatar,
            animation: isFinished ? 'none' : 'flip 0.3s linear infinite',
            borderColor: isFinished ? '#2bef00' : '#00c3ff',
            boxShadow: isFinished ? '0 0 30px #2bef00' : '0 0 20px #00c3ff',
            visibility: isFinished ? 'hidden' : 'visible',
          }}
        />

        <div style={styles.counter}>
          {count} / 50
        </div>

        {isFinished && (
          <>
            <div style={styles.message}>
              Bùi Tuấn Anh — Cố lên!
            </div>
            <button style={styles.button} onClick={() => { setCount(0); setIsFinished(false); }}>
              Xoay lại
            </button>
          </>
        )}
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes flip {
          0% { transform: perspective(400px) rotateY(0deg); }
          100% { transform: perspective(400px) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#111',
    overflow: 'hidden',
    position: 'relative',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  container: {
    textAlign: 'center',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  avatar: {
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    objectFit: 'cover',
    borderStyle: 'solid',
    borderWidth: '6px',
  },
  counter: {
    fontSize: '2rem',
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
  },
  button: {
    padding: '10px 28px',
    fontSize: '1rem',
    fontFamily: 'sans-serif',
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#111',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  message: {
    fontSize: '2.5rem',
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
};

export default TuanAnhChallenge;
