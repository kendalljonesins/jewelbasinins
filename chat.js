// Sage chat — CSS-based version (no inline <style>)
// Adds: Voice-to-Text & Paper-Plane Send, removes Next/Prev buttons
// Relies on styles in styles.css (#jb-chat, #jb-chat-launcher, .jb-chat__header, etc.)

document.addEventListener('DOMContentLoaded', () => {
  // Clean up any legacy instances
  ['jb-chat-launcher','jb-chat'].forEach(id => { const el=document.getElementById(id); if(el) el.remove(); });

  // =========================
  // Panel + launcher
  // =========================
  const launcher=document.createElement('button');
  launcher.id='jb-chat-launcher';
  launcher.textContent='Let\u2019s Chat';
  document.body.appendChild(launcher);

  const panel=document.createElement('div');
  panel.id='jb-chat';
  panel.className='is-hidden';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Quote chat');
  panel.setAttribute('aria-hidden','true');
  panel.innerHTML = `
    <div class="jb-chat__header">
      <strong>JBIS</strong>
      <button class="jb-chat__close" aria-label="Close chat">&times;</button>
    </div>
    <div id="jb-chat-messages" class="jb-chat__messages" aria-live="polite"></div>
    <form id="jb-chat-form" class="jb-chat__input" autocomplete="on">
      <div id="jb-chat-input"></div>
      <div class="jb-chat__actions">
        <button type="button" id="jb-chat-voice" class="btn btn-ghost" aria-label="Start voice input" title="Voice input (press to speak)">🎤</button>
        <button type="submit" id="jb-chat-send" class="btn" aria-label="Send" title="Send">
          <!-- paper plane -->
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 21l20-9L2 3v7l15 2-15 2v7z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </form>
    <div class="jb-chat__footer">
      <small>
        By continuing you agree JBIS may contact you (message/data rates may apply). You can opt out anytime.
        We don’t sell your data; it’s only used for quoting.
        <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>
        &amp; <a href="terms.html" target="_blank" rel="noopener">Terms</a>.
      </small>
    </div>`;
  document.body.appendChild(panel);

  // Refs
  const messages=panel.querySelector('#jb-chat-messages');
  const form=panel.querySelector('#jb-chat-form');
  const inputWrap=panel.querySelector('#jb-chat-input');
  const voiceBtn=panel.querySelector('#jb-chat-voice');
  const sendBtn=panel.querySelector('#jb-chat-send');

  // =========================
  // Inline Knowledge Base
  // =========================
  const KB = [
    { k:['hours','open','time','when'], a:'I’m available 9–5 MT, and I can schedule after 5 by appointment.' },
    { k:['states','licensed','where','sell','available'], a:'I can help in MT, WA, ID, ND, AZ, and TN.' },
    { k:['contact','phone','call','text'], a:'You can call or text 406-314-7878 or use the form here and I’ll reach out.' },
    { k:['email','mail'], a:'My email is kendalljonesins@outlook.com.' },
    { k:['privacy','sell data','data','sell my info'], a:'I don’t sell your data. Info is used only for quoting and service — you can opt out anytime.' },
    { k:['quote','rate','price','bind','buy now','self quote'], a:'We can start a quick quote here, or you can self-serve for small business with the links below. I’ll still follow up to confirm discounts.' },
    { k:['commercial','business','llc','contractor'], a:'For small business, I can help directly or you can use NEXT/Coterie quick-quote links. I’ll review if you prefer.' },
    { k:['pet','pets','dog','cat','vet'], a:'For pets, Fetch Pet Insurance is a great option — I can share the link when you’re ready.' },
    { k:['flood','hurricane','nhc','map'], a:'Flood is separate from homeowners. For Atlantic updates, you can check the NHC site from my Flood page.' },
    { k:['life','mortgage','term','final expense'], a:'I can help with term life, mortgage protection, and more. A few details will let me tailor options.' },
    // Tend / Home Warranty quick reply
    { k:['tend','home warranty','warranty','home protection'],
      a:'If you’re exploring Home Warranty, here’s my Tend referral link: https://partner.mytend.com/first-connect?subproducerID=FC47881' },
    // Arkay / Auto Warranty quick reply
    { k:['arkay','auto warranty','vehicle service contract','vsc','extended warranty'],
      a:'For Auto Warranty (Vehicle Service Contracts), here’s my Arkay referral link: https://arkay.info/FC47881' }
  ];
  function isQuestion(txt){ return /[?]|^(who|what|when|where|why|how)\b/i.test((txt||'').trim()); }
  function answerKB(q){
    if(!q) return null; const t=q.toLowerCase(); let best=null, score=0;
    KB.forEach(entry=>{ const s = entry.k.reduce((acc,kw)=> acc + (t.includes(kw) ? 1 : 0), 0); if(s>score){ score=s; best=entry.a; } });
    return score>0 ? best : null;
  }

  // =========================
  // Avatar + bubbles + carousel helpers
  // =========================
  const avatarHTML = '<div class="sage-avatar"><img src="img/sage.jpg" alt="Sage"><div class="sage-name">Sage</div></div>';

  const bot = t => {
    const wrap=document.createElement('div'); wrap.className='bubble bot';
    const frag=document.createElement('div'); frag.innerHTML=avatarHTML; const av=frag.firstChild; wrap.prepend(av);
    const msg=document.createElement('div'); msg.textContent=t; wrap.appendChild(msg);
    messages.appendChild(wrap); messages.scrollTop=messages.scrollHeight;
  };
  const user = t => { const d=document.createElement('div'); d.className='bubble user'; d.textContent=t; messages.appendChild(d); messages.scrollTop=messages.scrollHeight; };

  function botCarousel(items=[]) {
    const wrap=document.createElement('div'); wrap.className='bubble bot';
    const frag=document.createElement('div'); frag.innerHTML=avatarHTML; wrap.prepend(frag.firstChild);

    const car=document.createElement('div'); car.className='jb-carousel';
    const slides=items.map(({title,body,actions=[]},i)=>{
      const s=document.createElement('div'); s.className='jb-slide'+(i===0?' active':'');
      const card=document.createElement('div'); card.className='jb-card';
      const h4=document.createElement('h4'); h4.textContent=title;
      const p=document.createElement('p'); p.textContent=body;
      const row=document.createElement('div'); row.className='actions';
      actions.forEach(a=>{
        const el=document.createElement(a.href?'a':'button');
        el.className=`btn${a.ghost?' btn-ghost':''}`; el.textContent=a.label;
        if(a.href){ el.href=a.href; el.target='_blank'; el.rel='noopener'; }
        else if(a.onClick){ el.type='button'; el.addEventListener('click',a.onClick); }
        row.appendChild(el);
      });
      card.appendChild(h4); card.appendChild(p); card.appendChild(row); s.appendChild(card); return s;
    });
    slides.forEach(s=>car.appendChild(s));
    let ci=0;
    const nav=document.createElement('div'); nav.className='jb-nav';
    const prev=document.createElement('button'); prev.className='jb-arrow'; prev.textContent='‹';
    const next=document.createElement('button'); next.className='jb-arrow'; next.textContent='›';
    const dots=document.createElement('div'); dots.className='jb-dots';
    const dotEls=items.map((_,i)=>{ const d=document.createElement('button'); d.className='jb-dot'+(i===0?' active':''); d.addEventListener('click',()=>go(i)); return d; });
    dotEls.forEach(d=>dots.appendChild(d));
    function go(n){ slides[ci].classList.remove('active'); dotEls[ci].classList.remove('active'); ci=(n+slides.length)%slides.length; slides[ci].classList.add('active'); dotEls[ci].classList.add('active'); }
    prev.addEventListener('click',()=>go(ci-1)); next.addEventListener('click',()=>go(ci+1));

    nav.appendChild(prev); nav.appendChild(dots); nav.appendChild(next);
    car.appendChild(nav); wrap.appendChild(car);
    messages.appendChild(wrap); messages.scrollTop=messages.scrollHeight;
  }

  function showCommercialOffers(){
    bot('Here are quick self-serve options for small business. Use the arrows to browse, or continue with me.');
    botCarousel([
      { title:'NEXT Insurance — Bind Online', body:'Confident and ready to purchase now? Start a secure quote and bind yourself.', actions:[{label:'Open NEXT – Bind Myself',href:LINKS.NEXT_BIND},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}] },
      { title:'NEXT Insurance — Review First', body:'Prefer Kendall to review before binding? Use this link — we’ll confirm discounts.', actions:[{label:'Open NEXT – Review First',href:LINKS.NEXT_REVIEW},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}] },
      { title:'Coterie — Quick Business Quote', body:'Fast, modern quoting. Start now — I’ll follow up and make sure it fits.', actions:[{label:'Open Coterie Quote',href:LINKS.COTERIE},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}] }
    ]);
  }
  function showPetOffers(){
    bot('Let’s protect your furry family! You can explore an option below or continue with me.');
    botCarousel([
      { title:'Fetch Pet Insurance', body:'Comprehensive coverage for dogs and cats — emergencies, illnesses, more.', actions:[{label:'Explore Fetch',href:LINKS.FETCH},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}] }
    ]);
  }
  // Other Coverage (Home Warranty via Tend + Auto Warranty via Arkay)
  function showOtherOffers(){
    bot('Here are specialty options under Other Coverage. You can explore them now or continue with me.');
    botCarousel([
      { title:'Other Coverage — Home Warranty (Tend)', body:'Tend offers Home Warranty options to help protect key systems and appliances, complementing your homeowners policy.', actions:[{label:'Open Tend — Home Warranty',href:LINKS.TEND},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}] },
      { title:'Other Coverage — Auto Warranty (Arkay)', body:'Arkay offers Auto Warranty (Vehicle Service Contracts) to cover major mechanical breakdowns beyond your standard auto policy.', actions:[{label:'Open Arkay — Auto Warranty',href:LINKS.ARKAY},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}] }
    ]);
  }

  // =========================
  // Self-serve links
  // =========================
  const LINKS = {
    NEXT_BIND:   'https://track.nextinsurance.com/links?agent_affiliation=dVEVbUfFPrNPRrRM&serial=992855993&channel=affiliation',
    NEXT_REVIEW: 'https://track.nextinsurance.com/links?agent_affiliation=xX3E6j8HoQF3aATU&serial=992855993&channel=affiliation',
    COTERIE:     'https://app.coterieinsurance.com/quote?p=nussygobyebye%40gmail.com',
    FETCH:       'https://www.fetchpet.com/mypet?a=KendallJonesIns&utm_source=firstconnect&utm_medium=brokerportal&utm_campaign=firstconnect_email&c=firstconnect&p=firstconnect',
    // Other coverage referrals
    TEND:        'https://partner.mytend.com/first-connect?subproducerID=FC47881',
    ARKAY:       'https://arkay.info/FC47881'
  };

  // =========================
  // Dialog steps
  // =========================
  const steps=[
    { key:'name',   label:'What’s your name?', type:'text',    placeholder:'Full name', validate:v=>v.trim().length>1 },
    { key:'email',  label:'What’s the best email?', type:'email', placeholder:'you@email.com', validate:v=>/^\S+@\S+\.\S+$/.test(v) },
    { key:'phone',  label:'And a phone number?', type:'tel',   placeholder:'406-555-1234', validate:v=>v.replace(/\D/g,'').length>=10 },
    { key:'line',   label:'Which line are you interested in?', type:'select', options:['Auto','Home','Renters','Life','Commercial','Flood','Pets','Other'] },
    { key:'zip',    label:'What ZIP code is this for?', type:'text', placeholder:'e.g., 59901', validate:v=>/^\d{5}$/.test(v) },
    { key:'notes',  label:'Anything else I should know? (You can also ask me a question here.)', type:'textarea', placeholder:'Optional notes or a question' },
    { key:'consent',label:'Please confirm you consent to be contacted (you can opt out anytime).', type:'checkbox', required:true }
  ];
  let idx=0; const data={};

  function openChat(){
    launcher.setAttribute('aria-expanded','true');
    panel.classList.remove('is-hidden');
    panel.setAttribute('aria-hidden','false');
    messages.innerHTML=''; inputWrap.innerHTML='';
    bot('Hello! I’m Sage 🌿, your digital assistant with Jewel Basin Insurance Solutions.');
    setTimeout(()=>{ bot('We’ll go through a few quick items to start your quote. If you have a question at any time, just type it with a “?” and I’ll answer.'); renderStep(); },1500);
  }
  function closeChat(){
    panel.classList.add('is-hidden');
    panel.setAttribute('aria-hidden','true');
    launcher.setAttribute('aria-expanded','false');
  }

  // Render current step
  function renderStep(){
    const s=steps[idx]; inputWrap.innerHTML=''; bot(s.label);
    let el;
    if(s.type==='select'){
      el=document.createElement('select'); el.name=s.key;
      s.options.forEach(o=>{ const opt=document.createElement('option'); opt.value=o; opt.textContent=o; el.appendChild(opt); });
    } else if(s.type==='textarea'){
      el=document.createElement('textarea'); el.name=s.key; el.placeholder=s.placeholder||'';
    } else if(s.type==='checkbox'){
      el=document.createElement('label'); el.className='jb-check';
      el.innerHTML=`<input type="checkbox" name="${s.key}"> <span>I agree</span>`;
    } else {
      el=document.createElement('input'); el.type=s.type; el.name=s.key; el.className='field'; el.placeholder=s.placeholder||'';
    }
    inputWrap.appendChild(el);
    (el.tagName==='LABEL'?el.querySelector('input'):el).focus();
  }

  function currentValue(){
    const s=steps[idx];
    if(s.type==='checkbox') return inputWrap.querySelector('input').checked?'Yes':'';
    const el=inputWrap.querySelector('.field,select,textarea'); return el?el.value:'';
  }
  function isValid(v){
    const s=steps[idx];
    if(s.type==='checkbox') return inputWrap.querySelector('input').checked || !s.required;
    if(s.validate) return s.validate(v);
    return (typeof v==='string' ? v.trim().length>0 : !!v);
  }

  // Voice-to-Text (Web Speech API)
  let recognition=null, listening=false;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('result', (e) => {
      const txt = Array.from(e.results).map(r=>r[0].transcript).join(' ').trim();
      const ctrl = activeControl();
      if (ctrl && (ctrl.tagName === 'INPUT' || ctrl.tagName === 'TEXTAREA')) {
        // Append with a space if needed
        ctrl.value = (ctrl.value ? ctrl.value + ' ' : '') + txt;
        ctrl.focus();
      } else {
        // If we're on a select/checkbox step, show as a user message
        user(txt);
      }
    });
    recognition.addEventListener('end', () => { listening=false; voiceBtn.classList.remove('is-recording'); voiceBtn.title='Voice input (press to speak)'; });
  }
  function activeControl(){
    const s=steps[idx];
    if(s.type==='checkbox') return inputWrap.querySelector('input');
    return inputWrap.querySelector('textarea,select,.field');
  }

  voiceBtn.addEventListener('click', () => {
    if (!recognition) {
      bot('Voice input isn’t supported on this browser. You can type your response instead.');
      return;
    }
    if (listening) {
      recognition.stop();
      return;
    }
    voiceBtn.classList.add('is-recording');
    voiceBtn.title='Listening… click to stop';
    listening = true;
    try { recognition.start(); } catch(_) { /* start can throw if called twice quickly */ }
  });

  // Submit handler (Enter key or plane button)
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const v=currentValue();

    // Q&A path if user typed a question
    if (typeof v === 'string' && isQuestion(v)) {
      user(v);
      const a = answerKB(v);
      if (a) {
        bot(a);
        if (/commercial|business|contractor/i.test(v)) showCommercialOffers();
        if (/pet|dog|cat/i.test(v)) showPetOffers();
        if (/home\s*warranty|tend/i.test(v)) showOtherOffers();
        if (/auto\s*warranty|arkay|vehicle\s*service\s*contract|vsc|extended\s*warranty/i.test(v)) showOtherOffers();
      } else {
        bot('I don’t want to guess. I can have Kendall follow up with a precise answer—shall we finish the quick details?');
      }
      return;
    }

    if(!isValid(v)){ bot('Oops — please enter a valid response.'); return; }
    user(typeof v==='string'?v:'✓');
    data[steps[idx].key]=v;

    if(steps[idx].key==='line'){
      if(v==='Commercial'){ showCommercialOffers(); return; }
      if(v==='Pets'){ showPetOffers(); return; }
      if(v==='Other'){ showOtherOffers(); return; }
    }

    if(idx<steps.length-1){ idx++; renderStep(); } else { submitLead(); }
  });

  function submitLead(){
    bot('Sending your info…');
    // Disable actions while sending
    sendBtn.disabled = true;
    voiceBtn.disabled = true;

    const f=new FormData();
    f.append('_subject','New Web Chat Lead');
    f.append('_template','table');
    Object.entries(data).forEach(([k,v])=>f.append(k,v));
    f.append('source_page',location.href);

    fetch('https://formsubmit.co/ajax/kendalljonesins@outlook.com',{method:'POST',body:f})
      .then(()=>{ messages.innerHTML=''; bot('Thank you! I’ve sent your info to Kendall — he’ll follow up soon to go over possible discounts that may apply. It’s been a pleasure assisting you. — Sage 🌿'); inputWrap.innerHTML=''; })
      .catch(()=>{ bot('Hmm, I couldn’t send that just now. You can call/text 406-314-7878 or try again in a moment.'); })
      .finally(()=>{ sendBtn.disabled=false; voiceBtn.disabled=false; });
  }

  // Open/Close
  launcher.addEventListener('click',()=>{ openChat(); });
  panel.querySelector('.jb-chat__close').addEventListener('click',()=>{ closeChat(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!panel.classList.contains('is-hidden')) closeChat(); });
});
