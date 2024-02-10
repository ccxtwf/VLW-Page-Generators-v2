import { useLocation } from "react-router-dom";
import { CONST_WIKI_DOMAIN } from "../constants/linkDomains";

const getHeaderTextAndPolicyGuidelines = (path: string) => {
  switch (path) {
    case "/song-pages":
      return ["Song Page Generator", `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/Vocaloid_Lyrics_Wiki:Song_Article_Guideline`];
    case "/album-pages":
      return ["Album Page Generator", `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/Vocaloid_Lyrics_Wiki:Album_Article_Guideline`];
    case "/producer-pages":
      return ["Producer Page Generator", `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/Vocaloid_Lyrics_Wiki:Producer_Article_Guideline`];
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