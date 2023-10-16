import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="#EFEFEF"
      stroke="#EFEFEF"
      strokeWidth={0.696}
      d="M10.812 13.5c0 .192-.186.348-.416.348-.23 0-.417-.156-.417-.348 0-.192.187-.348.417-.348.23 0 .416.156.416.348Z"
    />
    <path
      stroke="#EFEFEF"
      strokeLinecap="round"
      strokeWidth={1.391}
      d="M10.5 11.732v-.503c0-.63.402-1.19 1-1.392v0c.598-.201 1-.762 1-1.392v-.2c0-.963-.782-1.745-1.746-1.745H10.5a2 2 0 0 0-2 2v0"
    />
    <path
      stroke="#EFEFEF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.5 16.75c4.142 0 7.5-3.078 7.5-6.875S14.642 3 10.5 3C6.358 3 3 6.078 3 9.875c0 1.753.716 3.352 1.894 4.567.36.372.617.866.489 1.367a3.736 3.736 0 0 1-.77 1.488c.293.052.59.078.887.078a4.977 4.977 0 0 0 2.87-.906 8.12 8.12 0 0 0 2.13.281Z"
    />
  </svg>
)
export default SvgComponent
