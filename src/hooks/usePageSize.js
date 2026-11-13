import { useEffect, useState } from 'react';

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
