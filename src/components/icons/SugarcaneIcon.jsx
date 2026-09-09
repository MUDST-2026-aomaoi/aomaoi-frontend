import React from 'react';

export default function SugarcaneIcon({ size = 24, strokeWidth = 2, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* ลำต้นหลัก */}
      <path d="M12 22V2" />
      {/* ปล้องอ้อย */}
      <path d="M9 17h6" />
      <path d="M9 11h6" />
      <path d="M9 5h6" />
      {/* ใบอ้อย */}
      <path d="M12 17c-4 0-7-3-7-7" />
      <path d="M12 11c4 0 7-3 7-7" />
    </svg>
  );
}
