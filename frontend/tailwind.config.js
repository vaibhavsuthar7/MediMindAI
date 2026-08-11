/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0406',           // Deep charcoal crimson background
        panel: '#16070B',         // Liquid glass card panel
        panelBorder: 'rgba(210, 10, 46, 0.25)',
        paper: '#FDFBD4',         // Crisp cream ivory text
        cream: '#FDFBD4',         // Cream color accent
        crimson: '#D20A2E',       // Vibrant Crimson Red
        crimsonBright: '#FF2A4B', // Bright crimson glow
        vital: '#D20A2E',
        alert: '#EF4444',
        amber: '#F59E0B',
        muted: '#A39682',         // Warm muted text on dark

        // MediMind Clinical Palette Tokens
        clinical: '#0B0E13',       // Base background — deep charcoal-navy
        clinicalPanel: '#12161D',  // Card/panel surfaces
        inkPrimary: '#EAEDF2',     // Primary text
        inkMuted: '#7C8494',       // Captions, secondary text
        coral: '#FF6B4A',          // Primary accent — vital signal color
        scanCyan: '#5EC8D8',       // Secondary accent — slice-plane wireframe/grid
        hairline: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['"Pally"', '"Figtree"', '"Inter"', 'sans-serif'],
        display: ['"Pally"', '"Figtree"', '"Outfit"', '"Inter"', 'sans-serif'],
        body: ['"Pally"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(210, 10, 46, 0.3)',
        coralGlow: '0 0 30px rgba(255, 107, 74, 0.4)',
        cyanGlow: '0 0 25px rgba(94, 200, 216, 0.35)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}
