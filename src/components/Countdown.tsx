import { useEffect, useState } from 'react';
import { eventConfig as e } from '../config/eventConfig';
function getRemaining(now: number) {
  const seconds = Math.max(0, Math.floor((new Date(e.startsAt).getTime() - now) / 1000));
  return {
    started: seconds === 0,
    values: [
      Math.floor(seconds / 86400),
      Math.floor(seconds / 3600) % 24,
      Math.floor(seconds / 60) % 60,
      seconds % 60,
    ],
  };
}
export function Countdown() {
  const [remaining, setRemaining] = useState(() => getRemaining(Date.now()));
  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining(Date.now())), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="countdown-block">
      {remaining.started && <p className="countdown-status">Наш вечір уже настав</p>}
      <div className="countdown" role="timer" aria-label="Час до початку свята">
        {remaining.values.map((value, i) => (
          <div key={i}>
            <span>{String(value).padStart(2, '0')}</span>
            <small>{['днів', 'годин', 'хвилин', 'секунд'][i]}</small>
          </div>
        ))}
      </div>
      {remaining.started && <p>Святкуємо разом. До зустрічі!</p>}
    </div>
  );
}
