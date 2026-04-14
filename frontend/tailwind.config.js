export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0f172a",
        darker: "#020617",
        card: "rgba(30, 41, 59, 0.7)",
        "card-hover": "rgba(51, 65, 85, 0.8)",
        primary: "#3b82f6",
        "primary-hover": "#2563eb",
        success: "#10b981",
        danger: "#ef4444",
        border: "rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'app-bg': 'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)'
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        slideInError: 'slideInError 0.3s ease-out forwards',
        modalScaleIn: 'modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInError: {
          '0%': { opacity: '0', transform: 'translateY(-5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalScaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
