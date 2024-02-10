import { Outlet } from 'react-router-dom';
import { useBeforeunload } from 'react-beforeunload';

import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';

export default function BaseLayout() {

  useBeforeunload(() => 'Are you sure you want to close this tab?');

  return (
    <>
    <GlobalHeader />

    <hr />

    <main>
      <Outlet />
    </main>

    <hr />
    
    <GlobalFooter />
    </>
  )
}