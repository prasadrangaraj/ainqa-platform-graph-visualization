import * as React from "react";
import type { JSX } from "react/jsx-runtime";

export const RespIcon = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5Z"
      fill="#455A64"
    />
    <path
      d="M12.9 20.2999L10.9 9.3499L8.95 17.1999L7.9 12.3499L7.85 12.4999H3V11.4999H7.15L8.1 8.6499L9.05 12.7999L11.1 4.6499L13.1 15.6999L15 8.5999L16.15 12.6499L16.7 11.4999H21V12.4999H17.3L15.85 15.3499L15 12.3999L12.9 20.2999Z"
      fill="#AEEA00"
    />
  </svg>
);