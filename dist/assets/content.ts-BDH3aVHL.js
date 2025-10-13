(function(){(()=>{let a=null,o=null,m="system";const l=["Take a deep breath — peace starts here.","You're doing great. Keep going at your own pace.","Silence is strength. Rest your mind for a moment.","Small steps still move you forward.","You've come farther than you think.","Focus on what matters — let go of the noise.","Progress, not perfection.","You deserve a pause — breathe and reset.","Calm is a superpower.","Every moment is a chance to start fresh.","Good things grow slowly.","Your future self will thank you for taking this break.","The best view comes after the hardest climb.","Peace is not a place, it's a practice.","You are enough, exactly as you are.","Recharge, then return stronger.","Be kind to yourself today.","Focus is freedom — distractions can wait.","You control the curtain. You control your time."],x=`
    /* Base styles */
    #curtain-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    #curtain-overlay.hidden {
      display: none;
    }

    #curtain-content {
      text-align: center;
    }

    #curtain-message {
      font-size: 28px;
      text-align: center;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    #curtain-motivation {
      font-size: 16px;
      font-style: italic;
      text-align: center;
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    #curtain-resume-btn {
      border: none;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    /* Docked toggle button */
    #curtain-toggle-btn {
      position: fixed;
      bottom: 0;
      left: 0;
      color: white;
      border: none;
      padding: 12px 16px;
      cursor: pointer;
      z-index: 2147483648;
      transition: transform 0.3s ease, background 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
      border-top-right-radius: 8px;
      transform: translateX(-100%);
    }

    #curtain-toggle-btn:hover,
    #curtain-toggle-btn.visible {
      transform: translateX(0);
    }

    #curtain-toggle-btn img {
      width: 20px;
      height: 20px;
    }

    /* Hover trigger area */
    #curtain-hover-trigger {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 100px;
      z-index: 2147483647;
      pointer-events: auto;
    }

    /* Light theme */
    .theme-light #curtain-overlay {
      background: #f5f5f5;
    }

    .theme-light #curtain-message {
      color: #1a1a1a;
    }

    .theme-light #curtain-motivation {
      color: #666666;
    }

    .theme-light #curtain-resume-btn {
      background: #1a1a1a;
      color: #ffffff;
    }

    .theme-light #curtain-resume-btn:hover {
      background: #333333;
    }

    .theme-light #curtain-toggle-btn {
      background: rgba(0, 0, 0, 0.8);
    }

    .theme-light #curtain-toggle-btn:hover,
    .theme-light #curtain-toggle-btn.visible {
      background: rgba(0, 0, 0, 0.95);
    }

    .theme-light #curtain-toggle-btn img {
      filter: invert(1);
    }

    /* Dark theme */
    .theme-dark #curtain-overlay {
      background: #1a1a1a;
    }

    .theme-dark #curtain-message {
      color: #ffffff;
    }

    .theme-dark #curtain-motivation {
      color: #a0a0a0;
    }

    .theme-dark #curtain-resume-btn {
      background: #e0e0e0;
      color: #1a1a1a;
    }

    .theme-dark #curtain-resume-btn:hover {
      background: #f5f5f5;
    }

    .theme-dark #curtain-toggle-btn {
      background: rgba(255, 255, 255, 0.15);
    }

    .theme-dark #curtain-toggle-btn:hover,
    .theme-dark #curtain-toggle-btn.visible {
      background: rgba(255, 255, 255, 0.25);
    }

    .theme-dark #curtain-toggle-btn img {
      filter: invert(0);
    }

    /* System theme - follows OS preference */
    .theme-system #curtain-overlay {
      background: #f5f5f5;
    }

    .theme-system #curtain-message {
      color: #1a1a1a;
    }

    .theme-system #curtain-motivation {
      color: #666666;
    }

    .theme-system #curtain-resume-btn {
      background: #1a1a1a;
      color: #ffffff;
    }

    .theme-system #curtain-resume-btn:hover {
      background: #333333;
    }

    .theme-system #curtain-toggle-btn {
      background: rgba(0, 0, 0, 0.8);
    }

    .theme-system #curtain-toggle-btn:hover,
    .theme-system #curtain-toggle-btn.visible {
      background: rgba(0, 0, 0, 0.95);
    }

    .theme-system #curtain-toggle-btn img {
      filter: invert(1);
    }

    @media (prefers-color-scheme: dark) {
      .theme-system #curtain-overlay {
        background: #1a1a1a;
      }

      .theme-system #curtain-message {
        color: #ffffff;
      }

      .theme-system #curtain-motivation {
        color: #a0a0a0;
      }

      .theme-system #curtain-resume-btn {
        background: #e0e0e0;
        color: #1a1a1a;
      }

      .theme-system #curtain-resume-btn:hover {
        background: #f5f5f5;
      }

      .theme-system #curtain-toggle-btn {
        background: rgba(255, 255, 255, 0.15);
      }

      .theme-system #curtain-toggle-btn:hover,
      .theme-system #curtain-toggle-btn.visible {
        background: rgba(255, 255, 255, 0.25);
      }

      .theme-system #curtain-toggle-btn img {
        filter: invert(0);
      }
    }
  `;function k(e){if(!o)return;m=e;const t=o.querySelector('div[class*="theme-"]');t&&(t.classList.remove("theme-light","theme-dark","theme-system"),t.classList.add(`theme-${e}`))}function f(){if(document.getElementById("curtain-shadow-host"))return;const e=document.createElement("div");e.id="curtain-shadow-host",e.style.cssText="all: initial; position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;",o=e.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=x,o.appendChild(t);const n=document.createElement("div");n.classList.add(`theme-${m}`);const i=document.createElement("div");i.id="curtain-overlay",i.className="hidden",i.style.pointerEvents="auto";const r=document.createElement("div");r.id="curtain-content";const c=document.createElement("div");c.id="curtain-message",c.textContent="This site is blocked";const w=document.createElement("br");c.appendChild(w);const C=document.createTextNode("so you can focus on your work");c.appendChild(C);const h=document.createElement("div");h.id="curtain-motivation";const B=l[Math.floor(Math.random()*l.length)];h.textContent=B;const d=document.createElement("button");d.id="curtain-resume-btn",d.textContent="Resume",d.addEventListener("click",()=>{g()}),r.appendChild(c),r.appendChild(h),r.appendChild(d),i.appendChild(r),n.appendChild(i),o.appendChild(n),document.documentElement.appendChild(e)}function v(e){const t=document.createElement("img");return t.src=chrome.runtime.getURL(e),t.alt="Toggle",t}function b(){if(!o||o.getElementById("curtain-toggle-btn"))return;const e=o.querySelector('div[class*="theme-"]');if(!e)return;const t=document.createElement("div");t.id="curtain-hover-trigger",t.style.pointerEvents="auto";const n=document.createElement("button");n.id="curtain-toggle-btn",n.style.pointerEvents="auto",n.appendChild(v("icons/hidden-48.png")),t.addEventListener("mouseenter",()=>{n.classList.add("visible")}),t.addEventListener("mouseleave",()=>{n.classList.remove("visible")}),n.addEventListener("mouseenter",()=>{n.classList.add("visible")}),n.addEventListener("mouseleave",()=>{n.classList.remove("visible")}),e.appendChild(t),e.appendChild(n),n.addEventListener("click",()=>{g()})}function u(e,t){e.textContent="";try{e.appendChild(v(t))}catch{e.textContent="👁️"}}function E(){if(!o)return;const e=o.getElementById("curtain-motivation");if(e){const t=l[Math.floor(Math.random()*l.length)];e.textContent=t}}function y(){if(!o)return;a=!0;const e=o.getElementById("curtain-overlay"),t=o.getElementById("curtain-toggle-btn");E(),e&&e.classList.remove("hidden"),t&&u(t,"icons/visible-48.png"),document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden";try{chrome.runtime.sendMessage({action:"setState",url:window.location.href,state:!0,mute:!0})}catch{console.log("Curtains: Extension context invalidated, please reload the page")}}function s(e){if(!o)return;a=!1;const t=o.getElementById("curtain-overlay"),n=o.getElementById("curtain-toggle-btn");if(t&&t.classList.add("hidden"),n&&u(n,"icons/hidden-48.png"),document.documentElement.style.overflow="",document.body.style.overflow="",!e)try{chrome.runtime.sendMessage({action:"setState",url:window.location.href,state:!1,mute:!1})}catch{console.log("Curtains: Extension context invalidated, please reload the page")}}function g(){a===!0?s():y()}function p(){try{chrome.runtime.sendMessage({action:"getTheme"},e=>{e&&e.theme&&(m=e.theme),f(),b(),chrome.runtime.sendMessage({action:"getState",url:window.location.href},t=>{if(chrome.runtime.lastError){console.log("Curtains: Extension context invalidated, defaulting to visible"),s(!0);return}t&&t.state!==void 0?(a=t.state,a?y():s(!0)):s(!0)})})}catch{console.log("Curtains: Extension context invalidated, defaulting to visible"),f(),b(),s(!0)}}chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.action==="toggleCurtain")return g(),n({success:!0}),!0;if(e.action==="updateState"){if(!o){n({success:!1});return}a=e.state;const i=o.getElementById("curtain-overlay"),r=o.getElementById("curtain-toggle-btn");return a?(i&&i.classList.remove("hidden"),r&&u(r,"icons/visible-48.png"),document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden"):(i&&i.classList.add("hidden"),r&&u(r,"icons/hidden-48.png"),document.documentElement.style.overflow="",document.body.style.overflow=""),n({success:!0}),!0}else{if(e.action==="updateTheme")return e.theme?(k(e.theme),n({success:!0})):n({success:!1}),!0;if(e.action==="updateButtonPosition"){if(!o)return n({success:!1}),!0;const i=o.getElementById("curtain-toggle-btn");return i&&(i.className=`position-${e.position}`),n({success:!0}),!0}}return!0}),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",p):p()})();
})()
