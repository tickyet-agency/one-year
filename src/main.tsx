import { applyContent, runtime, type AppContent } from "./content";
import "./styles.css";

/*
  Boot order matters: the content has to be in place before the app's modules load,
  because some of them (rose totals, the start date) are worked out once on import.

  /edit          → the editor (passcode protected)
  /?preview=1    → the app inside the editor's preview frame, fed the draft content
  anything else  → the app, with public/content.json applied over the defaults
*/

const root = document.getElementById("root")!;

function waitForPreviewContent(): Promise<Partial<AppContent>> {
  return new Promise((resolve) => {
    window.addEventListener("message", (e) => {
      if (e.origin === location.origin && e.data?.type === "preview-content") resolve(e.data.content);
    });
    window.parent.postMessage({ type: "preview-ready" }, location.origin);
  });
}

async function boot() {
  if (location.pathname.replace(/\/+$/, "") === "/edit") {
    const { mountEditor } = await import("./editor/mountEditor");
    mountEditor(root);
    return;
  }

  if (new URLSearchParams(location.search).has("preview") && window.parent !== window) {
    runtime.preview = true;
    applyContent(await waitForPreviewContent());
  } else {
    try {
      const res = await fetch("/content.json", { cache: "no-cache" });
      if (res.ok) applyContent(await res.json());
    } catch {
      /* no content.json yet, or offline: the built-in defaults are used */
    }
  }

  const { mountApp } = await import("./mountApp");
  mountApp(root);
}

void boot();
