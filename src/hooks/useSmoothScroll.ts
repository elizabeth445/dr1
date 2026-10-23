import { useEffect } from 'react';
import { useMotionPreference } from './useMotionPreference';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
/** Lenis owns wheel smoothing; GSAP owns its sole frame driver. Native touch remains native. */
export function useSmoothScroll(enabled = true) {
  const reduced = useMotionPreference();
  useEffect(() => {
    if (reduced !== false || !enabled) return;
    const media = window.matchMedia('(pointer:fine) and (min-width:769px)');
    let dispose: (() => void) | undefined;
    const setup = () => {
      dispose?.();
      dispose = undefined;
      if (!media.matches) return;
      const lenis = new Lenis({
        autoRaf: false,
        anchors: true,
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) =>
          ['TEXTAREA', 'SELECT'].includes(node.tagName) || node.hasAttribute('data-native-scroll'),
      });
      const tick = (seconds: number) => lenis.raf(seconds * 1000);
      const unsubscribe = lenis.on('scroll', () => ScrollTrigger.update());
      gsap.ticker.add(tick);
      document.documentElement.dataset.smoothScroll = 'lenis';
      dispose = () => {
        gsap.ticker.remove(tick);
        unsubscribe();
        lenis.destroy();
        delete document.documentElement.dataset.smoothScroll;
      };
    };
    setup();
    media.addEventListener('change', setup);
    return () => {
      media.removeEventListener('change', setup);
      dispose?.();
    };
  }, [enabled, reduced]);
}
