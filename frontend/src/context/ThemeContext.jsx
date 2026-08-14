import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('app_theme', theme)
    const root = document.documentElement
    const body = document.body

    if (theme === 'dark') {
      root.classList.add('dark')
      body.classList.add('dark')
      body.style.backgroundColor = '#070b15'
      body.style.color = '#f8fafc'
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
      body.style.backgroundColor = '#f8fafc'
      body.style.color = '#0f172a'
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
