import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight, RotateCcw } from 'lucide-react';
import { eventConfig as e, eventDate as d } from './config/eventConfig';
import { Opening } from './components/Opening';
import { Countdown } from './components/Countdown';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useMotionPreference } from './hooks/useMotionPreference';
import { Gallery } from './sections/Gallery';
import { Details, Schedule } from './sections/Details';
import { Candle } from './sections/Candle';
import { Rsvp } from './sections/Rsvp';
import { Closing } from './sections/Closing';
gsap.registerPlugin(ScrollTrigger, useGSAP);
function App() {
  const root = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(true);
  const reduced = useMotionPreference();
  useSmoothScroll(!intro);
  useEffect(() => {
    document.title = `${e.name} / Після шостої — день народження`;
    document
      .querySelector('meta[name=description]')
      ?.setAttribute(
        'content',
        `${e.title}. ${d.full}, ${d.time}, ${e.city}. Твій пропуск до своїх.`,
      );
  }, []);
  useGSAP(
    () => {
      if (intro || reduced) return;
      gsap.from('.hero-line', {
        xPercent: -6,
        yPercent: 105,
        rotationZ: 3,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power4.out',
      });
      gsap.from('.hero-photo', {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.05,
        ease: 'power3.inOut',
        delay: 0.15,
      });
      gsap.from('.hero-sticker', {
        scale: 0.65,
        rotation: -35,
        duration: 0.8,
        ease: 'back.out(1.4)',
        delay: 0.5,
      });
      const media = gsap.matchMedia();
      media.add('(min-width:768px)', () => {
        gsap.to('.hero-line-track', {
          xPercent: 3,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
        });
        gsap.from('.note-emphasis', {
          xPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: '.personal-note',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
      gsap.utils.toArray<HTMLElement>('.film-image').forEach((el) =>
        gsap.from(el, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.8,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
        }),
      );
      let active = true;
      document.fonts.ready.then(() => {
        if (active) ScrollTrigger.refresh();
      });
      return () => {
        active = false;
        media.revert();
      };
    },
    { scope: root, dependencies: [intro, reduced], revertOnUpdate: true },
  );
  const closeIntro = () => {
    setIntro(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('#hero-title')?.focus({ preventScroll: true }),
    );
  };
  return (
    <div
      ref={root}
      className="invitation-app"
      style={
        {
          '--chalk': e.theme.chalk,
          '--black': e.theme.black,
          '--acid': e.theme.acid,
          '--coral': e.theme.coral,
        } as React.CSSProperties
      }
    >
      <a className="skip-link" href="#main">
        Перейти до вмісту
      </a>
      <header className="header wrap">
        <a className="brand" href="#home" title="На початок">
          <span>
            ПІСЛЯ
            <br />
            ШОСТОЇ<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label="Головна навігація">
          <a href="#invitation">Запрошення</a>
          <a href="#details">Деталі</a>
          <a href="#moments">Кадри</a>
        </nav>
        <a className="nav-rsvp" href="#rsvp">
          Я буду
        </a>
      </header>
      <main id="main">
        <section className="hero wrap" id="home" aria-labelledby="hero-title">
          <div className="hero-topline">
            <span>
              {e.title}
              {e.age ? ` / ${e.age}` : ''}
            </span>
            <span>
              {e.city} · {d.short}
            </span>
          </div>
          <h1 id="hero-title" tabIndex={-1}>
            <span className="line-mask">
              <span className="hero-line">ПІСЛЯ</span>
            </span>
            <span className="line-mask">
              <span className="hero-line-track">
                <span className="hero-line hero-line-second">
                  ШОСТОЇ<span className="poster-dot">.</span>
                </span>
              </span>
            </span>
          </h1>
          <div className="hero-visual">
            <div className="hero-photo">
              <img
                src={e.heroPhoto.src}
                alt={e.heroPhoto.alt}
                width="1200"
                height="1500"
                style={{ objectPosition: e.heroPhoto.position }}
                fetchPriority="high"
              />
            </div>
            <div className="hero-sticker">
              <strong>
                БУТИ
                <br />
                РАЗОМ
              </strong>
            </div>
          </div>
          <div className="hero-baseline">
            <p>
              Мій день народження.
              <br />
              Наш вечір без пауз.
            </p>
            <div className="hero-date">
              <span>
                {d.day}
                <b>.</b>
                {d.month}
              </span>
              <span className="hero-time">Початок о {d.time}</span>
            </div>
            <a className="button acid" href="#rsvp">
              Я у списку <ArrowUpRight size={22} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-footer">
            <a href="#invitation">
              Починаємо <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
        </section>
        <section id="invitation" className="invitation section wrap" aria-labelledby="note-title">
          <div className="personal-note">
            <h2 id="note-title">
              {e.invitation.heading}
              <span className="note-emphasis">{e.invitation.emphasis}</span>
            </h2>
            <div className="note-bottom">
              <p>{e.invitation.paragraphs[0]}</p>
              <p>{e.invitation.paragraphs[1]}</p>
              <div className="signature">
                <span>З любов’ю,</span>
                <strong>{e.name}</strong>
              </div>
            </div>
          </div>
        </section>
        <div className="countdown-strip wrap">
          <Countdown />
        </div>
        <Gallery />
        <Details />
        <Schedule />
        <Candle />
        <Rsvp />
        <Closing />
      </main>
      <footer className="footer wrap">
        <span className="footer-event">
          {e.name} · {d.short}
        </span>
        <button
          onClick={() => {
            setIntro(true);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Відкрити знову
        </button>
      </footer>
      <Opening key={intro ? 'open' : 'closed'} show={intro} onClose={closeIntro} />
    </div>
  );
}
export default App;
