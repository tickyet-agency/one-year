import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GardenProvider } from "./lib/garden";

export function mountApp(el: HTMLElement) {
  createRoot(el).render(
    <StrictMode>
      <GardenProvider>
        <App />
      </GardenProvider>
    </StrictMode>
  );
}
