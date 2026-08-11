import { createContext, useContext, useLayoutEffect, useState, useCallback } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medimind_theme')
      if (saved === 'dark' || saved === 'light') return saved
    }
    return 'light'
  })

  const applyTheme = useCallback((targetTheme) => {
    const isDark = targetTheme === 'dark'
    const root = document.documentElement
    const body = document.body

    // Clear any inline background color overrides
    root.style.removeProperty('background-color')
    body.style.removeProperty('background-color')

    if (isDark) {
      root.classList.add('dark')
      body.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }

    try {
      localStorage.setItem('medimind_theme', targetTheme)
    } catch (e) {}
  }, [])

  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      applyTheme(next)
      return next
    })
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}




