"use strict";
let cfg = Object.assign({}, DEFAULT);
const $ = id => document.getElementById(id);
function store(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
const draft = store('lk-draft');
if (draft){ cfg = clean(draft.cfg); $('name').value = str(draft.name,24); $('wish').value = str(draft.wish,160); }
for (const g in GROUPS){
for (const key of GROUPS[g]){
const fs=document.createElement('fieldset');
const lg=document.createElement('legend'); lg.textContent=LABELS[key]; fs.appendChild(lg);
const box=document.createElement('div'); box.className='chips'+(SWATCH.has(key)?' swatches':'')+(key==='base'?' thumbs':'');
OPT[key].forEach(([val,label],i)=>{
const id=`o-${key}-${i}`;
const inp=document.createElement('input'); inp.type='radio'; inp.name=key; inp.id=id; inp.value=val; inp.checked=cfg[key]===val;
const lb=document.createElement('label'); lb.htmlFor=id; lb.dataset.k=key; lb.dataset.v=val;
if(SWATCH.has(key)){ lb.style.setProperty('--sw',val); lb.title=label; const sr=document.createElement('span'); sr.className='sr'; sr.textContent=label; lb.appendChild(sr); }
else if(key==='base'){ const th=document.createElement('span'); th.className='th'; th.style.width='100%'; const t=document.createElement('span'); t.textContent=label; lb.append(th,t); }
else lb.textContent=label;
inp.addEventListener('change',()=>{ cfg[key]=val; if(key==='gender'){ cfg=clean(cfg); applyGender(); } renderPreview(); });
box.append(inp,lb);
});
fs.appendChild(box); $(g).appendChild(fs);
}
}
function syncRadios(){ for(const k in OPT){ const el=document.querySelector(`input[name="${k}"][value="${CSS.escape(cfg[k])}"]`); if(el) el.checked=true; } }
function applyGender(){
document.querySelectorAll('.chips label').forEach(lb=>{ const ok=allowed(lb.dataset.k,lb.dataset.v,cfg.gender); lb.hidden=!ok; const inp=document.getElementById(lb.htmlFor); if(inp) inp.disabled=!ok; });
syncRadios();
}
applyGender();
function renderPreview(){
$('pv').innerHTML = `<div class="pvc">${characterSVG(cfg)}</div><div class="pvk">${krathongSVG(cfg)}</div>`;
$('pvName').textContent = $('name').value.trim() || 'ชื่อของคุณ';
$('pvWish').textContent = $('wish').value.trim();
$('wishCount').textContent = $('wish').value.length;
store('lk-draft',{cfg,name:$('name').value,wish:$('wish').value});
if(step===2) refreshThumbs();
}
function refreshThumbs(){
document.querySelectorAll('label[data-k="base"] .th').forEach(th=>{ th.innerHTML=krathongSVG(Object.assign({},cfg,{base:th.parentElement.dataset.v})); });
}
const TITLES=['ชื่อของคุณ','เลือกกระทง','แต่งตัวละคร','คำอธิษฐาน'];
let step=1, autoOpened=false;
function go(n){
step=Math.max(1,Math.min(4,n));
document.querySelectorAll('[data-step]').forEach(el=>{ el.hidden = +el.dataset.step!==step; });
$('stepTitle').textContent=TITLES[step-1];
document.querySelectorAll('.dots span').forEach((d,i)=>d.classList.toggle('on',i<step));
$('pvbox').hidden = step===1; $('prevBtn').hidden = step===1; $('nextBtn').hidden = step===4; $('floatBtn').hidden = step!==4;
if(step===2) refreshThumbs();
document.querySelector('.card-body').scrollTop=0;
}
function openMaker(){ autoOpened=true; $('maker').hidden=false; go(1); setTimeout(()=>{ try{ $('name').focus(); }catch(e){} },60); }
function closeMaker(){ $('maker').hidden=true; }
$('openMaker').addEventListener('click',openMaker);
$('livePill').addEventListener('click',openMaker);
$('editPill').addEventListener('click',openMaker);
$('closeMaker').addEventListener('click',closeMaker);
$('prevBtn').addEventListener('click',()=>go(step-1));
$('maker').addEventListener('click',e=>{ if(e.target===$('maker')) closeMaker(); });
$('name').addEventListener('input',renderPreview);
$('wish').addEventListener('input',renderPreview);
$('randomBtn').addEventListener('click',()=>{
const g=cfg.gender; // keep the chosen gender, randomise the rest
for(const k in OPT){ if(k==='gender') continue; const a=OPT[k].filter(o=>allowed(k,o[0],g)); cfg[k]=a[Math.floor(Math.random()*a.length)][0]; }
syncRadios(); renderPreview(); });
renderPreview();
let boats = new Map();   // id -> {data, el, x, phase, born}
let myId = null, db = null, canWrite = true, online = false;
const layer=$('layer'), river=$('river');
let localMine = null;
function kwidth(){ return Math.max(120, Math.min(230, river.clientWidth*0.3)); }
function wwidth(){ return Math.max(62, Math.min(110, kwidth()*0.46)); }
const GESTURES={wave:'โบกมือ',jump:'กระโดด',dance:'เต้น',wai:'ไหว้'};
const EMOJIS=['❤️','🥰','😊','😂','🎉','✨','🙏','😘'];
function setBoats(list){
const seen=new Set();
list.sort((a,b)=>(a.floatedAt||0)-(b.floatedAt||0));
list.forEach((d,i)=>{
seen.add(d.id);
let b=boats.get(d.id);
if(!b){
const el=document.createElement('button'); el.type='button'; el.className='kt';
el.addEventListener('click',()=>openCard(d.id));
const wk=document.createElement('button'); wk.type='button'; wk.className='walker';
wk.addEventListener('click',()=>openCard(d.id));
layer.append(el,wk);
const fromLeft = i%2===0, W0=river.clientWidth;
b={el, wk, x: fromLeft ? -kwidth() : W0 + 10, wx: fromLeft ? -wwidth()-20 : W0+20, phase: Math.random()*6, sig:'', lastAct: d.act?d.act.t:0,
lastMsgT: (d.msgs&&d.msgs.length) ? d.msgs[d.msgs.length-1].t : 0};
boats.set(d.id,b);
if(online && boats.size>0) setTimeout(()=>burstAt(river.clientWidth*(0.3+Math.random()*0.4)),400);
}
b.data=d; b.order=i;
const sig=JSON.stringify([d.cfg,d.name,d.id===myId]);
if(sig!==b.sig){
b.sig=sig;
b.el.innerHTML = krathongSVG(d.cfg);
b.wk.innerHTML = characterSVG(d.cfg);
const tag=document.createElement('div'); tag.className='tag'; tag.textContent=d.name||'ไม่มีชื่อ';
if(d.id===myId){ const sm=document.createElement('small'); sm.textContent='(คุณ)'; tag.appendChild(sm); }
b.wk.prepend(tag);
b.el.setAttribute('aria-label','กระทงของ '+(d.name||'ไม่มีชื่อ')+' แตะเพื่ออ่านคำอธิษฐาน');
b.wk.setAttribute('aria-label',(d.name||'ไม่มีชื่อ')+' แตะเพื่ออ่านคำอธิษฐาน');
}
// someone else's gesture or emoji arrived
if(d.act && d.act.t && d.act.t!==b.lastAct){ b.lastAct=d.act.t; if(d.id!==myId) playAct(b,d.act); }
// new chat line: speech bubble over their head (and read aloud if turned on)
const last=d.msgs && d.msgs.length ? d.msgs[d.msgs.length-1] : null;
if(last && last.t>b.lastMsgT){ b.lastMsgT=last.t; if(d.id!==myId){ showSay(b,last.text); speakIt(last.text); } }
if(d.id===myId) myMsgs=d.msgs||[];
});
renderLog();
for(const [id,b] of boats){ if(!seen.has(id)){ b.el.remove(); b.wk.remove(); boats.delete(id);} }
$('empty').hidden = boats.size>0;
const mine=list.some(d=>d.id===myId);
$('removeBtn').hidden = !mine;
$('openMaker').hidden = mine; $('actions').hidden = !mine; $('editPill').hidden = !mine;
}
function playAct(b,a){
if(!b||!a) return;
if(a.g && GESTURES[a.g]){
for(const g in GESTURES) b.wk.classList.remove('g-'+g);
void b.wk.offsetWidth;
b.wk.classList.add('g-'+a.g);
clearTimeout(b.gTimer); b.gTimer=setTimeout(()=>b.wk.classList.remove('g-'+a.g),2600);
}
if(a.fw){ // a short fireworks show over the river, seen on both screens
for(let k=0;k<5;k++) setTimeout(()=>{ rockets.push({x:W*(0.15+Math.random()*0.7),y:WATER(),ty:H*(0.08+Math.random()*0.22),loud:true}); try{ sfxWhoosh(.35); }catch(e){} }, k*380);
}
if(typeof a.ln==='string' && a.ln) releaseLantern(b, a.ln.slice(0,80), !!a.tg && boats.size===2);
if(a.e && EMOJIS.includes(a.e)){
const e=document.createElement('span'); e.className='emo'; e.textContent=a.e;
b.wk.appendChild(e); setTimeout(()=>e.remove(),2700);
}
}
let lastSend=0;
function sendAct(a){
const now=Date.now(); if(now-lastSend<700) return; lastSend=now;
a.t=now;
const b=boats.get(myId); playAct(b,a);
netSend({type:'act',act:a});
}
document.querySelectorAll('#actions [data-g]').forEach(btn=>btn.addEventListener('click',()=>sendAct({g:btn.dataset.g})));
document.querySelectorAll('#actions [data-fw]').forEach(btn=>btn.addEventListener('click',()=>sendAct({fw:true})));
document.querySelectorAll('#actions [data-e]').forEach(btn=>btn.addEventListener('click',()=>sendAct({e:btn.dataset.e})));
let myMsgs=[];
function showSay(b,text){
if(!b) return;
b.wk.querySelectorAll('.say').forEach(s=>s.remove());
const s=document.createElement('span'); s.className='say'; s.textContent=text;
b.wk.appendChild(s); setTimeout(()=>s.remove(),7100);
}
function renderLog(){
const rows=[];
for(const b of boats.values()) for(const m of (b.data.msgs||[])) rows.push({t:m.t,text:m.text,name:b.data.name,me:b.data.id===myId});
rows.sort((a,b)=>a.t-b.t);
const log=$('chatLog'); log.textContent='';
rows.slice(-30).forEach(r=>{ const d=document.createElement('div'); d.className='m'+(r.me?' me':''); const n=document.createElement('b'); n.textContent=r.name||'ไม่มีชื่อ'; d.append(n,r.text); log.appendChild(d); });
log.scrollTop=log.scrollHeight;
}
function sendChat(text){
text=String(text||'').trim().slice(0,120); if(!text) return;
const m={text,t:Date.now()}; myMsgs=[...myMsgs,m].slice(-12);
const b=boats.get(myId);
if(b){ b.data.msgs=myMsgs; b.lastMsgT=m.t; showSay(b,text); }
renderLog();
netSend({type:'chat',msg:m}); saveMine();
}
function speakIt(){}
$('chatBtn').addEventListener('click',()=>{
const open=$('chat').hidden; $('chat').hidden=!open; $('chatBtn').setAttribute('aria-expanded',String(open));
if(open){ renderLog(); setTimeout(()=>{ try{ $('chatInput').focus(); }catch(e){} },30); }
});
$('chatForm').addEventListener('submit',e=>{ e.preventDefault(); sendChat($('chatInput').value); $('chatInput').value=''; });
function targets(){
const W=river.clientWidth, kw=kwidth(), n=boats.size, t=[];
if(n===1) t.push(W/2-kw/2);
else if(n===2){ t.push(W/2-kw*0.98); t.push(W/2-kw*0.02); }
else { for(let i=0;i<n;i++) t.push((W-kw)*(i+0.5)/n); }
return t;
}
function walkTargets(){
const W=river.clientWidth, ww=wwidth(), n=boats.size, t=[];
if(n===1) t.push(W/2-ww/2);
else if(n===2){ t.push(W/2-0.405*ww-ww/2); t.push(W/2+0.405*ww-ww/2); } // hands meet in the middle
else { for(let i=0;i<n;i++) t.push((W-ww)*(i+0.5)/n); }
return t;
}
let lastHeart=0;
function tickBoats(now){
const kw=kwidth(), ww=wwidth(), Hh=river.clientHeight;
river.style.setProperty('--kw',kw+'px'); river.style.setProperty('--ww',ww+'px'); river.style.setProperty('--walk',walkH()+'px');
const T=targets(), WT=walkTargets(); let settled=boats.size===2;
for(const b of boats.values()){
const tx=T[b.order] ?? 0, wx=WT[b.order] ?? 0;
b.x += (tx-b.x)*(reduce?1:0.012);
b.wx += (wx-b.wx)*(reduce?1:0.02);
if(Math.abs(tx-b.x)>8 || Math.abs(wx-b.wx)>4) settled=false;
const bob = reduce?0:Math.sin(now/900+b.phase)*5, rot=reduce?0:Math.sin(now/1300+b.phase)*2.5;
b.el.style.transform=`translate(${b.x.toFixed(1)}px,${bob.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
b.wk.style.transform=`translateX(${b.wx.toFixed(1)}px)`;
}
// hold hands once the two of them have walked up to each other
for(const b of boats.values()){
b.wk.classList.toggle('hold-r', settled && b.order===0);
b.wk.classList.toggle('hold-l', settled && b.order===1);
}
$('meet').classList.toggle('on',settled); holdingHands=settled;
if(settled && now-lastHeart>1100 && !reduce){
lastHeart=now;
const h=document.createElement('div'); h.className='heart'; h.textContent='♥';
h.style.left=(river.clientWidth/2-8+(Math.random()*20-10))+'px';
h.style.bottom=(walkH()*0.6+ww*0.75)+'px';
h.style.setProperty('--dx',(Math.random()*50-25)+'px');
h.style.fontSize=(14+Math.random()*10)+'px';
river.appendChild(h); setTimeout(()=>h.remove(),4300);
}
}
function walkH(){ return Math.max(120, river.clientHeight*0.2); }
function openCard(id){
const b=boats.get(id); if(!b) return;
const d=b.data;
$('cWho').textContent=d.name||'ไม่มีชื่อ';
$('cWish').textContent=d.wish||'(ไม่ได้เขียนคำอธิษฐาน)';
$('cWhen').textContent=d.floatedAt?('ลอยเมื่อ '+new Date(d.floatedAt).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})):'';
$('cardBg').hidden=false; $('cClose').focus();
}
$('cClose').addEventListener('click',()=>{$('cardBg').hidden=true;});
$('cardBg').addEventListener('click',e=>{ if(e.target===$('cardBg')) $('cardBg').hidden=true; });
addEventListener('keydown',e=>{ if(e.key==='Escape') $('cardBg').hidden=true; });
let holdingHands=false;
const LANTERN_SVG=`<svg viewBox="0 0 60 78" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="wlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb04a"/><stop offset=".55" stop-color="#ffd27a"/><stop offset="1" stop-color="#fff2c4"/></linearGradient>
<radialGradient id="wlf" cx=".5" cy=".85" r=".6"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
<path d="M12 6 Q30 0 48 6 L54 60 Q30 68 6 60Z" fill="url(#wlg)" stroke="#d9822e" stroke-width="1.2"/>
<path d="M12 6 Q30 0 48 6 L54 60 Q30 68 6 60Z" fill="url(#wlf)"/>
<path d="M21 4 L18 62 M30 2 L30 64 M39 4 L42 62" stroke="#e8964a" stroke-width=".8" opacity=".6"/>
<path d="M8 60 Q30 68 52 60 L50 64 Q30 72 10 64Z" fill="#c9702a"/>
<path d="M30 70 Q34 74 30 78 Q26 74 30 70Z" fill="#fff3c0"/></svg>`;
function releaseLantern(b,text,together){
const ww=wwidth();
const x = together ? river.clientWidth/2 : (b ? b.wx+ww/2 : river.clientWidth/2);
const el=document.createElement('div'); el.className='wl';
el.style.left=x+'px'; el.style.bottom=(walkH()*0.6+ww*1.15)+'px';
el.style.setProperty('--dx',(Math.random()*140-70)+'px');
const sw=document.createElement('div'); sw.className='sway'; sw.innerHTML=LANTERN_SVG;
const t=document.createElement('span'); t.className='lt'; t.textContent=text;
sw.appendChild(t); el.appendChild(sw); river.appendChild(el);
setTimeout(()=>el.remove(),16500);
const lifters = together ? [...boats.values()] : (b?[b]:[]);
lifters.forEach(x=>{ x.wk.classList.add('g-lift'); clearTimeout(x.liftT); x.liftT=setTimeout(()=>x.wk.classList.remove('g-lift'),2200); });
}
$('lanternBtn').addEventListener('click',()=>{
$('lnHelp').textContent = holdingHands ? 'ตอนนี้จับมือกันอยู่ โคมจะลอยขึ้นจากมือของทั้งสองคน 💞' : 'เขียนคำอธิษฐานบนโคม แล้วปล่อยขึ้นฟ้า อีกคนจะเห็นโคมของเราลอยขึ้นไป';
$('lanternBox').hidden=false; setTimeout(()=>{ try{ $('lnWish').focus(); }catch(e){} },40);
});
$('lnClose').addEventListener('click',()=>{ $('lanternBox').hidden=true; });
$('lanternBox').addEventListener('click',e=>{ if(e.target===$('lanternBox')) $('lanternBox').hidden=true; });
$('lanternForm').addEventListener('submit',e=>{
e.preventDefault();
const text=$('lnWish').value.trim().slice(0,80) || 'ขอให้มีความสุข';
$('lanternBox').hidden=true; $('lnWish').value='';
lastSend=0; sendAct({ln:text, tg:holdingHands});
});
