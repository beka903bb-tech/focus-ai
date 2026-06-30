import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DARK = {
  bg: '#0F172A', card: '#1E293B', border: '#334155',
  text: '#F1F5F9', sub: '#64748B', arrow: '#475569', version: '#334155',
};
export const LIGHT = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', sub: '#64748B', arrow: '#94A3B8', version: '#94A3B8',
};

const ThemeContext = createContext({ isDark: true, colors: DARK, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(t => {
      if (t) setIsDark(t !== 'light');
    }).catch(() => {});
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DARK : LIGHT, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
