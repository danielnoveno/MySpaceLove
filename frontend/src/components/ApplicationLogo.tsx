import { SVGAttributes } from 'react'

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Heart shape */}
      <path
        d="M20 35.5L17.1 32.86C8.8 25.36 3 20.12 3 13.68C3 8.44 7.16 4.28 12.4 4.28C15.36 4.28 18.2 5.64 20 7.76C21.8 5.64 24.64 4.28 27.6 4.28C32.84 4.28 37 8.44 37 13.68C37 20.12 31.2 25.36 22.9 32.88L20 35.5Z"
        fill="currentColor"
      />
      {/* Sparkle */}
      <circle cx="20" cy="14" r="3" fill="white" opacity="0.9" />
    </svg>
  )
}
