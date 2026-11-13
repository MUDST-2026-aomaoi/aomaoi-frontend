import { useT } from '../../i18n';
import { Spinner } from './Spinner';

/**
 * Placeholder block with a soft sheen. Fades in after a short delay, so a fast response never flashes it.
 * `wave` offsets the sheen (ms) so stacked rows shimmer as a wave instead of all at once.
 */
export function Skeleton({ className = 'h-3.5 w-full rounded-full', wave = 0 }) {
  return <span aria-hidden="true" className={`skeleton block ${className}`} style={{ '--sk-delay': `${wave}ms` }} />;
}

/** Screen-reader-only "Loading…" for a region that is showing skeletons. */
function LoadingLabel() {
  const t = useT();
  return <span className="sr-only">{t('common.loading')}</span>;
}

const WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-2/5', 'w-3/5'];

/**
 * Stand-in rows for a table body while its first fetch is in flight.
 * Rows carry data-skeleton so useFitRows does not measure them as real rows.
 */
export function TableSkeletonRows({
  rows = 6,
  cols,
  align = 'center',
  cellClassName = 'px-4 py-3.5 sm:py-4',
  rowClassName = 'border-b border-[#F0F2EA] last:border-0',
}) {
  return Array.from({ length: rows }, (_, r) => (
    <tr key={r} data-skeleton="" className={rowClassName}>
      {Array.from({ length: cols }, (_, c) => (
        <td key={c} className={cellClassName}>
          {r === 0 && c === 0 && <LoadingLabel />}
          <Skeleton
            wave={r * 70}
            className={`h-3.5 rounded-full ${WIDTHS[(r * 3 + c * 2) % WIDTHS.length]} ${align === 'center' ? 'mx-auto' : ''}`}
          />
        </td>
      ))}
    </tr>
  ));
}

/** A few stacked lines, for small lists that are not tables. */
export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 py-2">
      <LoadingLabel />
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center justify-between gap-4">
          <Skeleton wave={r * 70} className={`h-3.5 rounded-full ${WIDTHS[r % WIDTHS.length]}`} />
          <Skeleton wave={r * 70} className="h-3.5 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Stand-in for the worker cards on the Workers page. */
export function WorkerCardSkeleton({ index = 0 }) {
  const wave = index * 70;
  return (
    <div className="flex flex-col rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
      {index === 0 && <LoadingLabel />}
      <div className="flex items-start gap-3">
        <Skeleton wave={wave} className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <Skeleton wave={wave} className="h-4 w-1/2 rounded-full" />
          <Skeleton wave={wave} className="h-3 w-2/3 rounded-full" />
          <Skeleton wave={wave} className="h-3 w-2/5 rounded-full" />
        </div>
      </div>
      <Skeleton wave={wave} className="mt-3 h-7 w-20 rounded-full" />
      <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-[#EEF1E6] pt-3">
        <Skeleton wave={wave} className="h-8 rounded-lg" />
        <Skeleton wave={wave} className="h-8 rounded-lg" />
        <Skeleton wave={wave} className="h-8 rounded-lg" />
      </div>
    </div>
  );
}

/** Stand-in for the farm cards on the All Farms page. */
export function FarmCardSkeleton({ index = 0 }) {
  const wave = index * 70;
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {index === 0 && <LoadingLabel />}
      <Skeleton wave={wave} className="h-40 w-full rounded-none" />
      <div className="p-4 sm:p-5">
        <Skeleton wave={wave} className="h-5 w-1/2 rounded-full" />
        <Skeleton wave={wave} className="mt-2.5 h-3.5 w-1/3 rounded-full" />
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#EEF1E6] pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton wave={wave} className="h-3 w-3/4 rounded-full" />
              <Skeleton wave={wave} className="h-5 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Centered spinner + label for a whole region that has nothing to show yet. */
export function LoadingBlock({ label, className = 'py-12' }) {
  const t = useT();
  return (
    <div role="status" className={`loader-block flex flex-col items-center justify-center gap-3 text-sm font-medium text-[#6B7264] ${className}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E6F0D6]">
        <Spinner className="h-6 w-6 text-[#4F7A2B]" />
      </span>
      <span>{label ?? t('common.loading')}</span>
    </div>
  );
}
