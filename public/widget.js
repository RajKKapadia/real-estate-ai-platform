"use strict";(()=>{var C=`
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
`;var y=class{constructor(e){this.apiUrl=e,this.sessionId=this.getStoredSessionId()||this.generateSessionId(),this.storeSessionId(this.sessionId)}getStoredSessionId(){try{return localStorage.getItem(`reai_session_${this.extractBuilderId()}`)}catch{return null}}storeSessionId(e){try{localStorage.setItem(`reai_session_${this.extractBuilderId()}`,e)}catch{}}extractBuilderId(){let e=this.apiUrl.split("/");return e[e.length-1]||"default"}generateSessionId(){return"s_"+Math.random().toString(36).slice(2)+Date.now().toString(36)}async sendMessage(e,r,i,n){try{let t=await fetch(this.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:e.map(l=>({id:l.id,role:l.role,parts:[{type:"text",text:l.content}]})),sessionId:this.sessionId})});if(!t.ok){n(`Error: ${t.status}`);return}let d=t.body?.getReader();if(!d){n("No response stream");return}let S=new TextDecoder,g="";for(;;){let{done:l,value:o}=await d.read();if(l)break;let a=S.decode(o,{stream:!0});g+=a,r(g)}i(g)}catch(t){n(t instanceof Error?t.message:"Connection failed")}}};function k(b){let e=document.createElement("div"),r=e.attachShadow({mode:"open"}),i=document.createElement("style");i.textContent=C,r.appendChild(i);let n=[],t=!1,d=!1,S=new y(b),g='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>',l='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',o=document.createElement("button");o.className="widget-bubble",o.innerHTML=g,o.setAttribute("aria-label","Open chat");let a=document.createElement("div");a.className="widget-container";let w=document.createElement("div");w.className="widget-header",w.innerHTML='<span>Chat with us</span><button aria-label="Close chat">&times;</button>';let u=document.createElement("div");u.className="widget-messages";let f=document.createElement("div");f.className="widget-input-area";let c=document.createElement("input");c.type="text",c.placeholder="Type a message...";let h=document.createElement("button");h.textContent="Send",f.appendChild(c),f.appendChild(h),a.appendChild(w),a.appendChild(u),a.appendChild(f),r.appendChild(o),r.appendChild(a);function m(){u.innerHTML="";for(let p of n){let x=document.createElement("div");x.className=`message ${p.role}`,x.textContent=p.content,u.appendChild(x)}u.scrollTop=u.scrollHeight}function E(){t=!t,a.classList.toggle("open",t),o.innerHTML=t?l:g,o.setAttribute("aria-label",t?"Close chat":"Open chat"),t&&c.focus()}async function I(){let p=c.value.trim();if(!p||d)return;d=!0,h.disabled=!0,c.value="";let x={role:"user",content:p,id:`u_${Date.now()}`};n.push(x);let v={role:"assistant",content:"",id:`a_${Date.now()}`};n.push(v),m(),await S.sendMessage(n.filter(s=>s.role==="user"||s.role==="assistant"&&s.content),s=>{v.content=s,m()},s=>{v.content=s,m(),d=!1,h.disabled=!1},s=>{v.content=`Sorry, something went wrong: ${s}`,m(),d=!1,h.disabled=!1})}o.addEventListener("click",E),w.querySelector("button").addEventListener("click",E),h.addEventListener("click",I),c.addEventListener("keydown",p=>{p.key==="Enter"&&I()}),document.body.appendChild(e)}(function(){let b=document.querySelectorAll("script[data-builder-id]"),e=b[b.length-1];if(!e){console.error("[RealEstateAI] Missing data-builder-id on script tag");return}let r=e.getAttribute("data-builder-id");if(!r){console.error("[RealEstateAI] Empty data-builder-id");return}let i=e.getAttribute("data-api-url");if(!i){let n=e.getAttribute("src")||"";try{i=`${new URL(n,window.location.origin).origin}/api/chat/${r}`}catch{i=`/api/chat/${r}`}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>k(i)):k(i)})();})();
