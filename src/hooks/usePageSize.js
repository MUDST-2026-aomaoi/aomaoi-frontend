import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Rows per page so that a table fits one screen without scrolling.
 * rowHeight: px per row. reserved: px used by everything else on the page.
 */
export function usePageSize({ rowHeight, reserved, min = 4, max = 12, mobile = 5 }) {
  const calc = () => {
    if (window.innerWidth < 640) return mobile;
    return Math.min(max, Math.max(min, Math.floor((window.innerHeight - reserved) / rowHeight)));
  };
  const [size, setSize] = useState(calc);
  useEffect(() => {
    const onResize = () => setSize(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowHeight, reserved, min, max, mobile]);
  return size;
}

/** Client-side paging. Goes back to page 1 whenever `items` (or the page size) changes. */
export function usePagedList(items, pageSize) {
  const [state, setState] = useState({ page: 1, items, pageSize });
  const fresh = state.items === items && state.pageSize === pageSize;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(fresh ? state.page : 1, totalPages);
  return {
    page,
    totalPages,
    total: items.length,
    pageSize,
    pageItems: items.slice((page - 1) * pageSize, page * pageSize),
    setPage: (p) => setState({ page: p, items, pageSize }),
  };
}

/**
 * Page size that fills the screen: measures the real row height and the space left between the
 * table's top edge and the bottom of the scrolling <main>, leaving room for the pager.
 * Attach `ref` to the element that wraps the <table>.
 */
export function useFitRows({ min = 4, max = 50, mobile = 5, fallbackRow = 60, footer = 64 } = {}) {
  const ref = useRef(null);
  // Tallest row seen so far. It only grows (until the window is resized), so the page size can never
  // flip-flop between two values when rows have different heights.
  const maxRow = useRef(0);
  const [pageSize, setPageSize] = useState(() => (window.innerWidth < 768 ? mobile : 8));

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    if (window.innerWidth < 768) {
      setPageSize((cur) => (cur === mobile ? cur : mobile));
      return;
    }
    const main = el.closest('main');
    const rows = [...el.querySelectorAll('tbody tr')].filter((r) => !r.querySelector('td[colspan]'));
    rows.forEach((r) => { maxRow.current = Math.max(maxRow.current, r.offsetHeight); });
    const rowH = maxRow.current || fallbackRow;
    const headH = el.querySelector('thead')?.offsetHeight ?? 48;
    const bottom = main ? main.getBoundingClientRect().bottom - parseFloat(getComputedStyle(main).paddingBottom || '0') : window.innerHeight;
    const avail = bottom - el.getBoundingClientRect().top - footer - headH;
    const next = Math.min(max, Math.max(min, Math.floor(avail / rowH)));
    setPageSize((cur) => (cur === next ? cur : next));
  };

  // After every render (row heights may have changed); setState only fires when the value changes.
  useLayoutEffect(measure);
  useEffect(() => {
    const onResize = () => {
      maxRow.current = 0;
      measure();
    };
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(measure);
    const main = ref.current?.closest('main');
    if (main) ro.observe(main);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, pageSize };
}
