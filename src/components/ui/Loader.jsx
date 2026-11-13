import { useEffect } from 'react';
import { useT } from '../../i18n';
import { useNetworkStore } from '../../store/useNetworkStore';

/**
 * Indeterminate loader: a ring whose arc grows and shrinks as it turns, around a swaying seedling.
 * It never pretends to know how far along a request is; it only says "still working".
 */
export function SproutLoader({ size = 56 }) {
  return (
    <span className="sprout-loader" style={{ width: size, height: size }} aria-hidden="true">
      <svg className="sprout-loader-ring" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="21" stroke="#E6F0D6" strokeWidth="3" />
        <circle className="sprout-loader-arc" cx="24" cy="24" r="21" stroke="#4F7A2B" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg className="sprout-loader-plant" viewBox="0 0 24 24" fill="none">
        <path d="M7 20.5c1.5-1.2 3.2-1.8 5-1.8s3.5.6 5 1.8" stroke="#C4B99D" strokeWidth="1.8" strokeLinecap="round" />
        <g className="sprout-sway">
          <path d="M12 19v-8" stroke="#4F7A2B" strokeWidth="1.8" strokeLinecap="round" />
          <path className="sprout-leaf sprout-leaf-l" d="M12 14.5C11.6 11.6 9.4 10 6 10c0 3.2 2.4 5 6 4.5Z" fill="#7DA33A" />
          <path className="sprout-leaf sprout-leaf-r" d="M12 11.5C12.4 8 14.8 6 18.5 6c0 3.6-2.6 6-6.5 5.5Z" fill="#4F7A2B" />
        </g>
      </svg>
    </span>
  );
}

/**
 * Loader + label for a region whose data has not arrived yet. Fades in late, so a fast response never flashes it.
 * `fill` centers it in the space under the page header (for whole-page loads).
 * If the wait runs long, the "waiting for the server" note appears here, under the label, rather than as a
 * second loader elsewhere. Its line is reserved up front so nothing jumps when it shows.
 */
export function LoadingBlock({ label, className = 'py-12', size = 56, fill = false }) {
  const t = useT();
  const slow = useNetworkStore((s) => s.slow);
  const mountLoader = useNetworkStore((s) => s.mountLoader);
  const unmountLoader = useNetworkStore((s) => s.unmountLoader);

  useEffect(() => {
    mountLoader();
    return unmountLoader;
  }, [mountLoader, unmountLoader]);

  return (
    <div
      role="status"
      className={`loader-block flex w-full flex-col items-center justify-center gap-3 text-sm font-medium text-[#6B7264] ${fill ? 'min-h-[calc(100dvh-11rem)]' : className}`}
    >
      <SproutLoader size={size} />
      <span className="flex flex-col items-center gap-1 text-center">
        <span>{label ?? t('common.loading')}</span>
        <span className={`max-w-xs text-xs font-normal text-[#8A8F85] transition-opacity duration-200 ${slow ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          {t('loader.slow')}
        </span>
      </span>
    </div>
  );
}

/** The same, as a single full-width table row. */
export function TableLoadingRow({ cols }) {
  return (
    <tr>
      <td colSpan={cols}>
        <LoadingBlock className="py-10" />
      </td>
    </tr>
  );
}
