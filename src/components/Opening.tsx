import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MoveRight } from 'lucide-react';
import { eventConfig as e, eventDate as d } from '../config/eventConfig';
import { useMotionPreference } from '../hooks/useMotionPreference';

gsap.registerPlugin(useGSAP);
const teeth = Array.from(
  { length: 60 },
  (_, i) => `${i % 2 ? 0.9995 : 0.9965},${0.04 + i * 0.0154}`,
).join(' ');
const stubTeeth = Array.from(
  { length: 60 },
  (_, i) => `${i % 2 ? 0.002 : 0.01},${0.95 - i * 0.0154}`,
).join(' ');
export function Opening({ show, onClose }: { show: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null),
    openButton = useRef<HTMLButtonElement>(null);
  const [opening, setOpening] = useState(false);
  const reduced = useMotionPreference();
  const openingRef = useRef(false);
  const { contextSafe } = useGSAP(
    () => {
      if (!show || reduced) return;
      const node = dialog.current?.querySelector<HTMLElement>('.ticket-tilt');
      if (!node) return;
      const rx = gsap.quickTo(node, 'rotationX', { duration: 0.65, ease: 'power2.out' });
      const ry = gsap.quickTo(node, 'rotationY', { duration: 0.65, ease: 'power2.out' });
      const move = (ev: PointerEvent) => {
        if (openingRef.current || ev.pointerType !== 'mouse') return;
        const r = node.getBoundingClientRect();
        rx((-(ev.clientY - r.top - r.height / 2) / r.height) * 5);
        ry(((ev.clientX - r.left - r.width / 2) / r.width) * 7);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerleave', leave);
      return () => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerleave', leave);
      };
    },
    { scope: dialog, dependencies: [show, reduced], revertOnUpdate: true },
  );
  useEffect(() => {
    if (!show) return;
    const node = dialog.current;
    node?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      node?.close();
    };
  }, [show]);
  useEffect(() => {
    if (show && !opening) openButton.current?.focus({ preventScroll: true });
  }, [show, opening]);
  const close = () => {
    dialog.current?.close();
    onClose();
  };
  const open = () =>
    contextSafe(() => {
      if (openingRef.current) return;
      openingRef.current = true;
      setOpening(true);
      if (reduced) {
        close();
        return;
      }
      const mobile = window.matchMedia('(max-width:650px)').matches;
      const timeline = gsap.timeline({
        id: 'physical-ticket-opening',
        defaults: { ease: 'power3.inOut' },
        onComplete: close,
      });
      timeline
        .to('.ticket-tilt', { rotationX: 0, rotationY: 0, duration: 0.25 }, 0)
        .to(
          '.ticket-stub',
          {
            rotationY: mobile ? 0 : -18,
            rotationX: mobile ? 20 : 0,
            z: 18,
            duration: 0.28,
            transformOrigin: mobile ? '50% 0%' : '0% 50%',
          },
          0,
        )
        .to(
          '.ticket-seam',
          {
            scaleY: mobile ? 1 : 0,
            scaleX: mobile ? 0 : 1,
            transformOrigin: mobile ? 'left' : 'top',
            duration: 0.4,
          },
          0.1,
        )
        .to('.ticket-back', { opacity: 0, duration: 0.2 }, 0.35)
        .to(
          '.ticket-stub',
          {
            x: mobile ? 22 : 54,
            y: mobile ? 55 : 36,
            z: 35,
            rotationZ: mobile ? 7 : 11,
            rotationY: 0,
            rotationX: 12,
            duration: 0.5,
            ease: 'power2.out',
          },
          0.22,
        )
        .to(
          '.ticket',
          { rotationZ: 0, rotationX: 0, rotationY: 0, scale: 1.12, y: -14, z: 40, duration: 0.7 },
          0.38,
        )
        .to(
          '.ticket-stub',
          {
            x: mobile ? 50 : 110,
            y: mobile ? 170 : 140,
            rotationZ: 20,
            z: -30,
            opacity: 0,
            duration: 0.5,
          },
          0.7,
        )
        .to('.ticket-print', { y: -12, opacity: 0, duration: 0.28 }, 0.98)
        .to('.opening-inner', { y: -35, opacity: 0, duration: 0.35 }, 1.15);
    })();
  return (
    <dialog
      ref={dialog}
      className="opening"
      aria-labelledby="opening-title"
      onCancel={(ev) => {
        ev.preventDefault();
        close();
      }}
    >
      <svg className="ticket-defs" aria-hidden="true">
        <defs>
          <clipPath id="ticket-main-cut" clipPathUnits="objectBoundingBox">
            <path
              d={`M.02 0H.98Q.98 .035 1 .035L${teeth}L1 .965Q.98 .965 .98 1H.02L0 .975V.55C.028 .55 .028 .45 0 .45V.025Z`}
            />
          </clipPath>
          <clipPath id="ticket-stub-cut" clipPathUnits="objectBoundingBox">
            <path
              d={`M.05 0H.96L1 .025V.975L.96 1H.05Q.05 .965 0 .965L${stubTeeth}L0 .035Q.05 .035 .05 0Z`}
            />
          </clipPath>
        </defs>
      </svg>
      <div className="opening-inner">
        <div className="ticket-stage">
          <div className="ticket-tilt">
            <div className="ticket">
              <div className="ticket-back" aria-hidden="true">
                <span>ДЛЯ СВОЇХ / ВХІД ЗА ЗАПРОШЕННЯМ</span>
              </div>
              <div className="ticket-main">
                <div className="paper-grain" />
                <div className="paper-fold" />
                <div className="ticket-print">
                  <div className="ticket-print-top micro">
                    <span>{e.title}</span>
                  </div>
                  <div className="ticket-wordmark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M3 21 21 3M7 3h14v14" />
                    </svg>
                  </div>
                  <h2 id="opening-title">
                    ПІСЛЯ
                    <br />
                    <span>ШОСТОЇ.</span>
                  </h2>
                  <div className="ticket-print-bottom">
                    <div className="ticket-metadata">
                      <strong>
                        {d.day}.{d.month}
                      </strong>
                      <span className="micro">
                        {new Date(e.startsAt).getFullYear()} / {d.time}
                      </span>
                    </div>
                    <div className="ticket-barcode" aria-hidden="true">
                      {Array.from({ length: 34 }, (_, i) => (
                        <span key={i} style={{ width: `${[2, 1, 3, 1, 4, 2, 1][i % 7]}px` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="ticket-seam" aria-hidden="true">
                {Array.from({ length: 25 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="ticket-stub">
                <div className="paper-grain" />

                <span className="stub-mark">{e.initial}</span>

                <span className="stub-date">{d.time}</span>
                <span className="micro">{e.city}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="opening-actions">
          <button ref={openButton} className="button acid" onClick={open} disabled={opening}>
            Відкрити запрошення
            <MoveRight size={20} aria-hidden="true" />
          </button>
          <button className="skip" onClick={close}>
            Пропустити вступ
          </button>
        </div>
      </div>
    </dialog>
  );
}
