// chat.js — single-file conversational chat widget for JBIS
document.addEventListener('DOMContentLoaded', () => {
  // --- remove any previous duplicates (safety)
  ['jb-chat-launcher','jb-chat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // --- inject styles (namespaced)
  const style = document.createElement('style');
  style.textContent = `
    #jb-chat.is-hidden { display:none; }
    #jb-chat-launcher {
      position: fixed; right: 24px; bottom: 24px; z-index: 9999;
      padding: .8rem 1.1rem; border: 0; border-radius: 999px; font-weight: 700; cursor: pointer;
      background: linear-gradient(90deg, #ffb562, #ff8c60); color: #fff;
      box-shadow: 0 10px 28px rgba(0,0,0,.18); transition: transform .2s ease, box-shadow .2s ease;
    }
    #jb-chat-launcher:hover{ transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,0,0,.22); }
    #jb-chat {
      position: fixed; right: 24px; bottom: 24px; z-index: 10000;
      width: min(360px, 92vw); max-height: 70vh;
      display: grid; grid-template-rows: auto 1fr auto auto; gap: .5rem;
      background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.22);
      opacity: 1; transform: translateY(0); transition: opacity .3s ease, transform .3s ease;
      overflow: hidden;
    }
    #jb-chat.fade-out { opacity: 0; transform: translateY(20px); }
    .jb-chat__header{
      position:relative; padding:12px 44px 12px 16px;
      background: linear-gradient(135deg,#0e3a5b,#1a5b87); color:#fff; font-weight:700;
    }
    .jb-chat__close{
      position:absolute; top:8px; right:8px; width:32px; height:32px; border:0; border-radius:999px;
      background: rgba(255,255,255,.16); color:#fff; font-size:18px; cursor:pointer;
    }
    .jb-chat__messages{ padding:.5rem .75rem; overflow:auto; max-height:50vh; }
    .bubble{ max-width:80%; padding:.7rem .9rem; border-radius:16px; margin:.35rem 0; line-height:1.35; box-shadow:0 2px 10px rgba(0,0,0,.05); }
    .bubble.bot{ background:#f4f6f8; color:#16324f; }
    .bubble.user{ background:#1d5a98; color:#fff; margin-left:auto; }
    .jb-chat__input{ padding:0 .75rem .75rem; }
    .field, .jb-chat__input textarea, .jb-chat__input select, .jb-chat__input input{
      width:100%; padding:.65rem .75rem; border:1px solid #d9e2ea; border-radius:10px; font:inherit; outline:none;
    }
    .jb-chat__actions{ display:flex; gap:.5rem; justify-content:flex-end; margin-top:.6rem; }
    #jb-chat .btn{ border:0; border-radius:12px; padding:.6rem .95rem; font-weight:700; cursor:pointer;
      background: linear-gradient(90deg,#ffb562,#ff8c60); color:#fff; box-shadow:0 10px 26px rgba(255,140,96,.35); }
    #jb-chat .btn:hover{ transform: translateY(-1px); box-shadow: 0 14px 30px rgba(255,140,96,.45); }
    #jb-chat .btn-ghost{ background:#eef3f8; color:#123; box-shadow:none; }
    .check{ display:flex; align-items:flex-start; gap:.5rem; }
    .jb-chat__footer{ padding:0 .75rem .9rem; border-top:1px solid #eef3f7; }
    .jb-chat__footer small{ color:#5b6e7f; display:block; }
  `;
  document.head.appendChild(style);

  // --- inject launcher
  const launcher = document.createElement('button');
  launcher.id = 'jb-chat-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-controls','jb-chat');
  launcher.setAttribute('aria-expanded','false');
  launcher.textContent = "Let’s Chat";
  document.body.appendChild(launcher);

  // --- inject panel
  const panel = document.createElement('div');
  panel.id = 'jb-chat';
  panel.className = 'is-hidden';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Quote chat');
  panel.setAttribute('aria-hidden','true');
  panel.innerHTML = `
    <div class="jb-chat__header">
      <strong>JBIS</strong>
      <button class="jb-chat__close" aria-label="Close chat">&times;</button>
    </div>
    <div id="jb-chat-messages" class="jb-chat__messages"></div>
    <form id="jb-chat-form" class="jb-chat__input" autocomplete="on">
      <div id="jb-chat-input"></div>
      <div class="jb-chat__actions">
        <button type="button" id="jb-chat-back" class="btn btn-ghost" disabled>Back</button>
        <button type="submit" id="jb-chat-next" class="btn">Next</button>
      </div>
    </form>
    <div class="jb-chat__footer">
      <small>
        By continuing you agree JBIS may contact you about insurance products and services (message/data rates may apply).
        You can opt out anytime. We don’t sell your data; it’s used only to provide quotes.
        See our <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a> and
        <a href="terms.html" target="_blank" rel="noopener">Terms &amp; Conditions</a>.
      </small>
    </div>
  `;
  document.body.appendChild(panel);

  // --- elements
  const closeBtn = panel.querySelector('.jb-chat__close');
  const messages = panel.querySelector('#jb-chat-messages');
  const form     = panel.querySelector('#jb-chat-form');
  const inputWrap= panel.querySelector('#jb-chat-input');
  const backBtn  = panel.querySelector('#jb-chat-back');
  const nextBtn  = panel.querySelector('#jb-chat-next');

  // --- helpers
  const bot = (t) => { const d=document.createElement('div'); d.className='bubble bot'; d.textContent=t; messages.appendChild(d); messages.scrollTop=messages.scrollHeight; };
  const user= (t) => { const d=document.createElement('div'); d.className='bubble user'; d.textContent=t; messages.appendChild(d); messages.scrollTop=messages.scrollHeight; };

  function openChat(){
    launcher.setAttribute('aria-expanded','true');
    launcher.hidden = true;
    panel.classList.remove('is-hidden','fade-out');
    panel.setAttribute('aria-hidden','false');
    if (!messages.dataset.greeted){
      
bot('Hello! I’m Sage, your digital assistant with Jewel Basin Insurance Solutions.');
setTimeout(() => bot('Let’s go through a few quick questions to get your quote started.'), 900);

      messages.dataset.greeted = '1';
    } else {
      renderStep();
    }
  }
  function closeChat(){
    panel.classList.add('fade-out');
    panel.addEventListener('transitionend', () => {
      panel.classList.add('is-hidden');
      panel.setAttribute('aria-hidden','true');
      launcher.hidden = false;
      launcher.setAttribute('aria-expanded','false');
    }, { once:true });
  }

  launcher.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !panel.classList.contains('is-hidden')) closeChat(); });

function resetChatSoft() {
  // clear state & UI
  i = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  messages.innerHTML = '';
  inputWrap.innerHTML = '';
  nextBtn.disabled = false;
  backBtn.disabled = false;

  // Sage reintroduces herself in a natural, human tone
  bot("Hi again! Sage here — looks like we’ve already chatted a bit. Would you like to start another quote or explore a different coverage option?");
  
  const restart = document.createElement('button');
  restart.type = 'button';
  restart.className = 'btn btn-primary';
  restart.textContent = 'Start a new quote';
  restart.addEventListener('click', () => {
    messages.innerHTML = '';
    inputWrap.innerHTML = '';
    nextStep(); // kicks off the first question again
  });
  inputWrap.appendChild(restart);
}

  // --- conversational flow
  const steps = [
    { key:'name',   label:'What’s your name?',                       type:'text',     placeholder:'Full name',            validate:v=>v.trim().length>1 },
    { key:'email',  label:'Great — what’s the best email?',          type:'email',    placeholder:'you@email.com',        validate:v=>/^\S+@\S+\.\S+$/.test(v) },
    { key:'phone',  label:'And a phone number for quick follow-up?', type:'tel',      placeholder:'406-555-1234',         validate:v=>v.replace(/\D/g,'').length>=10 },
    { key:'line',   label:'Which line are you interested in?',       type:'select',   options:['Auto','Home','Renters','Life','Commercial','Flood','Pets','Other'] },
    { key:'zip',    label:'What ZIP code is this for?',              type:'text',     placeholder:'e.g., 59901',          validate:v=>/^\d{5}$/.test(v) },
    { key:'notes',  label:'Anything else I should know?',            type:'textarea', placeholder:'Optional notes' },
    { key:'consent',label:'Please confirm you consent to be contacted. You can opt out anytime.', type:'checkbox', required:true }
  ];
  let idx = 0;
  const data = {};

  function renderStep(){
    const s = steps[idx];
    backBtn.disabled = (idx===0);
    nextBtn.textContent = (idx===steps.length-1) ? 'Send' : 'Next';
    inputWrap.innerHTML = '';
    bot(s.label);

    let el;
    if (s.type==='select'){
      el=document.createElement('select'); el.name=s.key; el.className='field';
      el.innerHTML = `<option value="" disabled selected>Choose one…</option>` + s.options.map(o=>`<option>${o}</option>`).join('');
    } else if (s.type==='textarea'){
      el=document.createElement('textarea'); el.name=s.key; el.className='field'; el.rows=3; el.placeholder=s.placeholder||'';
    } else if (s.type==='checkbox'){
      el=document.createElement('label'); el.className='check';
      el.innerHTML = `<input type="checkbox" name="${s.key}"> <span>I agree</span>`;
    } else {
      el=document.createElement('input'); el.type=s.type; el.name=s.key; el.className='field'; el.placeholder=s.placeholder||'';
    }
    inputWrap.appendChild(el);
    const focusEl = el.tagName==='LABEL' ? el.querySelector('input') : el;
    focusEl && focusEl.focus();
  }

  function currentValue(){
    const s = steps[idx];
    if (s.type==='checkbox') return inputWrap.querySelector('input').checked ? 'Yes' : '';
    const el = inputWrap.querySelector('.field'); return el ? el.value : '';
  }

  function isValid(v){
    const s = steps[idx];
    if (s.type==='checkbox') return inputWrap.querySelector('input').checked || !s.required;
    if (s.validate) return s.validate(v);
    return v.trim().length>0;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const v = currentValue();
    if (!isValid(v)){ bot('Oops — please enter a valid response.'); return; }
    user(typeof v==='string' ? v : '✓');
    data[steps[idx].key] = v;

    if (idx < steps.length-1){ idx++; renderStep(); }
    else { submitLead(); }
  });

  backBtn.addEventListener('click', ()=>{
    if (idx===0) return;
    idx--; renderStep();
  });

  function submitLead(){
    bot('Sending your info…');

    const f = document.createElement('form');
    f.method = 'POST';
f.action = 'https://formsubmit.co/ajax/kendalljonesins@outlook.com';

    const payload = {
      _subject: 'New Web Chat Lead',
      _template: 'table',
      name: data.name||'',
      email: data.email||'',
      phone: data.phone||'',
      line: data.line||'',
      zip: data.zip||'',
      notes: data.notes||'',
      source_page: location.href
    };
    Object.entries(payload).forEach(([k,v])=>{
      const i=document.createElement('input');
      i.type='hidden'; i.name=k; i.value=v; f.appendChild(i);
    });

    // send via AJAX so we stay on the same page
fetch(f.action, {
  method: "POST",
  body: new FormData(f)
}).then(() => {
  messages.innerHTML = '';
bot('Thank you! I’ve sent your info to Kendall — he’ll follow up soon to go over possible discounts that may apply to you. It’s been a pleasure assisting you. — Sage 🌿');
  inputWrap.innerHTML = '';
  nextBtn.disabled = true;
  backBtn.disabled = true;
setTimeout(resetChatSoft, 5000);
});
return;

  }
});
