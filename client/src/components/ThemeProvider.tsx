import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'purple-haze' | 'ocean-breeze' | 'sunset-glow' | 'midnight-neon' | 'forest-mist';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('midnight-neon');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('purple-haze', 'ocean-breeze', 'sunset-glow', 'midnight-neon', 'forest-mist');
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
