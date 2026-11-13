import { SearchInput } from './SearchInput';

/** Class for Dropdown/DateInput placed inside <TableToolbar> so filters size consistently. */
export const TOOLBAR_FILTER_CLASS = 'min-w-0 flex-1 lg:w-48 lg:flex-none';

/**
 * Shared toolbar above data tables: search on the left, filters + primary action on the right.
 * children = filter controls, action = primary button.
 */
export function TableToolbar({ search, onSearchChange, searchPlaceholder, searchTestId, children, action }) {
  // No filters: keep the action on the same row as the search, even on mobile.
  const inlineAction = !children && action;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className={`min-w-0 lg:min-w-[220px] lg:max-w-lg lg:flex-1 ${inlineAction ? 'flex-1' : 'w-full lg:w-auto'}`}
        dataTest={searchTestId}
      />
      {inlineAction && <div className="shrink-0">{action}</div>}
      {children && (
        <div className="flex w-full flex-wrap items-center gap-3 lg:ml-auto lg:w-auto lg:shrink-0 lg:flex-nowrap lg:gap-4">
          {children}
          {action}
        </div>
      )}
    </div>
  );
}
