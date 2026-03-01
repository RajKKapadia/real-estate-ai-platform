import { WIDGET_STYLES } from "./styles";
import { SSEClient } from "./sse-client";

type Message = { role: "user" | "assistant"; content: string; id: string };

export function createChatBubble(apiUrl: string) {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });

  // Inject styles
  const style = document.createElement("style");
  style.textContent = WIDGET_STYLES;
  shadow.appendChild(style);

  // State
  const messages: Message[] = [];
  let isOpen = false;
  let isSending = false;

  const client = new SSEClient(apiUrl);

  // Chat icon SVG
  const chatIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`;
  const closeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  // Create bubble button
  const bubble = document.createElement("button");
  bubble.className = "widget-bubble";
  bubble.innerHTML = chatIconSvg;
  bubble.setAttribute("aria-label", "Open chat");

  // Create container
  const container = document.createElement("div");
  container.className = "widget-container";

  const header = document.createElement("div");
  header.className = "widget-header";
  header.innerHTML = `<span>Chat with us</span><button aria-label="Close chat">&times;</button>`;

  const messagesEl = document.createElement("div");
  messagesEl.className = "widget-messages";

  const inputArea = document.createElement("div");
  inputArea.className = "widget-input-area";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type a message...";

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Send";

  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);
  container.appendChild(header);
  container.appendChild(messagesEl);
  container.appendChild(inputArea);

  shadow.appendChild(bubble);
  shadow.appendChild(container);

  // Render messages
  function renderMessages() {
    messagesEl.innerHTML = "";
    for (const msg of messages) {
      const div = document.createElement("div");
      div.className = `message ${msg.role}`;
      div.textContent = msg.content;
      messagesEl.appendChild(div);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Toggle open
  function toggle() {
    isOpen = !isOpen;
    container.classList.toggle("open", isOpen);
    bubble.innerHTML = isOpen ? closeIconSvg : chatIconSvg;
    bubble.setAttribute("aria-label", isOpen ? "Close chat" : "Open chat");
    if (isOpen) input.focus();
  }

  // Send message
  async function send() {
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    sendBtn.disabled = true;
    input.value = "";

    const userMsg: Message = {
      role: "user",
      content: text,
      id: `u_${Date.now()}`,
    };
    messages.push(userMsg);

    // Add placeholder for assistant
    const assistantMsg: Message = {
      role: "assistant",
      content: "",
      id: `a_${Date.now()}`,
    };
    messages.push(assistantMsg);
    renderMessages();

    await client.sendMessage(
      messages.filter((m) => m.role === "user" || (m.role === "assistant" && m.content)),
      (partial) => {
        assistantMsg.content = partial;
        renderMessages();
      },
      (full) => {
        assistantMsg.content = full;
        renderMessages();
        isSending = false;
        sendBtn.disabled = false;
      },
      (error) => {
        assistantMsg.content = `Sorry, something went wrong: ${error}`;
        renderMessages();
        isSending = false;
        sendBtn.disabled = false;
      }
    );
  }

  // Event listeners
  bubble.addEventListener("click", toggle);
  header.querySelector("button")!.addEventListener("click", toggle);
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  document.body.appendChild(host);
}
