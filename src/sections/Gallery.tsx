import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { eventConfig as e } from '../config/eventConfig';
export function Gallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (active === null) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
  const close = () => {
    dialog.current?.close();
    setActive(null);
    trigger.current?.focus({ preventScroll: true });
  };
  const change = (dir: number) =>
    setActive((current) =>
      current === null ? null : (current + dir + e.photos.length) % e.photos.length,
    );
  const photo = active !== null ? e.photos[active] : null;
  return (
    <section className="gallery section wrap" id="moments" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <h2 id="gallery-title">
          ЦЕ БУДЕ
          <br />
          <span>НАШ КАДР.</span>
        </h2>
        <div className="gallery-intro">
          <p>
            Спалах. Рух. Твої люди.
            <br />
            Трохи того, як це відчуватиметься.
          </p>
        </div>
      </div>
      <div className="contact-sheet">
        <div className="photo-grid">
          {e.photos.map((p, index) => (
            <figure
              key={p.number}
              className={`film-photo film-${index}${p.src === '/images/cocktails.jpg' ? ' film-cocktail' : ''}`}
            >
              <button
                className="photo-button"
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setActive(index);
                }}
              >
                <div className="film-image">
                  <img
                    src={p.src}
                    alt={p.alt}
                    width="800"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="photo-expand">
                  <ArrowUpRight size={22} aria-hidden="true" />
                </span>
                <span className="photo-caption">
                  <span className="sr-only">Відкрити фото: </span>
                  {p.caption}
                </span>
              </button>
            </figure>
          ))}
        </div>
      </div>
      <div className="gallery-bottom">
        <p>
          Поки що — кадри настрою.
          <br />
          Справжні спогади створимо разом.
        </p>
        <details className="photo-credits">
          <summary>Походження зображень</summary>
          <div>
            <p>
              Диско-куля й танцмайданчик — авторські AI-зображення для цього запрошення. Це не фото
              Софії та не знімки реального свята. Коктейль — ліцензована фотографія Unsplash.
            </p>
            <a
              href="https://images.unsplash.com/photo-1470337458703-46ad1756a187"
              target="_blank"
              rel="noreferrer"
            >
              Коктейль / джерело Unsplash
            </a>
            <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
              Ліцензія Unsplash
            </a>
          </div>
        </details>
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        aria-label="Перегляд фотографій"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') change(1);
          if (event.key === 'ArrowLeft') change(-1);
        }}
      >
        <button className="icon-button lightbox-close" aria-label="Закрити фото" onClick={close}>
          <X size={24} aria-hidden="true" />
        </button>
        {photo && (
          <div
            className="lightbox-content"
            data-native-scroll
            onTouchStart={(event) => {
              touch.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (touch.current !== null) {
                const delta = event.changedTouches[0].clientX - touch.current;
                if (Math.abs(delta) > 45) change(delta < 0 ? 1 : -1);
                touch.current = null;
              }
            }}
          >
            <img src={photo.src} alt={photo.alt} />
            <div className="lightbox-controls">
              <button
                className="icon-button"
                aria-label="Попереднє фото"
                onClick={() => change(-1)}
              >
                <ArrowLeft size={22} aria-hidden="true" />
              </button>
              <p aria-live="polite">
                <span className="micro">
                  {(active ?? 0) + 1} / {e.photos.length}
                </span>
                <br />
                {photo.caption}
              </p>
              <button className="icon-button" aria-label="Наступне фото" onClick={() => change(1)}>
                <ArrowRight size={22} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
