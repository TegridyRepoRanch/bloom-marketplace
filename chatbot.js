/**
 * SiamClones Chat Widget — Self-contained, zero-dependency chat bubble
 * Just add <script src="/chatbot.js"></script> before </body>
 */
(function() {
  'use strict';

  // ── Config ──
  const BRAND = {
    primary: '#2D7D46',
    primaryDark: '#225F35',
    primaryLight: '#E8F5E9',
    dark: '#1A2E1A',
    gray: '#4A5D4A',
    lightGray: '#E0E0D8',
    cream: '#F5F5F0',
    white: '#FFFFFF',
    error: '#E74C3C',
    font: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
  };

  const CONFIG = {
    en: {
      botName: 'SiamClones Assistant',
      welcome: "Hi! 🌿 I'm the SiamClones assistant. Ask me anything about clones, seeds, buds, ordering, or delivery!",
      placeholder: 'Ask about clones, seeds, delivery...',
      suggestions: ['How does ordering work?', 'Is COD available?', 'How long is delivery?'],
      powered: 'Powered by AI',
      typing: 'Thinking...',
      error: 'Something went wrong. Please try again.',
      close: 'Close chat',
      open: 'Chat with us'
    },
    th: {
      botName: 'ผู้ช่วย SiamClones',
      welcome: 'สวัสดีครับ! 🌿 ถามได้เลยเกี่ยวกับกิ่งพันธุ์ เมล็ด ดอก การสั่งซื้อ หรือการจัดส่ง!',
      placeholder: 'ถามเกี่ยวกับกิ่งพันธุ์ เมล็ด การจัดส่ง...',
      suggestions: ['สั่งซื้อยังไง?', 'มีเก็บเงินปลายทางไหม?', 'จัดส่งกี่วัน?'],
      powered: 'ขับเคลื่อนด้วย AI',
      typing: 'กำลังคิด...',
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
      close: 'ปิดแชท',
      open: 'แชทกับเรา'
    }
  };

  // Detect language from localStorage (same key as main app)
  function getLang() {
    try { return localStorage.getItem('siamclones_lang') || 'en'; } catch(e) { return 'en'; }
  }
  function t(key) { return (CONFIG[getLang()] || CONFIG.en)[key] || CONFIG.en[key] || key; }

  // ── State ──
  let isOpen = false;
  let messages = [];
  let isStreaming = false;
  let abortController = null;

  // ── Styles ──
  const STYLES = `
    #sc-chat-fab {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 60px; height: 60px; border-radius: 50%;
      background: ${BRAND.primary}; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(45,125,70,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    #sc-chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(45,125,70,0.5); background: ${BRAND.primaryDark}; }
    #sc-chat-fab svg { width: 28px; height: 28px; fill: white; transition: transform 0.3s ease; }
    #sc-chat-fab.open svg { transform: rotate(90deg); }

    #sc-chat-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 99998;
      width: 380px; max-height: 540px; height: 540px;
      background: ${BRAND.white}; border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.15);
      display: flex; flex-direction: column;
      opacity: 0; transform: translateY(16px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      font-family: ${BRAND.font};
      overflow: hidden;
    }
    #sc-chat-panel.visible {
      opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
    }

    #sc-chat-header {
      background: linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark});
      color: white; padding: 16px 20px; display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    #sc-chat-header .avatar {
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
    }
    #sc-chat-header .info { flex: 1; }
    #sc-chat-header .name { font-weight: 700; font-size: 15px; }
    #sc-chat-header .status { font-size: 12px; opacity: 0.8; }
    #sc-chat-header .close-btn {
      background: rgba(255,255,255,0.15); border: none; color: white; cursor: pointer;
      width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 18px; transition: background 0.2s;
    }
    #sc-chat-header .close-btn:hover { background: rgba(255,255,255,0.3); }

    #sc-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
      scroll-behavior: smooth;
    }
    #sc-chat-messages::-webkit-scrollbar { width: 4px; }
    #sc-chat-messages::-webkit-scrollbar-thumb { background: ${BRAND.lightGray}; border-radius: 4px; }

    .sc-msg { max-width: 85%; animation: sc-fadein 0.25s ease; line-height: 1.55; font-size: 14px; }
    .sc-msg.bot { align-self: flex-start; background: ${BRAND.cream}; color: ${BRAND.dark};
      padding: 10px 14px; border-radius: 2px 16px 16px 16px; }
    .sc-msg.user { align-self: flex-end; background: ${BRAND.primary}; color: white;
      padding: 10px 14px; border-radius: 16px 2px 16px 16px; }
    .sc-msg.bot a { color: ${BRAND.primary}; text-decoration: underline; }
    .sc-msg.bot strong { font-weight: 700; }
    .sc-msg.bot ul, .sc-msg.bot ol { margin: 4px 0; padding-left: 18px; }
    .sc-msg.bot li { margin-bottom: 2px; }
    .sc-msg.bot code { background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 4px; font-size: 13px; }

    .sc-typing { align-self: flex-start; display: flex; gap: 4px; padding: 12px 16px;
      background: ${BRAND.cream}; border-radius: 2px 16px 16px 16px; }
    .sc-typing span { width: 7px; height: 7px; border-radius: 50%; background: ${BRAND.gray};
      animation: sc-bounce 1.2s infinite; opacity: 0.5; }
    .sc-typing span:nth-child(2) { animation-delay: 0.15s; }
    .sc-typing span:nth-child(3) { animation-delay: 0.3s; }

    .sc-suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
    .sc-suggestion {
      background: ${BRAND.primaryLight}; color: ${BRAND.primary}; border: 1px solid rgba(45,125,70,0.2);
      border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer;
      transition: all 0.15s; font-family: ${BRAND.font}; white-space: nowrap;
    }
    .sc-suggestion:hover { background: ${BRAND.primary}; color: white; }

    #sc-chat-input-area {
      display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid ${BRAND.lightGray};
      background: ${BRAND.white}; flex-shrink: 0; align-items: flex-end;
    }
    #sc-chat-input {
      flex: 1; border: 1.5px solid ${BRAND.lightGray}; border-radius: 20px;
      padding: 10px 16px; font-size: 14px; font-family: ${BRAND.font};
      outline: none; resize: none; max-height: 80px; min-height: 20px;
      line-height: 1.4; background: ${BRAND.cream};
      transition: border-color 0.2s;
    }
    #sc-chat-input:focus { border-color: ${BRAND.primary}; background: ${BRAND.white}; }
    #sc-chat-input::placeholder { color: ${BRAND.gray}; opacity: 0.6; }
    #sc-chat-input:disabled { opacity: 0.5; }

    #sc-chat-send {
      width: 40px; height: 40px; border-radius: 50%; background: ${BRAND.primary};
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, transform 0.1s; flex-shrink: 0;
    }
    #sc-chat-send:hover:not(:disabled) { background: ${BRAND.primaryDark}; }
    #sc-chat-send:active:not(:disabled) { transform: scale(0.93); }
    #sc-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
    #sc-chat-send svg { width: 18px; height: 18px; fill: white; }

    #sc-chat-footer {
      text-align: center; padding: 6px; font-size: 11px; color: ${BRAND.gray}; opacity: 0.5;
      flex-shrink: 0;
    }

    @keyframes sc-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes sc-bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-5px); opacity: 1; } }

    @media (max-width: 640px) {
      #sc-chat-panel {
        bottom: 0; right: 0; left: 0; width: 100%; max-height: 100vh; height: 100vh;
        border-radius: 0;
      }
      #sc-chat-fab { bottom: 16px; right: 16px; width: 56px; height: 56px; }
    }
  `;

  // ── DOM Creation ──
  function init() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    // FAB
    const fab = document.createElement('button');
    fab.id = 'sc-chat-fab';
    fab.setAttribute('aria-label', t('open'));
    fab.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>`;
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'sc-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat');
    panel.innerHTML = buildPanelHTML();
    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('sc-chat-send').onclick = sendMessage;
    document.getElementById('sc-chat-input').onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // Auto-resize textarea
    document.getElementById('sc-chat-input').oninput = function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    };

    // Render welcome
    renderMessages();
  }

  function buildPanelHTML() {
    return `
      <div id="sc-chat-header">
        <div class="avatar">🌿</div>
        <div class="info">
          <div class="name">${t('botName')}</div>
          <div class="status">${t('powered')}</div>
        </div>
        <button class="close-btn" onclick="document.getElementById('sc-chat-fab').click()" aria-label="${t('close')}">✕</button>
      </div>
      <div id="sc-chat-messages" aria-live="polite"></div>
      <div id="sc-chat-input-area">
        <textarea id="sc-chat-input" placeholder="${t('placeholder')}" rows="1" aria-label="Message"></textarea>
        <button id="sc-chat-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="sc-chat-footer">${t('powered')}</div>
    `;
  }

  // ── Toggle ──
  function toggleChat() {
    isOpen = !isOpen;
    const panel = document.getElementById('sc-chat-panel');
    const fab = document.getElementById('sc-chat-fab');

    if (isOpen) {
      panel.classList.add('visible');
      fab.classList.add('open');
      fab.setAttribute('aria-label', t('close'));
      // Update header text for current lang
      panel.querySelector('.name').textContent = t('botName');
      setTimeout(() => document.getElementById('sc-chat-input').focus(), 300);
    } else {
      panel.classList.remove('visible');
      fab.classList.remove('open');
      fab.setAttribute('aria-label', t('open'));
    }
  }

  // ── Markdown-lite renderer ──
  function renderMarkdown(text) {
    return text
      // Code blocks
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links — protocol allowlist to prevent javascript: XSS
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, url) {
        const trimmed = url.trim().toLowerCase();
        if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('mailto:')) {
          return '<a href="' + url + '" target="_blank" rel="noopener">' + text + '</a>';
        }
        return text; // Strip unsafe links, keep text
      })
      // Unordered lists
      .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  // ── Render ──
  function renderMessages() {
    const container = document.getElementById('sc-chat-messages');
    if (!container) return;

    let html = '';

    // Welcome message
    html += `<div class="sc-msg bot">${renderMarkdown(t('welcome'))}</div>`;

    // Actual messages
    messages.forEach(m => {
      html += `<div class="sc-msg ${m.role === 'user' ? 'user' : 'bot'}">${
        m.role === 'user' ? escapeHTML(m.content) : renderMarkdown(m.content)
      }</div>`;
    });

    // Typing indicator
    if (isStreaming && (!messages.length || messages[messages.length - 1].role === 'user')) {
      html += `<div class="sc-typing"><span></span><span></span><span></span></div>`;
    }

    container.innerHTML = html;

    // Suggestions (only if no messages yet)
    if (messages.length === 0) {
      const sugDiv = document.createElement('div');
      sugDiv.className = 'sc-suggestions';
      t('suggestions').forEach(q => {
        const chip = document.createElement('button');
        chip.className = 'sc-suggestion';
        chip.textContent = q;
        chip.onclick = () => { sendMessageText(q); };
        sugDiv.appendChild(chip);
      });
      container.appendChild(sugDiv);
    }

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Send Message ──
  function sendMessageText(text) {
    if (!text.trim() || isStreaming) return;
    messages.push({ role: 'user', content: text.trim() });
    isStreaming = true;
    renderMessages();

    const input = document.getElementById('sc-chat-input');
    input.value = '';
    input.style.height = 'auto';
    input.disabled = true;
    document.getElementById('sc-chat-send').disabled = true;

    streamResponse();
  }

  function sendMessage() {
    const input = document.getElementById('sc-chat-input');
    sendMessageText(input.value);
  }

  // ── Stream from API ──
  async function streamResponse() {
    abortController = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          lang: getLang()
        }),
        signal: abortController.signal
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || t('error'));
      }

      if (data.text) {
        messages.push({ role: 'assistant', content: data.text });
      } else {
        throw new Error(t('error'));
      }

    } catch (err) {
      if (err.name === 'AbortError') return;
      // Remove empty bot message if it was added
      if (messages.length && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content) {
        messages.pop();
      }
      messages.push({ role: 'assistant', content: '⚠️ ' + (err.message || t('error')) });
    } finally {
      isStreaming = false;
      abortController = null;
      document.getElementById('sc-chat-input').disabled = false;
      document.getElementById('sc-chat-send').disabled = false;
      renderMessages();
      document.getElementById('sc-chat-input').focus();
    }
  }

  // ── Init on DOM ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
