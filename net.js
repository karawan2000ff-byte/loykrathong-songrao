"use strict";
const BPM=74, BEAT=60/BPM;
const MEL=[ // [midi, beats] — 16 bars of 4 beats, Thai pentatonic
[74,1],[76,1],[74,1],[71,1], [69,2],[67,2], [71,1],[74,1],[76,1.5],[79,.5], [76,4],
[79,1],[76,1],[74,1],[76,1], [74,1],[71,1],[69,2], [67,1],[69,1],[71,1],[74,1], [67,4],
[64,1],[67,1],[69,2], [71,1],[69,1],[67,2], [62,1],[64,1],[67,1],[69,1], [71,4],
[74,1.5],[76,.5],[74,1],[71,1], [69,1],[71,1],[67,2], [64,1],[67,1],[69,1],[71,1], [67,4]
];
const CH={G:[55,59,62,67],E:[52,55,59,64],D:[50,57,62,66],A:[57,62,64,69]};
const BARS=['G','G','E','D', 'G','E','D','G', 'E','A','G','D', 'G','E','D','G'];
const mtof=m=>440*Math.pow(2,(m-69)/12);
let actx=null, aout=null, playing=false, sched=null, nextT=0, beatIdx=0, melIdx=0, melT=0;
function setupAudio(){
actx=new (window.AudioContext||window.webkitAudioContext)();
const master=actx.createGain(); master.gain.value=.45;
const comp=actx.createDynamicsCompressor(); master.connect(comp); comp.connect(actx.destination);
const rev=actx.createConvolver(), len=actx.sampleRate*2.8, ir=actx.createBuffer(2,len,actx.sampleRate);
for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2); }
rev.buffer=ir; const wet=actx.createGain(); wet.gain.value=.38; rev.connect(wet); wet.connect(master);
aout={dry:master, rev};
}
function voice(node,send){ node.connect(aout.dry); const s=actx.createGain(); s.gain.value=send; node.connect(s); s.connect(aout.rev); }
function ranad(m,t,vol){
const f=mtof(m), g=actx.createGain();
g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+.9);
[[1,1],[3.93,.28],[9.2,.06]].forEach(([r,a])=>{ const o=actx.createOscillator(), og=actx.createGain(); o.type='sine'; o.frequency.value=f*r; og.gain.value=a; o.connect(og); og.connect(g); o.start(t); o.stop(t+1); });
voice(g,.35);
}
function khlui(m,t,dur){
const f=mtof(m), o=actx.createOscillator(), o2=actx.createOscillator(), lp=actx.createBiquadFilter(), g=actx.createGain(), lfo=actx.createOscillator(), lg=actx.createGain(), g2=actx.createGain();
o.type='triangle'; o.frequency.value=f; o2.type='sine'; o2.frequency.value=f*2; g2.gain.value=.18;
lfo.frequency.value=5.2; lg.gain.setValueAtTime(0,t); lg.gain.linearRampToValueAtTime(f*.007,t+Math.min(.5,dur*.6));
lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
lp.type='lowpass'; lp.frequency.value=2600;
const end=t+dur*BEAT;
g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.16,t+.07); g.gain.setValueAtTime(.14,Math.max(t+.08,end-.12)); g.gain.linearRampToValueAtTime(0,end+.08);
o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g);
[o,o2,lfo].forEach(n=>{ n.start(t); n.stop(end+.1); }); voice(g,.55);
}
function ching(t,open){
const g=actx.createGain(), hp=actx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=4200;
[2680,3720,5130].forEach(fr=>{ const o=actx.createOscillator(); o.type='square'; o.frequency.value=fr; o.connect(hp); o.start(t); o.stop(t+(open?1.3:.15)); });
g.gain.setValueAtTime(open?.045:.035,t); g.gain.exponentialRampToValueAtTime(.0001,t+(open?1.2:.12)); hp.connect(g); voice(g,.3);
}
function klong(t,vol){ const o=actx.createOscillator(), g=actx.createGain(); o.type='sine'; o.frequency.setValueAtTime(118,t); o.frequency.exponentialRampToValueAtTime(48,t+.28);
g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+.55); o.connect(g); o.start(t); o.stop(t+.6); voice(g,.15); }
function bass(m,t){ const o=actx.createOscillator(), g=actx.createGain(); o.type='sine'; o.frequency.value=mtof(m-12);
g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.15,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+BEAT*1.9); o.connect(g); o.start(t); o.stop(t+BEAT*2); voice(g,.2); }
const RPAT=[0,1,2,3,2,1,2,3];
function scheduleBeat(b,t){
const bar=Math.floor(b/4)%16, inBar=b%4, ch=CH[BARS[bar]];
for(let e=0;e<2;e++) ranad(ch[RPAT[(inBar*2+e)%8]]+12,t+e*BEAT/2,e?.06:.09);
if(inBar===0||inBar===2) bass(ch[0],t);
if(inBar===1) ching(t,true); if(inBar===3) ching(t,false);
if(inBar===0) klong(t,.45); if(inBar===2) klong(t+BEAT/2,.3);
}
function scheduler(){
while(nextT<actx.currentTime+.35){
const b=beatIdx%64; if(b===0){ melIdx=0; melT=0; }
scheduleBeat(beatIdx,nextT);
while(melIdx<MEL.length && melT<b+1){ const [m,d]=MEL[melIdx]; if(melT>=b) khlui(m,nextT+(melT-b)*BEAT,d); melT+=d; melIdx++; }
beatIdx++; nextT+=BEAT;
}
}
function setMusicBtn(){ $('musicBtn').setAttribute('aria-pressed',String(playing)); $('musicBtn').textContent = playing ? '♪ ปิดเพลง' : '♪ เพลง'; }
$('musicBtn').addEventListener('click',()=>{
playing=!playing; setMusicBtn();
try{
if(playing){ if(!actx) setupAudio(); actx.resume(); nextT=actx.currentTime+.1; beatIdx=0; melIdx=0; melT=0; clearInterval(sched); sched=setInterval(scheduler,90); scheduler(); }
else { clearInterval(sched); actx && actx.suspend(); }
}catch(e){ playing=false; setMusicBtn(); }
});
const ROOM=(()=>{ let r=(location.hash||'').slice(1).toLowerCase(); if(!/^[a-z0-9]{6,12}$/.test(r)){ r=Math.random().toString(36).slice(2,10).padEnd(8,'x'); history.replaceState(null,'','#'+r); } return r; })();
const CID=(()=>{ let c=store('lk-cid'); if(typeof c!=='string'||!/^[a-z0-9]{6,16}$/.test(c)){ c=Math.random().toString(36).slice(2,12).padEnd(8,'x'); store('lk-cid',c); } return c; })();
myId=CID;
const PID={a:`lkrt2569-${ROOM}-a`, b:`lkrt2569-${ROOM}-b`};
function sanitize(d,id){
if(!d||typeof d!=='object'||typeof d.name!=='string') return null;
const a=(d.act && typeof d.act==='object') ? d.act : null;
const act = a ? {g: GESTURES[a.g] ? a.g : null, e: EMOJIS.includes(a.e) ? a.e : null, fw: a.fw===true, ln: typeof a.ln==='string' ? a.ln.slice(0,80) : null, tg: a.tg===true, t: typeof a.t==='number' ? a.t : 0} : null;
const msgs = Array.isArray(d.msgs) ? d.msgs.filter(m=>m && typeof m.text==='string' && typeof m.t==='number').slice(-12).map(m=>({text:str(m.text,120),t:m.t})) : [];
return {id, name:str(d.name,24), wish:str(d.wish,160), cfg:clean(d.cfg), floatedAt: typeof d.floatedAt==='number'?d.floatedAt:0, act, msgs};
}
let mine=sanitize(store('lk-mine-'+ROOM),CID);
let partner=sanitize(store('lk-partner-'+ROOM),'partner');
let peer=null, conn=null, role=null, partnerOnline=false, idTries=0, micStream=null, outCall=null, inCalls=[];
function saveMine(){ if(mine){ mine.msgs=myMsgs; store('lk-mine-'+ROOM,mine); } }
function savePartner(){ store('lk-partner-'+ROOM,partner); }
function render(){ setBoats([mine,partner].filter(Boolean)); updatePill(); }
function setStatus(kind,parts){
$('status').className='status '+kind;
const el=$('statusText'); el.textContent='';
parts.forEach(p=>{ if(typeof p==='string') el.append(p); else { const b=document.createElement('b'); b.textContent=p.b; el.append(b); } });
}
function updatePill(){
const ready=peer && peer.open;
const kind = partnerOnline ? 'live' : 'warn';
$('livePill').className='pill '+kind;
$('liveText').textContent = partnerOnline ? 'เพื่อนออนไลน์อยู่' : (ready ? 'รอเพื่อนเข้าห้อง…' : 'กำลังเชื่อมต่อ…');
if(partnerOnline) setStatus('live',['เชื่อมต่อกับเพื่อนแล้ว ',{b:'เห็นกันแบบสด'},' กดไมค์ด้านล่างเพื่อคุยกันได้เลย']);
else setStatus('warn',['ห้อง ',{b:ROOM},' · กด 💌 ชวนเพื่อน มุมซ้ายบน แล้วส่งลิงก์ให้อีกคนเปิด']);
}
function netSend(m){ if(conn && conn.open){ try{ conn.send(m); }catch(e){} } }
function otherPid(){ return role==='a' ? PID.b : PID.a; }
function attach(c){
c.on('open',()=>{ conn=c; partnerOnline=true; netSend({type:'state',doc:mine}); if(micStream) callPartner(); render(); });
c.on('data',onData);
c.on('close',()=>{ if(conn===c){ conn=null; partnerOnline=false; setPartnerTalking(false); render(); } });
c.on('error',()=>{});
}
function onData(m){
if(!m||typeof m!=='object') return;
if(m.type==='state'){ partner=sanitize(m.doc,'partner'); savePartner(); render(); }
else if(m.type==='act' && partner && m.act){ const s=sanitize({name:partner.name,act:m.act},'partner'); partner.act=s.act; render(); }
else if(m.type==='chat' && partner && m.msg && typeof m.msg.text==='string'){
partner.msgs=[...(partner.msgs||[]),{text:str(m.msg.text,120),t:typeof m.msg.t==='number'?m.msg.t:Date.now()}].slice(-12); savePartner(); render();
}
else if(m.type==='mic') setPartnerTalking(!!m.on);
}
function startPeer(r){
if(typeof Peer!=='function'){ setStatus('warn',['โหลดระบบเชื่อมต่อไม่ได้ ลองรีเฟรชหน้าเว็บ']); return; }
role=r;
peer=new Peer(PID[r],{debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]}});
peer.on('open',()=>{ idTries=0; updatePill(); tryConnect(); });
peer.on('connection',attach);
peer.on('call',answerCall);
peer.on('disconnected',()=>{ setTimeout(()=>{ if(peer && !peer.destroyed && peer.disconnected) peer.reconnect(); },2500); });
peer.on('error',err=>{
if(err.type==='unavailable-id'){
peer.destroy(); idTries++;
if(r==='a') startPeer('b');
else if(idTries<8) setTimeout(()=>startPeer('a'),3000); // our old tab may still hold the slot for a few seconds
else { $('liveText').textContent='ห้องนี้มีสองคนแล้ว'; setStatus('warn',['ห้องนี้มีสองคนอยู่แล้ว เปิดลิงก์ใหม่โดยลบส่วน #',{b:ROOM},' ออกเพื่อสร้างห้องของตัวเอง']); }
}
updatePill();
});
}
function tryConnect(){ if((conn&&conn.open)||!peer||!peer.open) return; attach(peer.connect(otherPid(),{reliable:true})); }
setInterval(tryConnect,6000);
function setVoiceBtn(on){ const b=$('voiceBtn'); b.setAttribute('aria-pressed',String(on)); b.querySelector('span').textContent=on?'ปิดไมค์':'เปิดไมค์'; const me=boats.get(myId); if(me) me.wk.classList.toggle('talking',on); }
function setPartnerTalking(on){ const p=boats.get('partner'); if(p) p.wk.classList.toggle('talking',on); }
function callPartner(){
if(!micStream||!peer||!peer.open||!partnerOnline) return;
if(outCall){ try{ outCall.close(); }catch(e){} }
outCall=peer.call(otherPid(),micStream);
netSend({type:'mic',on:true});
}
function answerCall(call){
call.answer(); // receive only; we send our own voice on a call of our own
inCalls.push(call);
call.on('stream',st=>{ const a=$('remoteAudio'); a.srcObject=st; a.play().catch(()=>{ $('chatNote').textContent='แตะที่หน้าจอหนึ่งครั้งเพื่อฟังเสียงอีกคน'; }); setPartnerTalking(true); });
call.on('close',()=>{ inCalls=inCalls.filter(c=>c!==call); if(!inCalls.length) setPartnerTalking(false); });
}
document.addEventListener('click',()=>{ const a=$('remoteAudio'); if(a.srcObject && a.paused) a.play().catch(()=>{}); },{capture:true});
$('voiceBtn').addEventListener('click',async()=>{
if(micStream){
micStream.getTracks().forEach(t=>t.stop()); micStream=null;
if(outCall){ try{ outCall.close(); }catch(e){} outCall=null; }
netSend({type:'mic',on:false}); setVoiceBtn(false); return;
}
try{ micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }
catch(e){ $('chat').hidden=false; $('chatNote').textContent='เปิดไมค์ไม่ได้ กดอนุญาตไมโครโฟนในเบราว์เซอร์ก่อนนะ'; return; }
setVoiceBtn(true); callPartner();
if(!partnerOnline){ $('chat').hidden=false; $('chatNote').textContent='ไมค์เปิดแล้ว พอเพื่อนเข้าห้อง เสียงจะต่อให้เอง'; }
});
$('inviteBtn').addEventListener('click',()=>{ $('inviteLink').value=location.href; $('invite').hidden=false; });
$('closeInvite').addEventListener('click',()=>{ $('invite').hidden=true; });
$('invite').addEventListener('click',e=>{ if(e.target===$('invite')) $('invite').hidden=true; });
$('copyLink').addEventListener('click',()=>{
const v=$('inviteLink').value;
const done=()=>{ $('copyLink').textContent='คัดลอกแล้ว ✓'; setTimeout(()=>$('copyLink').textContent='คัดลอกลิงก์',1800); };
if(navigator.clipboard) navigator.clipboard.writeText(v).then(done).catch(()=>{ $('inviteLink').select(); });
else $('inviteLink').select();
});
$('form').addEventListener('submit',e=>{
e.preventDefault();
const name=$('name').value.trim();
if(!name){ go(1); $('name').style.borderColor='#d9677a'; $('name').placeholder='ใส่ชื่อก่อนนะ'; $('name').focus(); return; }
$('name').style.borderColor='';
if(step<4){ go(step+1); return; }
mine={id:CID,name,wish:$('wish').value.trim().slice(0,160),cfg:clean(cfg),floatedAt:Date.now(),act:null,msgs:myMsgs};
saveMine(); render(); netSend({type:'state',doc:mine});
burstAt(W/2); closeMaker();
});
$('removeBtn').addEventListener('click',()=>{ mine=null; store('lk-mine-'+ROOM,null); netSend({type:'state',doc:null}); render(); closeMaker(); });
if(mine){ cfg=clean(mine.cfg); $('name').value=mine.name; $('wish').value=mine.wish; myMsgs=mine.msgs||[]; applyGender(); renderPreview(); }
online=true;
render();
if(!mine) openMaker();
startPeer('a');
addEventListener('hashchange',()=>location.reload());
let sfx=null, noiseBuf=null;
function sfxReady(){
if(!sfx){ try{ sfx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return false; }
noiseBuf=sfx.createBuffer(1,sfx.sampleRate*2,sfx.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
if(sfx.state==='suspended') sfx.resume().catch(()=>{});
return sfx.state!=='closed';
}
addEventListener('pointerdown',()=>sfxReady(),{once:true,capture:true});
function noise(t,dur,type,f0,f1,vol,q){
const n=sfx.createBufferSource(); n.buffer=noiseBuf; n.playbackRate.value=.8+Math.random()*.4;
const fl=sfx.createBiquadFilter(); fl.type=type; fl.Q.value=q||1; fl.frequency.setValueAtTime(f0,t); if(f1) fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
const g=sfx.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
n.connect(fl); fl.connect(g); g.connect(sfx.destination); n.start(t); n.stop(t+dur+.05);
}
function sfxWhoosh(vol){ if(!vol||!sfxReady()) return; const t=sfx.currentTime; noise(t,.9,'bandpass',500,2600,vol*.5,2.5); }
function sfxBoom(vol){
if(!vol||!sfxReady()) return; const t=sfx.currentTime;
noise(t,1.4,'lowpass',900,120,vol,0.7);
const o=sfx.createOscillator(), g=sfx.createGain(); o.frequency.setValueAtTime(90,t); o.frequency.exponentialRampToValueAtTime(38,t+.5);
g.gain.setValueAtTime(vol*.8,t); g.gain.exponentialRampToValueAtTime(.0001,t+.7); o.connect(g); g.connect(sfx.destination); o.start(t); o.stop(t+.75);
for(let i=0;i<14;i++) noise(t+.25+Math.random()*.9,.05,'highpass',3000,0,vol*.35*Math.random(),1); // crackle
}
