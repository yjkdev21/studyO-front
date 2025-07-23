import "./App.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./main/Home";
import Sample from "./sample/Sample";
import NotFoundPage from "./common/NotFoundPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sample/:id" element={<Sample />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
