import * as React from "react";
import type { JSX } from "react/jsx-runtime";
const DeleteIcon = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    width={15}
    height={18}
    viewBox="0 0 15 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6 0C5.60742 0 5.20605 0.137695 4.92188 0.421875C4.6377 0.706055 4.5 1.10742 4.5 1.5V2.25H0V3.75H0.75V15.75C0.75 16.9834 1.7666 18 3 18H12C13.2334 18 14.25 16.9834 14.25 15.75V3.75H15V2.25H10.5V1.5C10.5 1.10742 10.3623 0.706055 10.0781 0.421875C9.79395 0.137695 9.39258 0 9 0H6ZM6 1.5H9V2.25H6V1.5ZM2.25 3.75H12.75V15.75C12.75 16.166 12.416 16.5 12 16.5H3C2.58398 16.5 2.25 16.166 2.25 15.75V3.75ZM3.75 6V14.25H5.25V6H3.75ZM6.75 6V14.25H8.25V6H6.75ZM9.75 6V14.25H11.25V6H9.75Z"
      fill="#E50A0A"
    />
  </svg>
);
export default DeleteIcon;
