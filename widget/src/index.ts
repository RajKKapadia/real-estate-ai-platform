import { createChatBubble } from "./chat-bubble";

(function () {
  // Find the script tag with data-builder-id
  const scripts = document.querySelectorAll("script[data-builder-id]");
  const script = scripts[scripts.length - 1];

  if (!script) {
    console.error("[RealEstateAI] Missing data-builder-id on script tag");
    return;
  }

  const builderId = script.getAttribute("data-builder-id");
  if (!builderId) {
    console.error("[RealEstateAI] Empty data-builder-id");
    return;
  }

  // Determine API URL: use data-api-url attribute or infer from script src
  let apiUrl = script.getAttribute("data-api-url");
  if (!apiUrl) {
    const src = script.getAttribute("src") || "";
    try {
      const url = new URL(src, window.location.origin);
      apiUrl = `${url.origin}/api/chat/${builderId}`;
    } catch {
      apiUrl = `/api/chat/${builderId}`;
    }
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      createChatBubble(apiUrl!)
    );
  } else {
    createChatBubble(apiUrl);
  }
})();
