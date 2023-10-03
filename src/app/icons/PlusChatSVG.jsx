import * as React from "react"

const PlusChatSVG = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke="#252525"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M1.875 10.633c0 1.334.936 2.495 2.256 2.69.89.13 1.79.232 2.698.303.389.03.744.234.961.559L8 17l3-3c.217-.325 1.783-.343 2.17-.373a40.445 40.445 0 0 0 2.7-.305c1.32-.194 2.255-1.354 2.255-2.69V5.619c0-1.336-.936-2.496-2.256-2.69A40.329 40.329 0 0 0 10 2.5c-1.993 0-3.953.146-5.87.428-1.32.194-2.255 1.355-2.255 2.69v5.015ZM10 6v5m2.5-2.5h-5"
    />
  </svg>
)
export default PlusChatSVG
