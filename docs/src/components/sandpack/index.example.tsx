// @ts-nocheck

//#region code
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css"

import App from "./app"

const root = createRoot(document.getElementById("root"))
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
//#endregion code
