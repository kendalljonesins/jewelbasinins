(() => {
  const launcher = document.getElementById('jb-chat-launcher');
  const panel    = document.getElementById('jb-chat');
  const closeBtn = panel?.querySelector('.jb-chat__close');
  const messages = document.getElementById('jb-chat-messages');
  const form     = document.getElementById('jb-chat-form');
  const inputWrap= document.getElementById('jb-chat-input');
  const backBtn  = document.getElementById('jb-chat-back');
  const nextBtn  = document.getElementById('jb-chat-next');

  if (!launcher || !panel || !messages || !form || !inputWrap) return;

  // Step-by-step prompts
  const steps = [
    { key:'name',   label:'What’s your name?',                       type:'text',     placeholder:'Full name',            validate: v => v.trim().length > 1 },
    { key:'email',  label:'Great — what’s the best email?',          type:'email',    placeholder:'you@email.com',        validate: v => /^\S+@\S+\.\S+$/.test(v) },
    { key:'phone',  label:'And a phone number for quick follow-up?', type:'tel',      placeholder:'406-555-1234',         validate: v => v.replace(/\D/g,'').length >= 10 },
    { key:'line',   label:'Which line are you interested in?',       type:'select',   options:['Auto','Home','Renters','Life','Commercial','Flood','Pets','Other'] },
    { key:'zip',    label:'What ZIP code is this for?',              type:'text',     placeholder:'e.g., 59901',          validate: v => /^\d{5}$/.test(v) },
    { key:'notes',  label:'Anything else I should know?',            type:'textarea', placeholder:'Optional notes' },
    { key:'consent',label:'Please confirm you consent to be contacted. You can opt out anytime.', type:'checkbox', required:true }
  ];

  let i = 0;
  const data = {};

  function bot(txt) {
    const d = document.createElement('div');
    d.className = 'bubble bot';
    d.textContent = txt;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
  }
  function user(txt) {
    const d = document.createElement('div');
    d.className = 'bubble user';
    d.textContent = txt;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
  }

  function openChat() {
    panel.classList.remove('is-hidden');
    panel.setAttribute('aria-hidden', 'false');
    launcher.hidden = true;

    if (!messages.children.length) {
      bot('Hi! I’m Kendall at JBIS. Let’s get you a quick quote.');
      setTimeout(renderStep, 400);
    } else {
      renderStep();
    }
  }
  function closeChat() {
    panel.classList.add('is-hidden');
    panel.setAttribute('aria-hidden', 'true');
    launcher.hidden = false;
  }

  function renderStep() {
    const s = steps[i];
    backBtn.disabled = (i === 0);
    inputWrap.innerHTML = '';
    nextBtn.textContent = (i === steps.length - 1) ? 'Send' : 'Next';

    bot(s.label);

    let el;
    if (s.type === 'select') {
      el = document.createElement('select');
      el.name = s.key;
      el.className = 'field';
      el.innerHTML = `<option value="" disabled selected>Choose one…</option>` +
        s.options.map(o => `<option>${o}</option>`).join('');
    } else if (s.type === 'textarea') {
      el = document.createElement('textarea');
      el.name = s.key;
      el.placeholder = s.placeholder || '';
      el.rows = 3;
      el.className = 'field';
    } else if (s.type === 'checkbox') {
      el = document.createElement('label');
      el.className = 'check';
      el.innerHTML = `<input type="checkbox" name="${s.key}"> <span>I agree</span>`;
    } else {
      el = document.createElement('input');
      el.type = s.type;
      el.name = s.key;
      el.placeholder = s.placeholder || '';
      el.className = 'field';
    }
    inputWrap.appendChild(el);

    const focusEl = el.tagName === 'LABEL' ? el.querySelector('input') : el;
    focusEl && focusEl.focus();
  }

  function currentValue() {
    const s = steps[i];
    if (s.type === 'checkbox') {
      return inputWrap.querySelector('input').checked ? 'Yes' : '';
    }
    const el = inputWrap.querySelector('.field');
    return el ? el.value : '';
  }

  function valid(v) {
    const s = steps[i];
    if (s.type === 'checkbox') return inputWrap.querySelector('input').checked || !s.required;
    if (s.validate) return s.validate(v);
    return v.trim().length > 0;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = currentValue();
    if (!valid(v)) {
      bot('Oops — please enter a valid response.');
      return;
    }
    user(typeof v === 'string' ? v : '✓');
    data[steps[i].key] = v;

    if (i < steps.length - 1) {
      i++;
      renderStep();
    } else {
      submitLead();
    }
  });

  backBtn.addEventListener('click', () => {
    if (i === 0) return;
    i--;
    renderStep();
  });

  launcher.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  function submitLead() {
    bot('Sending your info…');

    // Build a hidden form and post to FormSubmit
    const f = document.createElement('form');
    f.method = 'POST';
    // TODO: replace with your FormSubmit endpoint (email or unique URL)
    f.action = 'https://formsubmit.co/YOUR_EMAIL_OR_ENDPOINT';

    Object.entries(data).forEach(([k, v]) => {
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = k;
      inp.value = v;
      f.appendChild(inp);
    });

    // Helpful extras
    const extras = {
      source: location.href,
      _subject: 'New website chat lead',
      _next: location.origin + '/thanks.html'
    };
    Object.entries(extras).forEach(([k, v]) => {
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = k;
      inp.value = v;
      f.appendChild(inp);
    });

    document.body.appendChild(f);
    f.submit();

    // Optimistic UI
    messages.innerHTML = '';
    bot('Got it! I’ll reach out shortly. You can close this window.');
    inputWrap.innerHTML = '';
    nextBtn.disabled = true;
    backBtn.disabled = true;
  }
})();
