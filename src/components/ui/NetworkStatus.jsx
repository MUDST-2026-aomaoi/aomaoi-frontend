import { useEffect, useState } from 'react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useT } from '../../i18n';
import { Spinner } from './Spinner';

const SLOW_AFTER_MS = 4000; // past this (e.g. a backend waking up) a short note explains the wait

/** Shows a small "waiting for the server" note while any API request has been pending for a while. */
export function NetworkStatus() {
  const t = useT();
  const busy = useNetworkStore((s) => s.pending > 0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!busy) return undefined;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [busy]);

  return (
    <>
      <div className="loader-pill" data-show={slow ? 'true' : 'false'} aria-hidden="true">
        <Spinner className="h-4 w-4 text-[#4F7A2B]" />
        <span>{t('loader.slow')}</span>
      </div>
      <span role="status" className="sr-only">{slow ? t('loader.slow') : ''}</span>
    </>
  );
}
