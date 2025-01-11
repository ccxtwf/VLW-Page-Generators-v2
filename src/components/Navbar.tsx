import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useThemeMode } from '../components/ThemeModeProvider';
import ThemeModeToggle from "./ThemeModeToggle";
import { MenuItem, Menu } from 'semantic-ui-react';

const cbDetermineActiveNativeLink = ({ isActive }: { isActive: boolean }) => (
  isActive ? 'active-nav-link' : ''
);

const routes = [
  {
    url: "/song-pages",
    name: "Song Page Generator"
  },
  {
    url: "/album-pages",
    name: "Album Page Generator"
  },
  {
    url: "/producer-pages",
    name: "Producer Page Generator"
  },
  {
    url: "/lyrics-editor",
    name: "Lyrics Editor"
  },
]
  
export default function Navbar() {

  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const location = useLocation();
  const { isDarkMode } = useThemeMode();
  useEffect(() => {
    const curIndex = Math.max(routes.findIndex(({ url }) => url === location.pathname), 0);
    setActiveRouteIndex(curIndex);
  }, [location]);

  return (
    <Menu pointing secondary inverted={isDarkMode} className="navbar">
    {
      routes.map(({ url, name }, index) => (
        <NavLink 
          to={url} 
          is='div'
          className={cbDetermineActiveNativeLink} 
          key={name}
          onClick={(e) => {
            if (window.confirm("Are you sure you want to leave this page?")) {
              setActiveRouteIndex(index);
              return true;
            }
            e.preventDefault();
            return false;
          }}
        >
          <MenuItem
            as="div"
            active={activeRouteIndex === index}
            name={name}
          />
        </NavLink>
      ))
    }
      <MenuItem position="right">
        <ThemeModeToggle />
      </MenuItem>
    </Menu>
  );
}