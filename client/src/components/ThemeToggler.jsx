import React from 'react';
import { MdLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import { useThemeStore } from '../hooks/store';

const ThemeToggler = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state)=> state.toggleTheme);
  React.useEffect(() => {
    // Update the body class when theme changes
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  return (
    <button onClick={()=>toggleTheme()} className="border-0 inherit-cl bg-transparent">
      {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
    </button>
  );
};

export default ThemeToggler;
