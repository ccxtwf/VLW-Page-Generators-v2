import { NavLink } from "react-router-dom";
import { CONST_WIKI_DOMAIN } from "../constants/linkDomains";

const cbDetermineActiveNativeLink = ({ isActive }: { isActive: boolean }) => (
  isActive ? 'active-nav-link' : ''
);

export default function GlobalFooter() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-item-left">

        Author: <a href="https://coolmikehatsune22.wordpress.com/about-me/" target="_blank" rel="noopener noreferrer">CoolMikeHatsune22</a>, based on earlier work by <a href={
          `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/User:ElectricRaichu`
        } target="_blank" rel="noopener noreferrer">ElectricRaichu</a> and <a href={
          `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/User:Nefere`
        } target="_blank" rel="noopener noreferrer">Nefere</a>.
        
        <br />
        
        Powered by React, <a href="https://handsontable.com/" target="_blank" rel="noopener noreferrer">Handsontable</a>, and <a href="https://semantic-ui.com" target="_blank" rel="noopener noreferrer">Semantic UI</a>.
        
        <br /><br />
        
        Github Repository: <a href="https://github.com/ccxtwf/VLW-Page-Generators-v2" target="_blank" rel="noopener noreferrer">VLW Song Page Generator</a>
        
        <br />
        
        Re-use and modification permitted under the CC license.<br />Feel free to report any bugs/issues or suggest any improvement to <a href={
          `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/User:CoolMikeHatsune22`
        } target="_blank" rel="noopener noreferrer">my VLW profile</a>.

        </div>
        <div className="footer-item-right">
          Navigation:<br />
          <NavLink to="/song-pages" className={cbDetermineActiveNativeLink}>
            Song Page Generator
          </NavLink><br />
          <NavLink to="/album-pages" className={cbDetermineActiveNativeLink}>
            Album Page Generator
          </NavLink><br />
          <NavLink to="/producer-pages" className={cbDetermineActiveNativeLink}>
            Producer Page Generator
          </NavLink><br />
          <NavLink to="/lyrics-editor" className={cbDetermineActiveNativeLink}>
            Lyrics Editor
          </NavLink>
        </div>
      </div>
      <div>

      </div>
    </footer>
  )
}