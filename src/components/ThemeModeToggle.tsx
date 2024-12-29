import { Checkbox, Icon } from "semantic-ui-react";
import { useThemeMode } from "./ThemeModeProvider";

export default function ThemeModeToggle() {
  const { isDarkMode, toggle } = useThemeMode();
  return (
    <div id="theme-toggle">
      <Checkbox 
        toggle
        checked={isDarkMode}
        onChange={toggle} 
      />
      <Icon name={ isDarkMode ? "moon" : "sun" } color="orange" size="big" />
    </div>
  );
}