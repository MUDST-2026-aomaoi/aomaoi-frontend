import { useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useT } from '../../i18n';

const SLOW_AFTER_MS = 4000; // past this (e.g. a backend waking up) a short note explains the wait

/**
 * Tracks whether a request has been pending for a while. When no LoadingBlock is on screen to carry
 * that message (e.g. waiting on a save), it shows a small floating note instead.
 */
export function NetworkStatus() {
  const t = useT();
  const busy = useNetworkStore((s) => s.pending > 0);
  const slow = useNetworkStore((s) => s.slow);
  const hasInlineLoader = useNetworkStore((s) => s.inlineLoaders > 0);
  const setSlow = useNetworkStore((s) => s.setSlow);

  useEffect(() => {
    if (!busy) return undefined;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [busy, setSlow]);

  const show = slow && !hasInlineLoader;

  return (
    <>
      <div className="loader-pill" data-show={show ? 'true' : 'false'} aria-hidden="true">
        <Hourglass className="h-4 w-4 shrink-0 text-[#4F7A2B]" strokeWidth={2.2} />
        <span>{t('loader.slow')}</span>
      </div>
      <span role="status" className="sr-only">{show ? t('loader.slow') : ''}</span>
    </>
  );
}
