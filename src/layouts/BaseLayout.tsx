import { Outlet } from 'react-router-dom';
import { useBeforeunload } from 'react-beforeunload';

import { useThemeMode } from '../components/ThemeModeProvider';

import GlobalHeader from '../components/GlobalHeader';
import Navbar from '../components/Navbar';
import GlobalFooter from '../components/GlobalFooter';

export default function BaseLayout() {

  const { isDarkMode } = useThemeMode();
  useBeforeunload(() => 'Are you sure you want to close this tab?');

  return (
    <div className={isDarkMode ? 'dark-mode' : ''} id="application">
    <GlobalHeader />
    <Navbar />
    <main>
      <Outlet />
    </main>
    <hr />
    <GlobalFooter />
    </div>
  )
}