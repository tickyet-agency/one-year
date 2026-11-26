import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Editor from "./Editor";
import "./editor.css";

export function mountEditor(el: HTMLElement) {
  document.title = "Story editor · 365 Days of Us";
  document.body.classList.add("ed-body-root");
  createRoot(el).render(
    <StrictMode>
      <Editor />
    </StrictMode>
  );
}
