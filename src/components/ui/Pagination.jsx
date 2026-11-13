import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '../../i18n';

function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

const BTN = 'flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition-colors';

/** 1 2 3 … pager. Renders nothing when everything fits on one page. */
export function Pagination({ pager, className = '' }) {
  const t = useT();
  const { page, totalPages, total, pageSize, setPage } = pager;
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav aria-label="Pagination" data-test="pagination" className={`mt-auto pt-4 flex flex-col items-center gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] ${className}`}>
      <p className="text-xs text-[#8A8F85] sm:justify-self-start">{t('pager.showing', { from, to, total })}</p>
      <div className="flex items-center gap-1.5 sm:col-start-2">
        <button
          type="button"
          data-test="pagination-prev"
          aria-label={t('pager.prev')}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`${BTN} bg-white text-[#2E4A1F] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:bg-[#E6F0D6] disabled:pointer-events-none disabled:opacity-40`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, totalPages).map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-[#8A8F85]">…</span>
          ) : (
            <button
              key={n}
              type="button"
              data-test={`pagination-page-${n}`}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => setPage(n)}
              className={`${BTN} ${n === page ? 'bg-[#2E4A1F] text-white' : 'bg-white text-[#2E4A1F] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:bg-[#E6F0D6]'}`}
            >
              {n}
            </button>
          )
        )}
        <button
          type="button"
          data-test="pagination-next"
          aria-label={t('pager.next')}
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`${BTN} bg-white text-[#2E4A1F] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:bg-[#E6F0D6] disabled:pointer-events-none disabled:opacity-40`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
