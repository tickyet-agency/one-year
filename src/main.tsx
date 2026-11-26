import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GardenProvider } from "./lib/garden";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GardenProvider>
      <App />
    </GardenProvider>
  </StrictMode>
);
