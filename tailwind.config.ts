import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'pretendard': 'Pretendard, sans-serif',
        'ibm-3270': 'IBM 3270 Condenced, monospace',
      },
      colors: {
        'mint': '#B2DFCF',
        'turquiose': '#50A385',
        'lightgray': '#F6F6F6',
        'kaistdarkblue': '#004191',
        'kaistblue': '#1486c8',
        'kaistlightblue': '#5fbfeb',
      },
      boxShadow: {
        'solid': '0 4px 0 0px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
