import { useLocation } from "react-router-dom";

const getHeaderTextAndPolicyGuidelines = (path: string) => {
  switch (path) {
    case "/song-pages":
      return ["Song Page Generator", `${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/Help:Song_Article_Guideline`];
    case "/album-pages":
      return ["Album Page Generator", `${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/Help:Album_Article_Guideline`];
    case "/producer-pages":
      return ["Producer Page Generator", `${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/Help:Producer_Article_Guideline`];
    case "/lyrics-editor":
      return ["Lyrics Editor", null];
    default:
      return ["Page Generators", null];
  }
}

export default function GlobalHeader() {
  const location = useLocation();
  const [headerText, guidelineUrl] = getHeaderTextAndPolicyGuidelines(location.pathname);
  return (
    <header>
      <h1>VLW {headerText}</h1>
      {
        guidelineUrl &&
        <div>
          For more information, please refer to the <a href={guidelineUrl} target="_blank" rel="noopener noreferrer">wiki guidelines</a>
        </div>
      }
    </header>
  )
}