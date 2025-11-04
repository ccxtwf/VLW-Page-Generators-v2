import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import 'semantic-ui-css/semantic.min.css';
import 'handsontable/dist/handsontable.full.min.css';
import "./index.css";

import { registerHandsontableCellTypes, registerHandsontablePlugins } from './registerHandsontable';
registerHandsontableCellTypes();
registerHandsontablePlugins();

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
