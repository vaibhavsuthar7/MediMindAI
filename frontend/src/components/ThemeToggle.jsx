import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <label
      className={`bb8-toggle ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <input
        className="bb8-toggle__checkbox"
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        aria-label="Toggle theme mode"
      />
      <div className="bb8-toggle__container">
        <div className="bb8-toggle__scenery">
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="tatto-1"></div>
          <div className="tatto-2"></div>
          <div className="gomrassen"></div>
          <div className="hermes"></div>
          <div className="chenini"></div>
          <div className="bb8-toggle__cloud"></div>
          <div className="bb8-toggle__cloud"></div>
          <div className="bb8-toggle__cloud"></div>
        </div>
        <div className="bb8">
          <div className="bb8__head-container">
            <div className="bb8__antenna"></div>
            <div className="bb8__antenna"></div>
            <div className="bb8__head"></div>
          </div>
          <div className="bb8__body"></div>
        </div>
        <div className="artificial__hidden">
          <div className="bb8__shadow"></div>
        </div>
      </div>
    </label>
  )
}
