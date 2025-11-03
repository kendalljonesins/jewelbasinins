<script>
/* ===== JBIS Inline Chat Widget – single-file drop-in ===== */
(function initJBISChat(config) {
  const cfg = Object.assign({
    injectStyles: true,
    agency: 'JBIS',
    formEndpoint: 'https://formsubmit.co/kendalljonesins@outlook.com',
    brandColors: {
      headerFrom: '#0e3a5b',
      headerTo:   '#1a5b87'
    }
  }, config || {});

  // --- styles (optional) ---
  if (cfg.injectStyles) {
    const css = `
      .jbis-launcher{position:fixed;right:24px;bottom:24px;z-index:999;border:0;border-radius:999px;
        padding:.8rem 1rem;background:#0e3a5b;color:#fff;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.18);cursor:pointer}
      .jbis-widget{position:fixed;right:24px;bottom:24px;width:340px;max-width:calc(100vw - 32px);background:#fff;border-radius:16px;
        box-shadow:0 18px 60px rgba(0,0,0,.18);overflow:hidden;z-index:1000;opacity:1;transform:translateY(0);
        transition:opacity .3s ease, transform .3s ease}
      .jbis-widget.is-hidden{opacity:0;transform:translateY(20px)}
      .jbis-hidden{display:none!important}
      .jbis-header{position:relative;padding:12px 44px 12px 16px;background:linear-gradient(135deg,${cfg.brandColors.headerFrom},${cfg.brandColors.headerTo});color:#fff;font-weight:700}
      .jbis-close{position:absolute;top:8px;right:8px;width:32px;height:32px;border:0;border-radius:999px;background:rgba(255,255,255,.15);color:#fff;font-size:18px;cursor:pointer}
      .jbis-body{padding:14px 14px 6px 14px;max-height:50vh;overflow:auto}
      .jbis-bubble{background:#f5f7fb;border-radius:12px;padding:10px 12px;margin:8px 0;box-shadow:0 2px 10px rgba(0,0,0,.04)}
      .jbis-input{padding:12px 14px 16px 14px;border-top:1px solid #eef2f6;display:grid;gap:.5rem}
      .jbis-input input,.jbis-input select{width:100%;padding:.65rem .75rem;border:1px solid #d6dee6;border-radius:10px;font:inherit}
      .jbis-row{display:flex;gap:.5rem}
      .jbis-row>*{flex:1}
      .jbis-cta{align-self:end;justify-self:end;border:0;border-radius:12px;padding:.7rem 1rem;background:#1a5b87;color:#fff;font-weight:700;cursor:pointer;
        box-shadow:0 12px 30px rgba(26,91,135,.25)}
      .jbis-footer{padding:6px 14px 14px 14px}
      .jbis-footer small{color:#5f6b78;line-height:1.35}
      .jbis-footer a{color:#1a5b87;text-decoration:underline}
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // --- html ---
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button id="jbis-launcher" class="jbis-launcher" aria-label="Open chat" aria-controls="jbis-widget" aria-expanded="false">
      Let’s chat
    </button>

    <div id="jbis-widget" class="jbis-widget jbis-hidden" role="dialog" aria-modal="true" aria-label="Lead chat">
      <div class="jbis-header">
        <strong>${cfg.agency}</strong>
        <button class="jbis-close" aria-label="Close chat">×</button>
      </div>

      <div id="jbis-body" class="jbis-body" aria-live="polite"></div>

      <div class="jbis-input" id="jbis-input"></div>

      <div class="jbis-footer">
        <small>
          By continuing you agree ${cfg.agency} may contact you about insurance products & services (message/data rates may apply).
          You can opt out anytime. We don’t sell your data; it’s used only to provide quotes.
          See our <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a> and
          <a href="terms.html" target="_blank" rel="noopener">Terms &amp; Conditions</a>.
        </small>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // --- elements ---
  const launcher = document.getElementById('jbis-launcher');
  const panel    = document.getElementById('jbis-widget');
  const bodyEl   = document.getElementById('jbis-body');
  const inputEl  = document.getElementById('jbis-input');
  const closeBtn = panel.querySelector('.jbis-close');

  // --- helpers ---
  function show(el){ el.classList.remove('jbis-hidden'); }
  function hide(el){ el.classList.add('jbis-hidden'); }
  function bubble(html){ const d=document.createElement('div'); d.className='jbis-bubble'; d.innerHTML=html; bodyEl.appendChild(d); bodyEl.scrollTop = bodyEl.scrollHeight; }

  function openChat(){
    hide(launcher);
    show(panel);
    panel.classList.remove('is-hidden');
    launcher.setAttribute('aria-expanded','true');
    // greet once per open
    if (!panel.dataset.greeted){
      bubble(`Hi! I’m Kendall at ${cfg.agency}. Let’s get you a quick quote.`);
      nextStep();
      panel.dataset.greeted = '1';
    }
    // focus the first focusable in input area
    setTimeout(()=> {
      const first = inputEl.querySelector('input,select,button');
      first && first.focus();
    }, 50);
  }

  function closeChat(){
    panel.classList.add('is-hidden');
    panel.addEventListener('transitionend', () => {
      hide(panel);
      show(launcher);
      launcher.setAttribute('aria-expanded','false');
      // reset greet flag so fresh open re-greets
      panel.dataset.greeted = '';
    }, { once:true });
  }

  launcher.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', (e)=> {
    if (e.key === 'Escape' && !panel.classList.contains('jbis-hidden')) closeChat();
  });

  // --- simple flow + submit ---
  const answers = {};
  let step = 0;

  const steps = [
    {
      key: 'name',
      prompt: 'What’s your name?',
      render(){
        inputEl.innerHTML = `
          <input type="text" placeholder="Full name" aria-label="Full name">
          <button class="jbis-cta">Next</button>
        `;
        inputEl.querySelector('.jbis-cta').onclick = () => {
          const v = inputEl.querySelector('input').value.trim();
          if(!v) return inputEl.querySelector('input').focus();
          answers.name = v; bubble(`<strong>Name:</strong> ${v}`); nextStep();
        };
      }
    },
    {
      key: 'email',
      prompt: 'What’s your email?',
      render(){
        inputEl.innerHTML = `
          <input type="email" inputmode="email" placeholder="you@example.com" aria-label="Email">
          <button class="jbis-cta">Next</button>
        `;
        inputEl.querySelector('.jbis-cta').onclick = () => {
          const v = inputEl.querySelector('input').value.trim();
          if(!v) return inputEl.querySelector('input').focus();
          answers.email = v; bubble(`<strong>Email:</strong> ${v}`); nextStep();
        };
      }
    },
    {
      key: 'phone',
      prompt: 'Best phone number?',
      render(){
        inputEl.innerHTML = `
          <input type="tel" inputmode="tel" placeholder="406-555-1234" aria-label="Phone">
          <button class="jbis-cta">Next</button>
        `;
        inputEl.querySelector('.jbis-cta').onclick = () => {
          const v = inputEl.querySelector('input').value.trim();
          if(!v) return inputEl.querySelector('input').focus();
          answers.phone = v; bubble(`<strong>Phone:</strong> ${v}`); nextStep();
        };
      }
    },
    {
      key: 'zip',
      prompt: 'ZIP code of the property/garaging?',
      render(){
        inputEl.innerHTML = `
          <input type="text" inputmode="numeric" maxlength="10" placeholder="ZIP code" aria-label="ZIP">
          <button class="jbis-cta">Next</button>
        `;
        inputEl.querySelector('.jbis-cta').onclick = () => {
          const v = inputEl.querySelector('input').value.trim();
          if(!v) return inputEl.querySelector('input').focus();
          answers.zip = v; bubble(`<strong>ZIP:</strong> ${v}`); nextStep();
        };
      }
    },
    {
      key: 'lob',
      prompt: 'What type of coverage?',
      render(){
        inputEl.innerHTML = `
          <div class="jbis-row">
            <select aria-label="Line of business">
              <option>Home</option>
              <option>Auto</option>
              <option>Life</option>
              <option>Commercial</option>
              <option>Flood</option>
              <option>Pets</option>
              <option>Other</option>
            </select>
            <button class="jbis-cta">Send</button>
          </div>
        `;
        inputEl.querySelector('.jbis-cta').onclick = () => {
          const v = inputEl.querySelector('select').value;
          answers.lob = v; bubble(`<strong>Coverage:</strong> ${v}`);
          submit();
        };
      }
    }
  ];

  function nextStep(){
    const s = steps[step++];
    if (!s) return;
    bubble(s.prompt);
    s.render();
  }

  function submit(){
    bubble('Thanks! Sending your info now — I’ll follow up shortly.');
    inputEl.innerHTML = '';

    // Create and submit a hidden form to FormSubmit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = cfg.formEndpoint;
    form.className = 'jbis-hidden';

    const fields = {
      _subject: 'JBIS Chat Lead',
      _template: 'table',
      Name: answers.name || '',
      Email: answers.email || '',
      Phone: answers.phone || '',
      ZIP: answers.zip || '',
      Coverage: answers.lob || '',
      Source: 'Website Chat'
    };

    Object.entries(fields).forEach(([k,v])=>{
      const inp = document.createElement('input');
      inp.type = 'hidden'; inp.name = k; inp.value = v;
      form.appendChild(inp);
    });

    document.body.appendChild(form);
    form.submit();

    // Reset state for a new session
    step = 0;
    for (const k in answers) delete answers[k];

    // Optionally auto-close after a short moment
    setTimeout(closeChat, 800);
  }

})(/* optional config here */);
</script>
