
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);
// Use React.createElement to avoid JSX in a .js file
root.render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);
