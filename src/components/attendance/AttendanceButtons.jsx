import { ATTENDANCE_LABEL, ATTENDANCE_STATUSES, ATTENDANCE_STYLE } from '../../config/attendance';

/**
 * มา / ลา / ขาด toggle. Pressing the selected status again asks the parent to clear it (onSelect(null)).
 * `disabledStatuses` greys out options that are not allowed (e.g. everything but leave on a future day).
 */
export function AttendanceButtons({ status, onSelect, disabledStatuses = [], disabled = false, className = '' }) {
  return (
    <div className={`grid grid-cols-3 gap-1.5 ${className}`} role="group">
      {ATTENDANCE_STATUSES.map((key) => {
        const selected = status === key;
        const blocked = disabled || disabledStatuses.includes(key);
        return (
          <button
            key={key}
            type="button"
            data-test={`attendance-${key.toLowerCase()}`}
            aria-pressed={selected}
            disabled={blocked}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(selected ? null : key);
            }}
            className={`rounded-lg border px-2 py-1.5 text-sm font-semibold transition-colors ${
              selected
                ? ATTENDANCE_STYLE[key].active
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            } ${blocked ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            {ATTENDANCE_LABEL[key]}
          </button>
        );
      })}
    </div>
  );
}
