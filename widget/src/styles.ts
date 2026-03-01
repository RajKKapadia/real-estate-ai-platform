export const WIDGET_STYLES = `
  :host {
    --widget-primary: #6366f1;
    --widget-primary-hover: #4f46e5;
    --widget-bg: #ffffff;
    --widget-text: #1f2937;
    --widget-text-muted: #6b7280;
    --widget-border: #e5e7eb;
    --widget-user-bg: #6366f1;
    --widget-user-text: #ffffff;
    --widget-bot-bg: #f3f4f6;
    --widget-bot-text: #1f2937;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .widget-bubble {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--widget-primary);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: transform 0.2s, background 0.2s;
    z-index: 10000;
  }

  .widget-bubble:hover {
    transform: scale(1.05);
    background: var(--widget-primary-hover);
  }

  .widget-bubble svg {
    width: 24px;
    height: 24px;
  }

  .widget-container {
    position: fixed;
    bottom: 88px;
    right: 20px;
    width: 380px;
    max-height: 560px;
    border-radius: 16px;
    background: var(--widget-bg);
    border: 1px solid var(--widget-border);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    display: none;
    flex-direction: column;
    overflow: hidden;
    z-index: 10000;
  }

  .widget-container.open { display: flex; }

  .widget-header {
    padding: 16px;
    background: var(--widget-primary);
    color: white;
    font-weight: 600;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .widget-header button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    font-size: 18px;
  }

  .widget-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 200px;
    max-height: 380px;
  }

  .message {
    max-width: 85%;
    padding: 8px 12px;
    border-radius: 12px;
    word-wrap: break-word;
    font-size: 14px;
  }

  .message.user {
    align-self: flex-end;
    background: var(--widget-user-bg);
    color: var(--widget-user-text);
    border-bottom-right-radius: 4px;
  }

  .message.assistant {
    align-self: flex-start;
    background: var(--widget-bot-bg);
    color: var(--widget-bot-text);
    border-bottom-left-radius: 4px;
  }

  .message.typing {
    opacity: 0.7;
    font-style: italic;
  }

  .widget-input-area {
    padding: 12px;
    border-top: 1px solid var(--widget-border);
    display: flex;
    gap: 8px;
  }

  .widget-input-area input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--widget-border);
    border-radius: 8px;
    outline: none;
    font-size: 14px;
    font-family: inherit;
  }

  .widget-input-area input:focus {
    border-color: var(--widget-primary);
  }

  .widget-input-area button {
    padding: 8px 16px;
    background: var(--widget-primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }

  .widget-input-area button:hover { background: var(--widget-primary-hover); }
  .widget-input-area button:disabled { opacity: 0.5; cursor: not-allowed; }

  @media (max-width: 440px) {
    .widget-container {
      width: calc(100vw - 16px);
      right: 8px;
      bottom: 80px;
      max-height: calc(100vh - 100px);
    }
  }
`;
