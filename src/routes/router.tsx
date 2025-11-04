import { createHashRouter, redirect } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import SongGeneratorPage from "../layouts/SongGeneratorPage";
import AlbumGeneratorPage from "../layouts/AlbumGeneratorPage";
import ProducerGeneratorPage from "../layouts/ProducerGeneratorPage";
import LyricsEditorPage from "../layouts/LyricsEditorPage";
import VocaDbSynthsComparerPage from "../layouts/VocaDbSynthsComparerPage";

export default createHashRouter([
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
        path: `/vdb-synths`,
        element: <VocaDbSynthsComparerPage />
      },
      {
        path: `*`,
        element: <div>404: Page not found</div>
      }
    ]
  }
]);