import { Outlet } from 'react-router-dom';
import { useBeforeunload } from 'react-beforeunload';

import MigrationNotice from '../components/reusables/MigrationNotice';
import GlobalHeader from '../components/GlobalHeader';
import Navbar from '../components/Navbar';
import GlobalFooter from '../components/GlobalFooter';

export default function BaseLayout() {

  useBeforeunload(() => 'Are you sure you want to close this tab?');

  return (
    <div id="application">
      <GlobalHeader />
      <Navbar />
      <main>
        <MigrationNotice />
        <Outlet />
      </main>
      <hr />
      <GlobalFooter />
    </div>
  )
}