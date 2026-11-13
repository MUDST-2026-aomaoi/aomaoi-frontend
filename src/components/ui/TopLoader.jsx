import { useEffect, useRef, useState } from 'react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useT } from '../../i18n';
import { Spinner } from './Spinner';

const SHOW_AFTER_MS = 200; // requests faster than this never flash the bar
const SLOW_AFTER_MS = 4000; // past this (e.g. a backend waking up) a short message explains the wait
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const RESTING = 'translateX(-100%)';

/*
 * The bar is driven with WAAPI rather than React state: it trickles toward the end while requests are
 * in flight, and on completion it continues from wherever it is (no jump back), fills, then fades out.
 */
function startBar(bar, root, phase) {
  if (phase.current === 'running') return;
  const from = phase.current === 'finishing' ? getComputedStyle(bar).transform : RESTING;
  bar.getAnimations().forEach((a) => a.cancel());
  phase.current = 'running';
  root.dataset.active = 'true';
  bar.animate(
    [
      { transform: from, opacity: 1 },
      { transform: 'translateX(-8%)', opacity: 1 },
    ],
    { duration: 12000, easing: EASE_OUT, fill: 'forwards' },
  );
}

function finishBar(bar, root, phase) {
  if (phase.current !== 'running') return;
  const from = getComputedStyle(bar).transform;
  bar.getAnimations().forEach((a) => a.cancel());
  phase.current = 'finishing';
  const anim = bar.animate(
    [
      { transform: from, opacity: 1, easing: EASE_OUT },
      { transform: 'translateX(0)', opacity: 1, offset: 0.45, easing: 'ease-out' },
      { transform: 'translateX(0)', opacity: 0 },
    ],
    { duration: 450, fill: 'forwards' },
  );
  anim.onfinish = () => {
    if (phase.current !== 'finishing') return;
    phase.current = 'idle';
    delete root.dataset.active;
    anim.cancel(); // drop back to the resting (hidden) styles
  };
}

/** Global loading status: a slim progress bar on top for every API call, plus a note when one runs long. */
export function TopLoader() {
  const t = useT();
  const busy = useNetworkStore((s) => s.pending > 0);
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const phase = useRef('idle'); // idle | running | finishing
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    const root = rootRef.current;
    if (!busy) {
      finishBar(bar, root, phase);
      return undefined;
    }
    // Already on screen (finishing) → pick it straight back up instead of waiting again.
    const showTimer = setTimeout(() => startBar(bar, root, phase), phase.current === 'idle' ? SHOW_AFTER_MS : 0);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(slowTimer);
      setSlow(false);
    };
  }, [busy]);

  return (
    <>
      <div ref={rootRef} className="top-loader" aria-hidden="true">
        <div ref={barRef} className="top-loader-bar">
          <div className="top-loader-fill" />
          <div className="top-loader-peg" />
        </div>
      </div>

      <div className="loader-pill" data-show={slow ? 'true' : 'false'} aria-hidden="true">
        <Spinner className="h-4 w-4 text-[#4F7A2B]" />
        <span>{t('loader.slow')}</span>
      </div>
      <span role="status" className="sr-only">{slow ? t('loader.slow') : ''}</span>
    </>
  );
}
