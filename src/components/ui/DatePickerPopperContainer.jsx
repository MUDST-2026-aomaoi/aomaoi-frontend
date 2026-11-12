import { createPortal } from 'react-dom';

/**
 * Renders the datepicker popup in <body> so it is never clipped by a modal's scroll area
 * or hidden under sticky table headers (the month navigation arrows stay clickable).
 */
export function DatePickerPopperContainer({ children }) {
  return createPortal(children, document.body);
}
