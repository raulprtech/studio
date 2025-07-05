import React from 'react';

export function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M8 24.5L14.5 4L20 17.5L25 12.5L18.5 30L13 16.5L8 24.5Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M8 24.5L14.5 4L20 17.5L25 12.5L18.5 30L13 16.5L8 24.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
