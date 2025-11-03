// chat.js
document.addEventListener('DOMContentLoaded', () => {
  // ---- create launcher
  const launcher = document.createElement('button');
  launcher.id = 'jb-chat-launcher';
  launcher.type = 'button';
  launcher.className = 'chat-launcher';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.textContent = "Let's Chat";

  // ---- create panel
  const panel = document.createElement('section');
  panel.id = 'jb-chat';
  panel.className = 'chat-widget';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat with Kendall');
  panel.setAttribute('aria-modal', 'false');
  panel.hidden = true; // start hidden

  panel.innerHTML = `
    <div class="jb-chat__header">
      <strong>JBIS</strong>
      <button class="jb-chat__close" type="button" aria-label="Close chat">×</button>
    </div>

    <div class="jb-chat__messages" id="jb-chat-messages" aria-live="polite">
      <div class="jb-bubble jb-bubble--bot">Hi! I’m Kendall at JBIS. Let’s get you set up for a quick quote.</div>
    </div>

    <div class="jb-chat__input" id="jb-chat-input">
      <!-- Keep it simple for now: a single CTA -->
      <form action="https://formsubmit.co/YOUR_EMAIL@EXAMPLE.COM" method="POST" class="jb-chat-form">
        <input type="hidden" name="_subject" value="New Lead from JBIS Chat" />
        <input type="hidden" name="_captcha" value="false" />
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Phone
          <input name="phone" inputmode="tel" />
        </label>
        <label>
          What coverage are you interested in?
          <select name="line">
            <option>Auto</option>
            <option>Home/Renters</option>
            <option>Life</option>
            <option>Commercial</option>
            <option>Flood</option>
            <option>Pets</option>
            <option>Other</option>
          </select>
        </label>
        <button type="submit" class="btn btn-submit">Send</button>
      </form>
    </div>

    <div class="jb-chat__footer">
      <small>
        By continuing you agree JBIS may contact you about insurance products & services
        (message/data rates may apply). You can opt out anytime. We don’t sell your data; it’s only used to provide quotes.
        See our <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a> and
        <a href="terms.html" target="_blank" rel="noopener">Terms &amp; Conditions</a>.
      </small>
    </div>
  `;

  // ---- append to DOM
  document.body.appendChild(panel);
  document.body.appendChild(launcher);

  // ---- open/close logic
  const closeBtn = panel.querySelector('.jb-chat__close');

  function openChat() {
    panel.hidden = false;
    launcher.hidden = true;
  }

  function closeChat() {
    panel.hidden = true;
    launcher.hidden = false;
  }

  launcher.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  // optional: ESC to close
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChat();
  });
});
