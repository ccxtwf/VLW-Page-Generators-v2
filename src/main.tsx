import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import { DatabaseProvider } from "./components/DatabaseProvider";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DatabaseProvider>
    <App />
  </DatabaseProvider>
)
