import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

const confettiPieces = Array.from({ length: 16 }, (_, index) => ({
  '--piece-x': `${3 + ((index * 29) % 94)}%`,
  '--piece-width': `${5 + (index % 3) * 2}px`,
  '--piece-height': `${8 + (index % 4) * 3}px`,
  '--piece-drift': `${((index % 5) - 2) * 24}px`,
  '--piece-spin': `${index % 2 ? -320 : 390}deg`,
  '--piece-duration': `${14 + (index % 5) * 2}s`,
  '--piece-delay': `${-((index * 3.1) % 23)}s`,
  '--piece-opacity': index % 3 === 0 ? 0.5 : 0.32,
}));

const glints = Array.from({ length: 8 }, (_, index) => ({
  left: `${7 + ((index * 23) % 87)}%`,
  top: `${12 + ((index * 19) % 75)}%`,
  '--glint-delay': `${-index * 0.7}s`,
  '--glint-duration': `${3.5 + (index % 3)}s`,
}));

export function Candle() {
  const [blown, setBlown] = useState(false),
    [visible, setVisible] = useState(false);
  const art = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.1,
    });
    if (art.current) observer.observe(art.current);
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className={`wish-section${visible ? ' in-view' : ''}`}
      id="wish"
      aria-labelledby="wish-title"
    >
      <div className="wish-atmosphere" aria-hidden="true">
        {confettiPieces.map((style, index) => (
          <span key={index} className="wish-confetti" style={style as React.CSSProperties} />
        ))}
        {glints.map((style, index) => (
          <span key={index} className="wish-glint" style={style as React.CSSProperties} />
        ))}
      </div>
      <div className="wrap wish-layout">
        <div className="wish-copy">
          <h2 id="wish-title">
            ОДНЕ
            <br />
            БАЖАННЯ
          </h2>
          <p>
            Між розмовами й танцями
            <br />
            знайдеться мить для чогось особистого.
            <br />
            Подумай про своє. І задуй свічку.
          </p>
        </div>
        <div className="wish-interaction">
          <button
            ref={art}
            className={`candle-art ${blown ? 'blown' : ''} ${visible ? 'in-view' : ''}`}
            aria-label={blown ? 'Бажання загадано' : 'Задмухати свічку'}
            aria-disabled={blown}
            onClick={() => {
              if (!blown) setBlown(true);
            }}
          >
            <img
              className="birthday-cake"
              src="/images/birthday-cake-straight.webp"
              alt="Торт із кремовими хвилями, вишнями та лаймовою свічкою на срібному блюді"
              width="1254"
              height="1254"
              loading="lazy"
              decoding="async"
            />
            <span className="candle-fire" aria-hidden="true">
              <span className="candle-flame" />
              <span className="candle-smoke" />
            </span>
            {blown && (
              <span className="wish-sparkles" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <span
                    key={i}
                    style={
                      {
                        '--angle': `${i * 30}deg`,
                        '--delay': `${(i % 3) * 0.06}s`,
                      } as React.CSSProperties
                    }
                  >
                    ✳
                  </span>
                ))}
              </span>
            )}
          </button>
          <div className="wish-result" aria-live="polite">
            <p>{blown ? 'Нехай усі бажання здійснюються!' : 'Торкнись, щоб задути свічку'}</p>
            {blown && (
              <button className="text-button" onClick={() => setBlown(false)}>
                <RotateCcw size={14} aria-hidden="true" />
                Ще одне бажання
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
