import * as React from "react";
import type { JSX } from "react/jsx-runtime";

export const TemperatureIcon = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    width={19}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 8V15C10 16.1045 10.8955 17 12 17C13.1045 17 14 16.1045 14 15V8H10Z"
      fill="#F44336"
    />
    <path
      d="M12 13.5C10.8065 13.5 9.66193 13.9741 8.81802 14.818C7.97411 15.6619 7.5 16.8065 7.5 18C7.5 19.1935 7.97411 20.3381 8.81802 21.182C9.66193 22.0259 10.8065 22.5 12 22.5C13.1935 22.5 14.3381 22.0259 15.182 21.182C16.0259 20.3381 16.5 19.1935 16.5 18C16.5 16.8065 16.0259 15.6619 15.182 14.818C14.3381 13.9741 13.1935 13.5 12 13.5Z"
      fill="#F44336"
    />
    <path
      d="M12 8.5H14V9.5H12V8.5ZM12 10.5H14V11.5H12V10.5ZM12 12.5H14V13.5H12V12.5Z"
      fill="#C62828"
    />
    <path
      d="M14 8.5V3.5C14 2.3955 13.1045 1.5 12 1.5C10.8955 1.5 10 2.3955 10 3.5V8.5H14Z"
      fill="#CFD8DC"
    />
    <path d="M12 6.5H14V7.5H12V6.5ZM12 4.5H14V5.5H12V4.5Z" fill="#90A4AE" />
  </svg>
);
