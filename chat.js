<script>
// chat.js — Sage with Mini-Brain (KB) + namespaced UI + carousels + FormSubmit
document.addEventListener('DOMContentLoaded', () => {
  // clean up any prior widgets
  ['jb-chat-launcher','jb-chat'].forEach(id => { const el=document.getElementById(id); if(el) el.remove(); });

  // === Brain API: your deployed endpoint on Vercel ===
  const BRAIN_API_URL = 'https://jewelbasinins.vercel.app/api/brain';

  // === Styles (scoped to #jb-chat) ===
  const style=document.createElement('style');
  style.textContent = `
    #jb-chat.is-hidden { display:none; }
    #jb-chat-launcher {
      position: fixed; right: 24px; bottom: 24px; z-index: 9999;
      padding: .8rem 1.1rem; border: 0; border-radius: 999px; font-weight: 700;
      background: linear-gradient(90deg,#ffb562,#ff8c60); color:#fff;
      box-shadow: 0 10px 28px rgba(0,0,0,.18); cursor: pointer;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    #jb-chat-launcher:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,0,0,.22); }
    #jb-chat {
      position: fixed; right: 24px; bottom: 24px; z-index: 10000;
      width: min(360px,92vw); max-height: 70vh;
      display: grid; grid-template-rows: auto 1fr auto auto;
      background:#fff; border-radius:16px; overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,.22);
      opacity:1; transform:translateY(0);
      transition: opacity .3s ease, transform .3s ease;
    }
    #jb-chat.fade-out { opacity:0; transform: translateY(20px); }
    #jb-chat .jb-head { position:relative; padding:12px 44px 12px 16px;
      background: linear-gradient(135deg,#0e3a5b,#1a5b87); color:#fff; font-weight:700; }
    #jb-chat .jb-close { position:absolute; top:8px; right:8px; width:32px; height:32px;
      border:0; border-radius:999px; background:rgba(255,255,255,.16); color:#fff; font-size:18px; cursor:pointer; }
    #jb-chat .jb-msgs { padding:.5rem .75rem; overflow:auto; max-height:50vh; }
    #jb-chat .jb-bubble { max-width:80%; padding:.7rem .9rem; border-radius:16px; margin:.35rem 0;
      line-height:1.35; box-shadow:0 2px 10px rgba(0,0,0,.05); }
    #jb-chat .jb-bot { background:#f4f6f8; color:#16324f; display:flex; align-items:flex-start; }
    #jb-chat .jb-user { background:#1d5a98; color:#fff; margin-left:auto; }
    #jb-chat .sage-avatar { width:32px; height:32px; border-radius:50%; overflow:hidden; margin-right:8px; flex-shrink:0;
      box-shadow: 0 0 10px rgba(255,255,255,0.3); animation: sageGlow 3s ease-in-out infinite alternate; }
    #jb-chat .sage-avatar img { width:100%; height:100%; object-fit:cover; }
    @keyframes sageGlow { from{box-shadow:0 0 5px rgba(255,255,255,.2);} to{box-shadow:0 0 15px rgba(255,255,255,.5);} }
    #jb-chat .jb-input { padding:0 .75rem .75rem; }
    #jb-chat .field, #jb-chat textarea, #jb-chat select, #jb-chat input[type="text"],
    #jb-chat input[type="email"], #jb-chat input[type="tel"] {
      width:100%; padding:.65rem .75rem; border:1px solid #d9e2ea; border-radius:10px; font:inherit; outline:none;
    }
    #jb-chat .jb-actions { display:flex; gap:.5rem; justify-content:flex-end; margin-top:.6rem; }
    #jb-chat .btn { border:0; border-radius:12px; padding:.6rem .95rem; font-weight:700; cursor:pointer;
      background: linear-gradient(90deg,#ffb562,#ff8c60); color:#fff; box-shadow: 0 10px 26px rgba(255,140,96,.35);
      transition: transform .15s ease, box-shadow .15s ease; }
    #jb-chat .btn:hover { transform: translateY(-1px); box-shadow:0 14px 30px rgba(255,140,96,.45); }
    #jb-chat .btn-ghost { background:#eef3f8; color:#123; box-shadow:none; }
    #jb-chat .jb-check { display:flex; align-items:flex-start; gap:.5rem; }
    #jb-chat .jb-foot { padding:0 .75rem .9rem; border-top:1px solid #eef3f7; }
    #jb-chat .jb-foot small { color:#5b6e7f; display:block; }
    /* Carousel */
    #jb-chat .jb-carousel { position: relative; width:100%; max-width:560px; }
    #jb-chat .jb-slide { display:none; }
    #jb-chat .jb-slide.active { display:block; animation: jbFade .25s ease; }
    @keyframes jbFade { from{opacity:0; transform:translateY(4px);} to{opacity:1; transform:none;} }
    #jb-chat .jb-nav { display:flex; justify-content:space-between; align-items:center; margin-top:8px; }
    #jb-chat .jb-arrow { border:0; border-radius:10px; padding:.45rem .7rem; cursor:pointer; background:#eef3f8; color:#16324f; font-weight:700; }
    #jb-chat .jb-dots { display:flex; gap:6px; align-items:center; justify-content:center; flex:1; }
    #jb-chat .jb-dot { width:8px; height:8px; border-radius:50%; background:#d3dde7; border:0; }
    #jb-chat .jb-dot.active { background:#1d5a98; }
    #jb-chat .jb-card { border: 1px solid #e6eef6; border-radius:12px; padding:10px; margin:.25rem 0 .5rem; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,.06); }
    #jb-chat .jb-card h4 { margin:0 0 4px; font-size:1rem; color:#0e3a5b; }
    #jb-chat .jb-card p { margin:0 0 8px; color:#3d5368; font-size:.9rem; line-height:1.35; }
    #jb-chat .jb-card .actions { display:flex; gap:8px; flex-wrap:wrap; }
    #jb-chat .jb-card .btn { padding:.45rem .7rem; border-radius:10px; }
    #jb-chat .jb-card .btn-ghost { background:#eef3f8; color:#123; }
  `;
  document.head.appendChild(style);

  // === Launcher + Panel ===
  const launcher=document.createElement('button');
  launcher.id='jb-chat-launcher';
  launcher.textContent="Let’s Chat";
  document.body.appendChild(launcher);

  const panel=document.createElement('div');
  panel.id='jb-chat'; panel.className='is-hidden';
  panel.innerHTML = `
    <div class="jb-head"><strong>JBIS</strong><button class="jb-close" aria-label="Close chat">&times;</button></div>
    <div id="jb-msgs" class="jb-msgs"></div>
    <form id="jb-form" class="jb-input">
      <div id="jb-input"></div>
      <div class="jb-actions">
        <button type="button" id="jb-back" class="btn btn-ghost" disabled>Back</button>
        <button type="submit" id="jb-next" class="btn">Next</button>
      </div>
    </form>
    <div class="jb-foot">
      <small>
        By continuing you agree JBIS may contact you (message/data rates may apply). You can opt out anytime.
        We don’t sell your data; it’s only used for quoting.
        <a href="privacy.html" target="_blank">Privacy Policy</a> &amp; <a href="terms.html" target="_blank">Terms</a>.
      </small>
    </div>`;
  document.body.appendChild(panel);

  // === Refs ===
  const messages=panel.querySelector('#jb-msgs');
  const form=panel.querySelector('#jb-form');
  const inputWrap=panel.querySelector('#jb-input');
  const backBtn=panel.querySelector('#jb-back');
  const nextBtn=panel.querySelector('#jb-next');

  // === Local KB (fallback when brain is unreachable) ===
  const KB = [
    {k:['hours','open','time','when'], a:'I’m available 9–5 MT, and I can schedule after 5 by appointment.'},
    {k:['states','licensed','where','sell','available'], a:'I can help in MT, WA, ID, ND, AZ, and TN.'},
    {k:['contact','phone','call','text'], a:'You can call or text 406-314-7878 or use the form here and I’ll reach out.'},
    {k:['email','mail'], a:'My email is kendalljonesins@outlook.com.'},
    {k:['privacy','sell data','data','sell my info'], a:'I don’t sell your data. Information is used only for quoting and service — you can opt out anytime.'},
    {k:['quote','rate','price','bind','buy now','self quote'], a:'I can start a quick quote here, or you can self-serve for small business with NEXT/Coterie links. I’ll still follow up to confirm discounts.'},
    {k:['commercial','business','llc','contractor'], a:'For small business, I can help directly or you can try the NEXT/Coterie quick quote links. I’ll review if you prefer.'},
    {k:['pet','pets','dog','cat','vet'], a:'For pets, Fetch Pet Insurance is a great option — I can send you my link to get started.'},
    {k:['flood','hurricane','nhc','map'], a:'Flood coverage is separate from homeowners. For Atlantic updates, you can check the NHC site from my Flood page.'},
    {k:['life','mortgage','term','final expense'], a:'I can help with term life, mortgage protection, and more. A few details will let me tailor options.'}
  ];

  const LINKS = {
    NEXT_BIND: 'https://track.nextinsurance.com/links?agent_affiliation=dVEVbUfFPrNPRrRM&serial=992855993&channel=affiliation',
    NEXT_REVIEW: 'https://track.nextinsurance.com/links?agent_affiliation=xX3E6j8HoQF3aATU&serial=992855993&channel=affiliation',
    COTERIE: 'https://app.coterieinsurance.com/quote?p=nussygobyebye%40gmail.com',
    FETCH: 'https://www.fetchpet.com/mypet?a=KendallJonesIns&utm_source=firstconnect&utm_medium=brokerportal&utm_campaign=firstconnect_email&c=firstconnect&p=firstconnect'
  };

  // === Helpers (bot/user bubbles) ===
  const bot = t => {
    const wrap=document.createElement('div'); wrap.className='jb-bubble jb-bot';
    const av=document.createElement('div'); av.className='sage-avatar'; av.innerHTML='<img src="img/sage.jpg" alt="Sage">';
    const msg=document.createElement('div'); msg.textContent=t;
    wrap.appendChild(av); wrap.appendChild(msg);
    messages.appendChild(wrap); messages.scrollTop=messages.scrollHeight;
  };
  const user = t => {
    const d=document.createElement('div'); d.className='jb-bubble jb-user'; d.textContent=t;
    messages.appendChild(d); messages.scrollTop=messages.scrollHeight;
  };
  function isQuestion(txt){ return /[?]|^(who|what|when|where|why|how)\b/i.test(txt.trim()); }
  function answerKB(q){
    const t=q.toLowerCase(); let best=null,score=0;
    KB.forEach(e=>{ const s=e.k.reduce((a,kw)=>a+(t.includes(kw)?1:0),0); if(s>score){score=s; best=e.a;} });
    return score?best:null;
  }

  // === Carousels (Commercial & Pets) ===
  function botCarousel(items=[]){
    const wrap=document.createElement('div'); wrap.className='jb-bubble jb-bot';
    wrap.innerHTML = `<div class="sage-avatar"><img src="img/sage.jpg" alt="Sage"></div>`;
    const car=document.createElement('div'); car.className='jb-carousel';
    const slides=items.map(({title,body,actions=[]},i)=>{
      const s=document.createElement('div'); s.className='jb-slide'+(i===0?' active':'');
      const card=document.createElement('div'); card.className='jb-card';
      card.innerHTML = `<h4>${title}</h4><p>${body}</p><div class="actions"></div>`;
      const row=card.querySelector('.actions');
      actions.forEach(a=>{
        const el=document.createElement(a.href?'a':'button');
        el.className=`btn${a.ghost?' btn-ghost':''}`; el.textContent=a.label;
        if(a.href){ el.href=a.href; el.target='_blank'; el.rel='noopener'; }
        else if(a.onClick){ el.type='button'; el.addEventListener('click',a.onClick); }
        row.appendChild(el);
      });
      s.appendChild(card); return s;
    });
    slides.forEach(s=>car.appendChild(s));
    let ci=0; const nav=document.createElement('div'); nav.className='jb-nav';
    const prev=document.createElement('button'); prev.className='jb-arrow'; prev.textContent='‹';
    const next=document.createElement('button'); next.className='jb-arrow'; next.textContent='›';
    const dots=document.createElement('div'); dots.className='jb-dots';
    const dotEls=items.map((_,i)=>{ const d=document.createElement('button'); d.className='jb-dot'+(i===0?' active':''); d.addEventListener('click',()=>go(i)); return d; });
    dotEls.forEach(d=>dots.appendChild(d));
    function go(n){ slides[ci].classList.remove('active'); dotEls[ci].classList.remove('active'); ci=(n+slides.length)%slides.length;
      slides[ci].classList.add('active'); dotEls[ci].classList.add('active'); }
    prev.addEventListener('click',()=>go(ci-1)); next.addEventListener('click',()=>go(ci+1));
    nav.appendChild(prev); nav.appendChild(dots); nav.appendChild(next);
    car.appendChild(nav); wrap.appendChild(car); messages.appendChild(wrap); messages.scrollTop=messages.scrollHeight;
  }
  function showCommercialOffers(){
    bot('Here are quick self-serve options for small business. Use the arrows to browse, or continue with me.');
    botCarousel([
      { title:'NEXT Insurance — Bind Online', body:'Confident and ready to purchase now? Start a secure quote and bind yourself.',
        actions:[{label:'Open NEXT – Bind Myself',href:LINKS.NEXT_BIND},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}]},
      { title:'NEXT Insurance — Review First', body:'Prefer Kendall to review before binding? Use this link — we’ll confirm discounts.',
        actions:[{label:'Open NEXT – Review First',href:LINKS.NEXT_REVIEW},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}]},
      { title:'Coterie — Quick Business Quote', body:'Fast, modern quoting. Start now — I’ll follow up and make sure it fits.',
        actions:[{label:'Open Coterie Quote',href:LINKS.COTERIE},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}]}
    ]);
  }
  function showPetOffers(){
    bot('Let’s protect your furry family! You can explore an option below or continue with me.');
    botCarousel([
      { title:'Fetch Pet Insurance', body:'Comprehensive coverage for dogs and cats — emergencies, illnesses, more.',
        actions:[{label:'Explore Fetch',href:LINKS.FETCH},{label:'Continue with Sage',ghost:true,onClick:()=>{idx++;renderStep();}}]}
    ]);
  }

  // === Brain call (serverless) ===
  async function askBrain(question){
    if(!BRAIN_API_URL) return null;
    try{
      const r = await fetch(BRAIN_API_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question, session:{ page: location.href } })
      });
      if(!r.ok) return null;
      return await r.json(); // { text, intent, carrier?, link? }
    }catch{return null;}
  }
  function showCarrierFaqCard(carrier, link){
    bot(`${carrier} — official help:`);
    botCarousel([{ title:`${carrier} Support`, body:'FAQs, billing, and claims straight from the carrier.', actions:[{label:'Open Help Center', href:link}] }]);
  }

  // === Dialog flow ===
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
    launcher.hidden=true;
    panel.classList.remove('is-hidden','fade-out');
    messages.innerHTML=''; inputWrap.innerHTML='';
    bot('Hello! I’m Sage 🌿, your digital assistant with Jewel Basin Insurance Solutions.');
    setTimeout(()=>{ bot('We’ll go through a few quick items to start your quote. If you have a question at any time, just type it with a “?” and I’ll answer.'); renderStep(); },700);
  }
  function closeChat(){
    panel.classList.add('fade-out');
    panel.addEventListener('transitionend',()=>{ panel.classList.add('is-hidden'); launcher.hidden=false; },{once:true});
  }

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
    backBtn.disabled=(idx===0);
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
    return v.trim().length>0;
  }

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const v=currentValue();

    // If the user typed a question at any time, try brain -> fallback KB (no state advance)
    if (typeof v === 'string' && isQuestion(v)) {
      user(v);
      const brain = await askBrain(v);
      if (brain && brain.text) {
        bot(brain.text);
        if (brain.intent === 'route_carrier_faq' && brain.link && brain.carrier) { showCarrierFaqCard(brain.carrier, brain.link); return; }
        if (brain.intent === 'route_carrier_quote') {
          if (brain.carrier === 'NEXT' || brain.carrier === 'COTERIE') showCommercialOffers();
          else if (brain.carrier === 'FETCH') showPetOffers();
          return;
        }
        if (brain.intent === 'handoff_human') return;
        return; // answered
      }
      const a = answerKB(v);
      if (a) {
        bot(a);
        if (/commercial|business|contractor/i.test(v)) showCommercialOffers();
        if (/pet|dog|cat/i.test(v)) showPetOffers();
      } else {
        bot('I don’t want to guess. I can have Kendall follow up with a precise answer—shall we finish the quick details?');
      }
      return;
    }

    // Normal progression
    if(!isValid(v)){ bot('Oops — please enter a valid response.'); return; }
    user(typeof v==='string'?v:'✓');
    data[steps[idx].key]=v;

    if(steps[idx].key==='line'){
      if(v==='Commercial'){ showCommercialOffers(); return; }
      if(v==='Pets'){ showPetOffers(); return; }
    }

    if(idx<steps.length-1){ idx++; renderStep(); } else { submitLead(); }
  });

  backBtn.addEventListener('click',()=>{ if(idx===0) return; idx--; renderStep(); });

  function submitLead(){
    bot('Sending your info…');
    const f=new FormData();
    f.append('_subject','New Web Chat Lead');
    f.append('_template','table');
    Object.entries(data).forEach(([k,v])=>f.append(k,v));
    f.append('source_page',location.href);
    fetch('https://formsubmit.co/ajax/kendalljonesins@outlook.com',{method:'POST',body:f})
      .then(()=>{ messages.innerHTML=''; bot('Thank you! I’ve sent your info to Kendall — he’ll follow up soon to go over possible discounts that may apply. It’s been a pleasure assisting you. — Sage 🌿'); inputWrap.innerHTML=''; nextBtn.disabled=true; backBtn.disabled=true; })
      .catch(()=>{ bot('Hmm, I couldn’t send that just now. You can call/text 406-314-7878 or try again in a moment.'); });
  }

  launcher.addEventListener('click',openChat);
  panel.querySelector('.jb-close').addEventListener('click',closeChat);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!panel.classList.contains('is-hidden')) closeChat(); });
});
</script>
