// --- ensure DOM is ready even if defer is missing ---
(function () {
  function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    const launcher   = document.getElementById('jb-chat-launcher');
    const panel      = document.getElementById('jb-chat');
    const closeBtn   = panel ? panel.querySelector('.jb-chat__close') : null;
    const messages   = document.getElementById('jb-chat-messages');
    const inputWrap  = document.getElementById('jb-chat-input');

    if (!launcher || !panel || !closeBtn || !messages || !inputWrap) {
      console.warn('[JBIS Chat] Missing required elements/ids.');
      return;
    }

    // Basic bubbles
    const bot  = (t)=>{ const p=document.createElement('p'); p.className='jb-bot';  p.textContent=t; messages.appendChild(p); messages.scrollTop=messages.scrollHeight; };
    const user = (t)=>{ const p=document.createElement('p'); p.className='jb-user'; p.textContent=t; messages.appendChild(p); messages.scrollTop=messages.scrollHeight; };

    // Simple “typing” effect
    const say = (t, delay=500)=> new Promise(res=> setTimeout(()=>{ bot(t); res(); }, delay));

    // Form state captured through the flow
    const answers = { };

    // Build inputs per step
    function askName() {
      inputWrap.innerHTML = `
        <label>What’s your name?
          <input type="text" id="jb-name" placeholder="Full name" required />
        </label>
        <button class="btn" id="jb-next">Next</button>
      `;
      document.getElementById('jb-next').onclick = () => {
        const v = document.getElementById('jb-name').value.trim();
        if (!v) return;
        answers.name = v; user(v); askEmail();
      };
    }

    function askEmail() {
      inputWrap.innerHTML = `
        <label>Email
          <input type="email" id="jb-email" placeholder="you@example.com" required />
        </label>
        <button class="btn" id="jb-next">Next</button>
      `;
      document.getElementById('jb-next').onclick = () => {
        const v = document.getElementById('jb-email').value.trim();
        if (!v) return;
        answers.email = v; user(v); askPhone();
      };
    }

    function askPhone() {
      inputWrap.innerHTML = `
        <label>Phone
          <input type="tel" id="jb-phone" placeholder="406-555-1234" required />
        </label>
        <button class="btn" id="jb-next">Next</button>
      `;
      document.getElementById('jb-next').onclick = () => {
        const v = document.getElementById('jb-phone').value.trim();
        if (!v) return;
        answers.phone = v; user(v); askLine();
      };
    }

    function askLine() {
      inputWrap.innerHTML = `
        <label>What do you need?
          <select id="jb-line">
            <option>Home</option>
            <option>Auto</option>
            <option>Renters</option>
            <option>Life</option>
            <option>Commercial</option>
            <option>Flood</option>
            <option>Pets</option>
            <option>Other</option>
          </select>
        </label>
        <button class="btn" id="jb-next">Submit</button>
      `;
      document.getElementById('jb-next').onclick = () => {
        const v = document.getElementById('jb-line').value;
        answers.line = v; user(v); submitLead();
      };
    }

    function submitLead() {
      // Build form for FormSubmit
      const f = document.createElement('form');
      f.style.display = 'none';
      f.method = 'POST';
      f.action = 'https://formsubmit.co/ajax/kendalljonesins@outlook.com';

      // Add captured fields
      const add = (k,v)=>{ const i=document.createElement('input'); i.type='hidden'; i.name=k; i.value=v; f.appendChild(i); };
      Object.entries(answers).forEach(([k,v])=> add(k,v));

      // Helpful extras (no redirect)
      add('source', location.href);
      add('_subject', 'New Web chat lead');

      document.body.appendChild(f);

      // Send async; keep user in chat
      fetch(f.action, { method:'POST', body: new FormData(f) })
        .then(()=> {
          messages.innerHTML = '';
          say('Thank you! I’ve sent your info to Kendall — he’ll follow up soon. It’s been a pleasure assisting you. — Sage 🌿', 400);
          inputWrap.innerHTML = '';
        })
        .catch(()=> {
          bot('Hm, something hiccuped sending that. You can also call/text 406-314-7878 and I’ll log this try for Kendall. — Sage 🌿');
        });
    }

    // Open/close logic
    function openChat() {
      launcher.setAttribute('aria-expanded','true');
      panel.classList.remove('hidden');
      messages.innerHTML = '';
      inputWrap.innerHTML = '';
      say('Hi! I’m Sage, Kendall’s digital assistant. I can grab the basics for a quote and send them straight to him. Ready?', 150)
        .then(askName);
    }
    function closeChat() {
      panel.classList.add('hidden');
      launcher.setAttribute('aria-expanded','false');
    }

    launcher.addEventListener('click', openChat);
    closeBtn.addEventListener('click', closeChat);
  });
})();
