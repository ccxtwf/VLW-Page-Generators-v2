import { RouterProvider, createHashRouter, redirect } from "react-router-dom";
import BaseLayout from "./layouts/BaseLayout";
import SongGeneratorPage from "./layouts/SongGeneratorPage";
import AlbumGeneratorPage from "./layouts/AlbumGeneratorPage";
import ProducerGeneratorPage from "./layouts/ProducerGeneratorPage";
import LyricsEditorPage from "./layouts/LyricsEditorPage";

// @ts-ignore
import Handsontable from 'handsontable/base';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

import 'semantic-ui-css/semantic.min.css';
import 'handsontable/dist/handsontable.full.min.css';
import "./index.css";

// const baseUrl = import.meta.env.BASE_URL;

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
    <RouterProvider router={routes} />
  )
}

export default App
