import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { HashRouter } from "react-router-dom"; // BrowserRouter 대신 HashRouter 임포트

createRoot(document.getElementById("root")).render(
  // BrowserRouter 대신 HashRouter를 사용하고, basename 속성은 HashRouter에서 필요 없습니다.
  <HashRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </HashRouter>
);
