import { createContext, PropsWithChildren, useContext } from "react";
import { useDarkMode } from 'usehooks-ts';

interface ThemeModeContextProps {
  isDarkMode: boolean
  toggle: () => void
  enable: () => void
  disable: () => void
}

const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

export function ThemeModeProvider({children}: PropsWithChildren) {
  const { isDarkMode, toggle, enable, disable } = useDarkMode();

  return (
    <ThemeModeContext.Provider
      value={{isDarkMode, toggle, enable, disable}}
    >
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const themeModeContext = useContext(ThemeModeContext);
  return themeModeContext!;
};