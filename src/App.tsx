import { RouterProvider, createHashRouter, redirect } from "react-router-dom";
import { ThemeModeProvider } from "./components/ThemeModeProvider";
import BaseLayout from "./layouts/BaseLayout";
import SongGeneratorPage from "./layouts/SongGeneratorPage";
import AlbumGeneratorPage from "./layouts/AlbumGeneratorPage";
import ProducerGeneratorPage from "./layouts/ProducerGeneratorPage";
import LyricsEditorPage from "./layouts/LyricsEditorPage";

import 'semantic-ui-css/semantic.min.css';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
import './ht-theme-dark.css';
import "./index.css";

// const baseUrl = import.meta.env.BASE_URL;

import { registerHandsontableCellTypes, registerHandsontablePlugins } from './registerHandsontable';
registerHandsontableCellTypes();
registerHandsontablePlugins();

const routes = createHashRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: [
      {
        path: "",
        loader: () => {
          throw redirect('/song-pages');
        },
        element: null
      },
      {
        path: `/song-pages`,
        element: <SongGeneratorPage />
      },
      {
        path: `/album-pages`,
        element: <AlbumGeneratorPage />
      },
      {
        path: `/producer-pages`,
        element: <ProducerGeneratorPage />
      },
      {
        path: `/lyrics-editor`,
        element: <LyricsEditorPage />
      },
      {
        path: `*`,
        element: <div>404: Page not found</div>
      }
    ]
  }
])

function App() {
  return (
    <ThemeModeProvider>
      <RouterProvider router={routes} />
    </ThemeModeProvider>
  )
}

export default App
