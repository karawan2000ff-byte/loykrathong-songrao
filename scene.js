"use strict";
const cv=$('sky'), ctx=cv.getContext('2d');
let W=0,H=0,DPR=1, stars=[], lanterns=[], sparks=[], rockets=[], waves=[], bank=null, clouds=null;
// One long panorama the krathongs drift past, looping: riverside cathedral → night market → Kung Wiman beach
const PLACES=[['river','ริมแม่น้ำจันทบุรี'],['market','ตลาดเซนทริค'],['beach','หาดคุ้งวิมาน']];
let strip=null, STEP=1, LOOP=1, VW=0, pan=0, lastNow=0, placeShown='';
function resize(){
DPR=Math.min(2,devicePixelRatio||1); W=river.clientWidth; H=river.clientHeight;
cv.width=W*DPR; cv.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
stars=Array.from({length:Math.round(W*H/2600)},()=>({x:Math.random()*W,y:Math.random()*H*0.5,r:Math.random()*1.3+.2,p:Math.random()*6}));
waves=Array.from({length:46},()=>({x:Math.random()*W,y:H*0.53+Math.random()*H*0.47,l:10+Math.random()*40,s:.1+Math.random()*.25}));
// thin twilight clouds: purple-grey tops lit warm from below by the set sun
clouds=document.createElement('canvas'); clouds.width=Math.ceil(W*DPR); clouds.height=Math.ceil(H*0.52*DPR);
const cc=clouds.getContext('2d'); cc.setTransform(DPR,0,0,DPR,0,0); const cwy=H*0.52;
for(let i=0;i<34;i++){
const y=cwy*(0.32+Math.pow(Math.random(),.7)*0.6), x=Math.random()*W, len=(120+Math.random()*320)*Math.max(.6,W/1200), th=4+Math.random()*12;
const low=(y/cwy-0.32)/0.6; // 0 high .. 1 near the horizon
cc.save(); cc.translate(x,y); cc.scale(1,th/len*3);
const g=cc.createRadialGradient(0,0,0,0,0,len/2);
const a=.22+Math.random()*.25;
g.addColorStop(0,low>.5?`rgba(255,196,170,${a})`:`rgba(160,130,190,${a})`); g.addColorStop(1,'rgba(160,130,190,0)');
cc.fillStyle=g; cc.beginPath(); cc.arc(0,0,len/2,0,7); cc.fill(); cc.restore();
cc.strokeStyle=`rgba(255,${200+Math.round(low*30)},${170+Math.round(low*20)},${.25+low*.35})`; cc.lineWidth=1.2;
cc.beginPath(); cc.moveTo(x-len*.38,y+th*.45); cc.quadraticCurveTo(x,y+th*.75,x+len*.38,y+th*.45); cc.stroke();
}
buildBank();
}
addEventListener('resize',resize); resize();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(buildBank);
const WATER=()=>H*0.52;
let moonCv=null, moonR=0;
function buildMoon(r){
moonR=Math.round(r); const S=Math.ceil(r*2*DPR); moonCv=document.createElement('canvas'); moonCv.width=moonCv.height=S;
const m=moonCv.getContext('2d'); m.scale(S/(2*r),S/(2*r));
m.save(); m.beginPath(); m.arc(r,r,r,0,7); m.clip();
let g=m.createRadialGradient(r*.8,r*.75,r*.1,r,r,r); g.addColorStop(0,'#fffef6'); g.addColorStop(.6,'#fff2d2'); g.addColorStop(1,'#f0d7a4');
m.fillStyle=g; m.fillRect(0,0,2*r,2*r);
let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
// maria
const seas=[[.62,.38,.26],[.4,.32,.2],[.33,.55,.22],[.55,.62,.17],[.72,.6,.13],[.5,.45,.12],[.25,.38,.1]];
try{ m.filter=`blur(${Math.max(1,r*.05)}px)`; }catch(e){}
for(const [fx,fy,fr] of seas){ for(let k=0;k<5;k++){ m.fillStyle='rgba(196,170,130,.13)'; m.beginPath(); m.ellipse(r*2*fx+(rnd()-.5)*r*.15, r*2*fy+(rnd()-.5)*r*.15, r*2*fr*(.6+rnd()*.5), r*2*fr*(.45+rnd()*.4), rnd()*3, 0, 7); m.fill(); } }
try{ m.filter='none'; }catch(e){}
// craters
for(let i=0;i<34;i++){ const cx=rnd()*2*r, cy=rnd()*2*r, cr=r*(.015+rnd()*.06);
m.fillStyle='rgba(190,165,125,.16)'; m.beginPath(); m.arc(cx+cr*.15,cy+cr*.15,cr,0,7); m.fill();
m.strokeStyle='rgba(255,255,248,.55)'; m.lineWidth=Math.max(.6,cr*.25); m.beginPath(); m.arc(cx,cy,cr,Math.PI*.9,Math.PI*1.7); m.stroke(); }
// bright young crater with rays
m.strokeStyle='rgba(255,252,240,.18)'; m.lineWidth=r*.012; for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; m.beginPath(); m.moveTo(r*1.1,r*1.55); m.lineTo(r*1.1+Math.cos(a)*r*.5,r*1.55+Math.sin(a)*r*.5); m.stroke(); }
// grain
for(let i=0;i<Math.round(r*r*.08);i++){ m.fillStyle=rnd()<.5?'rgba(255,255,255,.05)':'rgba(160,130,90,.04)'; m.fillRect(rnd()*2*r,rnd()*2*r,1,1); }
// limb darkening rim
g=m.createRadialGradient(r,r,r*.7,r,r,r); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(190,150,100,.18)'); m.fillStyle=g; m.fillRect(0,0,2*r,2*r);
m.restore();
}
function palm(b,x,y,h,s,lean){
b.strokeStyle='#5e4a3a'; b.lineWidth=3.2*s; b.lineCap='round';
const tx=x+lean*h*0.35, ty=y-h;
b.beginPath(); b.moveTo(x,y); b.quadraticCurveTo(x+lean*h*0.05,y-h*0.6,tx,ty); b.stroke();
b.lineWidth=2.2*s;
for(let k=0;k<7;k++){ const a=-Math.PI*0.95+k*(Math.PI*0.9/6), L=(20+ (k%2)*6)*s;
b.beginPath(); b.moveTo(tx,ty); b.quadraticCurveTo(tx+Math.cos(a)*L*0.6,ty+Math.sin(a)*L*0.6-6*s,tx+Math.cos(a)*L,ty+Math.sin(a)*L*0.4+8*s); b.stroke(); }
b.fillStyle='#6a5236'; b.beginPath(); b.arc(tx,ty+3*s,3*s,0,7); b.fill();
}
function signText(b,text,x,y,size,col,glow){
b.save(); b.font=`600 ${size}px "IBM Plex Sans Thai","Charm",sans-serif`; b.textAlign='center'; b.textBaseline='middle';
b.shadowColor=glow; b.shadowBlur=size*0.8; b.fillStyle=col; b.fillText(text,x,y); b.restore();
}
function drawBeach(b,wy,s,rnd){
const H2=H, hill=x=>wy-(H2*0.05+H2*0.03*Math.sin(x*0.004+1)+H2*0.13*Math.exp(-Math.pow((x-W*0.9)/(W*0.16),2)));
let g=b.createLinearGradient(0,wy-H*0.2,0,wy); g.addColorStop(0,'#f5cf98'); g.addColorStop(1,'#b5848a');
b.fillStyle=g; b.beginPath(); b.moveTo(0,wy); for(let x=0;x<=W;x+=6) b.lineTo(x,hill(x)); b.lineTo(W,wy); b.closePath(); b.fill();
// headland rocks
b.fillStyle='#a8747e'; b.beginPath(); b.moveTo(W*0.7,wy); for(let x=W*0.7;x<=W;x+=5) b.lineTo(x,wy-(x-W*0.7)/(W*0.3)*H*0.09-Math.sin(x*0.08)*2); b.lineTo(W,wy); b.closePath(); b.fill();
// coastal road lights curving over the headland
for(let i=0;i<34;i++){ const t=i/33, x=W*0.62+t*W*0.4, y=wy-6*s-Math.pow(t,1.6)*H*0.13+Math.sin(t*9)*4*s;
const gl=b.createRadialGradient(x,y,0,x,y,6*s); gl.addColorStop(0,'rgba(255,236,190,.5)'); gl.addColorStop(1,'rgba(255,236,190,0)');
b.fillStyle=gl; b.fillRect(x-6*s,y-6*s,12*s,12*s); b.fillStyle='#fff1cc'; b.beginPath(); b.arc(x,y,1.3*s,0,7); b.fill(); }
// sand
g=b.createLinearGradient(0,wy-16*s,0,wy); g.addColorStop(0,'#5e5644'); g.addColorStop(1,'#8c7f60');
b.fillStyle=g; b.beginPath(); b.moveTo(0,wy-14*s); b.quadraticCurveTo(W*0.4,wy-20*s,W*0.72,wy-6*s); b.lineTo(W*0.72,wy); b.lineTo(0,wy); b.closePath(); b.fill();
// beach huts with warm light
for(let i=0;i<5;i++){ const x=W*(0.08+i*0.13)+rnd()*20*s, y=wy-14*s, w=30*s, h=18*s;
b.fillStyle='rgba(255,190,100,.16)'; b.beginPath(); b.arc(x+w/2,y-h/2,w,0,7); b.fill();
b.fillStyle='#9a6650'; b.fillRect(x,y-h,w,h); b.beginPath(); b.moveTo(x-5*s,y-h); b.lineTo(x+w/2,y-h-12*s); b.lineTo(x+w+5*s,y-h); b.fill();
b.fillStyle='#f7b85a'; b.fillRect(x+4*s,y-h+5*s,8*s,7*s); b.fillRect(x+w-12*s,y-h+5*s,8*s,7*s); }
// umbrellas
for(let i=0;i<6;i++){ const x=W*(0.05+i*0.11)+rnd()*30*s, y=wy-8*s;
b.strokeStyle='#0b0a18'; b.lineWidth=1.4*s; b.beginPath(); b.moveTo(x,y); b.lineTo(x,y-14*s); b.stroke();
b.fillStyle=['#b8324a','#2f7d6d','#e0a526'][i%3]; b.globalAlpha=.55; b.beginPath(); b.moveTo(x-11*s,y-12*s); b.quadraticCurveTo(x,y-24*s,x+11*s,y-12*s); b.closePath(); b.fill(); b.globalAlpha=1; }
// string lights along the beach
const bulbs=['#ff8fb1','#f7d58a','#7fe0d0','#ffb35a'];
for(let k=0;k<60;k++){ const t=k/59, x=W*0.02+t*W*0.66, y=wy-40*s+Math.sin(t*Math.PI*6)*5*s+t*10*s;
b.fillStyle=bulbs[k%4]; b.beginPath(); b.arc(x,y,1.4*s,0,7); b.fill(); }
// palms
[[0.04,58,.5],[0.2,70,-.4],[0.33,52,.3],[0.5,66,.45],[0.64,56,-.3]].forEach(([fx,h,l])=>palm(b,W*fx,wy-10*s,h*s,s,l));
signText(b,'หาดคุ้งวิมาน',W*0.42,wy-58*s,15*s,'#ffe3a8','rgba(255,190,100,.9)');
// surf line
b.strokeStyle='rgba(230,240,255,.55)'; b.lineWidth=1.4*s; b.beginPath(); b.moveTo(0,wy-1); b.quadraticCurveTo(W*0.4,wy-4*s,W*0.72,wy-1); b.stroke();
}
function drawMarket(b,wy,s,rnd){
// town behind
for(let x=0;x<W;){ const w=(40+rnd()*60)*s, h=(30+rnd()*70)*s; b.fillStyle='#9a7396'; b.fillRect(x,wy-h-30*s,w,h+30*s);
for(let yy=wy-h-24*s;yy<wy-40*s;yy+=12*s) for(let xx=x+6*s;xx<x+w-8*s;xx+=12*s) if(rnd()<.35){ b.fillStyle='rgba(255,214,140,.55)'; b.fillRect(xx,yy,4*s,5*s); }
x+=w+4*s; }
// stalls
const cols=['#c23b4e','#e0a526','#2f7d6d','#3d5bb3','#e57fa4','#d9643a'];
let x=-6*s, i=0;
while(x<W){
const w=(46+rnd()*14)*s, top=wy-34*s, col=cols[i%cols.length];
const gl=b.createRadialGradient(x+w/2,wy-14*s,2,x+w/2,wy-14*s,w*0.9); gl.addColorStop(0,'rgba(255,200,110,.45)'); gl.addColorStop(1,'rgba(255,200,110,0)');
b.fillStyle=gl; b.fillRect(x-w*0.4,wy-50*s,w*1.8,50*s);
b.fillStyle='#2a1a14'; b.fillRect(x+3*s,wy-14*s,w-6*s,14*s);
b.fillStyle='#ffd48a'; b.fillRect(x+5*s,wy-24*s,w-10*s,9*s);
for(let k=0;k<5;k++){ b.fillStyle=k%2?'#f4ecdc':col; b.beginPath(); const sx=x+k*w/5; b.moveTo(sx,top); b.lineTo(sx+w/5,top); b.lineTo(sx+w/5,top+8*s); b.quadraticCurveTo(sx+w/10,top+12*s,sx,top+8*s); b.closePath(); b.fill(); }
b.fillStyle=shade(col,-.3); b.beginPath(); b.moveTo(x-2*s,top); b.lineTo(x+w/2,top-10*s); b.lineTo(x+w+2*s,top); b.closePath(); b.fill();
b.strokeStyle='#120e22'; b.lineWidth=2*s; b.beginPath(); b.moveTo(x+2*s,top+8*s); b.lineTo(x+2*s,wy); b.moveTo(x+w-2*s,top+8*s); b.lineTo(x+w-2*s,wy); b.stroke();
// shoppers
for(let p=0;p<2;p++) if(rnd()<.6){ const px=x+8*s+rnd()*(w-16*s); b.fillStyle='#6a4656'; b.beginPath(); b.arc(px,wy-17*s,3*s,0,7); b.fill(); b.fillRect(px-3*s,wy-14*s,6*s,14*s); }
x+=w; i++;
}
// bulbs across the market
const bulbs=['#ff8fb1','#f7d58a','#7fe0d0','#ffb35a','#ffffff'];
for(let row=0;row<2;row++) for(let k=0;k<80;k++){ const t=k/79, xx=t*W, yy=wy-56*s-row*12*s+Math.abs(Math.sin(t*Math.PI*5))*-8*s+10*s;
b.fillStyle=bulbs[(k+row)%5]; b.beginPath(); b.arc(xx,yy,1.5*s,0,7); b.fill(); }
// entrance sign
const cx=W*0.5, sw=150*s, sy=wy-92*s;
b.strokeStyle='#120e22'; b.lineWidth=4*s; b.beginPath(); b.moveTo(cx-sw/2+8*s,sy+14*s); b.lineTo(cx-sw/2+8*s,wy-34*s); b.moveTo(cx+sw/2-8*s,sy+14*s); b.lineTo(cx+sw/2-8*s,wy-34*s); b.stroke();
b.fillStyle='#1d1238'; b.fillRect(cx-sw/2,sy-14*s,sw,30*s);
b.strokeStyle='#ff8fb1'; b.lineWidth=1.5*s; b.shadowColor='#ff8fb1'; b.shadowBlur=10*s; b.strokeRect(cx-sw/2+3*s,sy-11*s,sw-6*s,24*s); b.shadowBlur=0;
signText(b,'ตลาดเซนทริค',cx,sy+1*s,17*s,'#ffe3a8','rgba(255,143,177,.95)');
b.fillStyle='#8a6466'; b.fillRect(0,wy-2*s,W,2*s+1);
}
function tree(b,x,y,s,rnd,bloom){
b.fillStyle='#7a5236'; b.beginPath(); b.moveTo(x-3*s,y); b.quadraticCurveTo(x-1*s,y-18*s,x-2*s,y-30*s); b.lineTo(x+2*s,y-30*s); b.quadraticCurveTo(x+1*s,y-18*s,x+3*s,y); b.fill();
const blobs=[[0,-42,17],[-13,-34,12],[13,-34,12],[-7,-50,11],[8,-50,11],[0,-28,10]];
for(const [dx,dy,r] of blobs){
const cx=x+dx*s, cy=y+dy*s, rr=r*s;
const g=b.createRadialGradient(cx-rr*.35,cy-rr*.45,rr*.1,cx,cy,rr);
if(bloom){ g.addColorStop(0,'#b9d98a'); g.addColorStop(1,'#5f8f4a'); } else { g.addColorStop(0,'#d6e08e'); g.addColorStop(.55,'#86a85a'); g.addColorStop(1,'#4f7a3e'); }
b.fillStyle=g; b.beginPath(); b.arc(cx,cy,rr,0,7); b.fill();
}
if(bloom) for(let i=0;i<16;i++){ const a=rnd()*7, d=rnd()*22*s; const fx=x+Math.cos(a)*d, fy=y-40*s+Math.sin(a)*d*.8;
b.fillStyle=rnd()<.5?'#ffd2dc':'#fff4e6'; b.beginPath(); b.arc(fx,fy,2.2*s,0,7); b.fill(); b.fillStyle='#f6c04a'; b.beginPath(); b.arc(fx,fy,.8*s,0,7); b.fill(); }
}
function lampPost(b,x,y,s){
b.fillStyle='#8a6a3e'; b.fillRect(x-1.6*s,y-58*s,3.2*s,58*s); b.fillRect(x-4*s,y-4*s,8*s,4*s);
b.strokeStyle='#8a6a3e'; b.lineWidth=1.6*s; b.beginPath(); b.moveTo(x-10*s,y-54*s); b.quadraticCurveTo(x,y-62*s,x+10*s,y-54*s); b.stroke();
for(const [dx,dy] of [[-10,-54],[10,-54],[0,-64]]){
const gx=x+dx*s, gy=y+dy*s, g=b.createRadialGradient(gx,gy,0,gx,gy,14*s);
g.addColorStop(0,'rgba(255,236,180,.85)'); g.addColorStop(.3,'rgba(255,214,140,.35)'); g.addColorStop(1,'rgba(255,214,140,0)');
b.fillStyle=g; b.beginPath(); b.arc(gx,gy,14*s,0,7); b.fill();
b.fillStyle='#fff6dc'; b.beginPath(); b.arc(gx,gy,3.6*s,0,7); b.fill();
}
}
function decor(b,wy,s,rnd,kind,skip){
const step=170*s;
for(let x=40*s, i=0; x<W-20*s; x+=step, i++){
if(skip && x>skip[0]-20*s && x<skip[1]+20*s) continue;
lampPost(b,x,wy-2*s,s);
const tx=x+step*0.5;
if(skip && tx>skip[0]-30*s && tx<skip[1]+30*s) continue;
if(kind!=='beach' && tx<W-20*s) tree(b,tx,wy-2*s,s*(.9+rnd()*.3),rnd,i%2===1);
}
}
function buildBank(){
if(!W||!H) return;
VW=W; const wy=H*0.52, hpx=Math.ceil(wy*DPR);
const SEG=Math.round(Math.max(W,640)*1.35), F=Math.round(SEG*0.16);
const segs=PLACES.map(([n])=>{ const keep=W; W=SEG; try{ return buildScene(n); } finally{ W=keep; } });
STEP=SEG-F; LOOP=STEP*segs.length;
// fade each segment in over its first F px so places blend into each other
const faded=segs.map(sg=>{ const t=document.createElement('canvas'); t.width=sg.width; t.height=sg.height; const x=t.getContext('2d');
x.drawImage(sg,0,0); x.globalCompositeOperation='destination-in';
const g=x.createLinearGradient(0,0,t.width,0); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(F/SEG,'#000'); g.addColorStop(1,'#000');
x.fillStyle=g; x.fillRect(0,0,t.width,t.height); return t; });
strip=document.createElement('canvas'); strip.width=Math.ceil(LOOP*DPR); strip.height=hpx;
const sc=strip.getContext('2d');
sc.drawImage(segs[segs.length-1],Math.round((STEP*(segs.length-1)-LOOP)*DPR),0); // tail of the last place wraps to the start
faded.forEach((t,i)=>sc.drawImage(t,Math.round(i*STEP*DPR),0));
bank=document.createElement('canvas'); bank.width=Math.ceil(W*DPR); bank.height=hpx;
}
function composeView(){
if(!strip||!bank||!strip.width||!bank.width||!bank.height) return;
const v=bank.getContext('2d'), h=bank.height, w=bank.width, sw=strip.width;
const p=Math.round((((pan%LOOP)+LOOP)%LOOP)*DPR) % sw;
v.clearRect(0,0,w,h);
const first=Math.min(w,sw-p); v.drawImage(strip,p,0,first,h,0,0,first,h);
if(first<w) v.drawImage(strip,0,0,w-first,h,first,0,w-first,h);
const mid=(((pan+W/2)%LOOP)+LOOP)%LOOP, place=PLACES[Math.min(PLACES.length-1,Math.floor(mid/STEP))][1];
if(place!==placeShown){ placeShown=place; $('sub').textContent='กำลังลอยผ่าน '+place+' · คืนวันเพ็ญเดือนสิบสอง · แตะกระทงเพื่ออ่านคำอธิษฐาน'; }
}
function buildScene(scene){
const wy=H*0.52;
const cvs=document.createElement('canvas'); cvs.width=Math.ceil(W*DPR); cvs.height=Math.ceil(wy*DPR);
const b=cvs.getContext('2d'); b.setTransform(DPR,0,0,DPR,0,0);
let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
const s=Math.max(.5,Math.min(VW/900,H/520));
if(scene==='beach'){ drawBeach(b,wy,s,rnd); decor(b,wy,s,rnd,'beach'); return cvs; }
if(scene==='market'){ drawMarket(b,wy,s,rnd); decor(b,wy,s,rnd,'market'); return cvs; }
// Khao Khitchakut
const hill=x=>wy-(H*0.06+H*0.19*Math.exp(-Math.pow((x-W*0.28)/(W*0.17),2))+H*0.06*Math.exp(-Math.pow((x-W*0.8)/(W*0.22),2))+Math.sin(x*0.03)*2);
let g=b.createLinearGradient(0,wy-H*0.26,0,wy); g.addColorStop(0,'#f8d49a'); g.addColorStop(.55,'#d9a089'); g.addColorStop(1,'#a77a86');
b.fillStyle=g; b.beginPath(); b.moveTo(0,wy); for(let x=0;x<=W;x+=6) b.lineTo(x,hill(x)); b.lineTo(W,wy); b.closePath(); b.fill();
// pilgrims' trail lights up the mountain
for(let i=0;i<46;i++){ const t=i/45, x=W*0.16+t*W*0.12+Math.sin(t*20)*W*0.012, y=hill(x)+3+ (1-t)*2;
b.fillStyle=`rgba(255,${200+Math.round(rnd()*40)},120,${.55+rnd()*.4})`; b.beginPath(); b.arc(x,y,.9+rnd()*.5,0,7); b.fill(); }
// shophouses
const cx=W*0.6, cw=130*s, houses=[];
let x=-10*s;
while(x<W){
const w=(34+rnd()*18)*s, h=(30+rnd()*20)*s;
if(x+w>cx-cw*0.62 && x<cx+cw*0.62){ x=cx+cw*0.62; continue; }
houses.push({x,w,h}); x+=w+1*s;
}
for(const hs of houses){
const top=wy-hs.h-6*s;
b.fillStyle='#a8705e'; b.fillRect(hs.x,top,hs.w,hs.h+6*s);
b.fillStyle='#7a4238'; b.beginPath(); b.moveTo(hs.x-3*s,top); b.lineTo(hs.x+hs.w*0.25,top-12*s); b.lineTo(hs.x+hs.w*0.75,top-12*s); b.lineTo(hs.x+hs.w+3*s,top); b.closePath(); b.fill();
b.fillStyle='#6a4436'; b.fillRect(hs.x,wy-6*s,hs.w,6*s); // stilts / walkway
const cols=hs.w>44*s?3:2, ww=hs.w/(cols*2+1);
for(let f=0;f<2;f++) for(let c=0;c<cols;c++){
const lit=rnd()<.62, wx=hs.x+ww*(1+c*2), wyy=top+6*s+f*(hs.h*0.45), wh=hs.h*0.28;
if(lit){ b.fillStyle='rgba(255,200,110,.18)'; b.fillRect(wx-2*s,wyy-2*s,ww+4*s,wh+4*s); }
b.fillStyle=lit?(rnd()<.2?'#ffe3a8':'#f7b85a'):'#7a5560'; b.fillRect(wx,wyy,ww,wh);
}
}
// festival string lights along the waterfront
const bulbs=['#ff8fb1','#f7d58a','#7fe0d0','#ffb35a'];
for(let i=0;i<houses.length-1;i+=2){
const a=houses[i], c=houses[i+1]; const x1=a.x+a.w*0.5, x2=c.x+c.w*0.5, y1=wy-a.h-4*s, y2=wy-c.h-4*s;
if(x2-x1>W*0.25) continue;
for(let k=0;k<=8;k++){ const t=k/8, xx=x1+(x2-x1)*t, yy=y1+(y2-y1)*t+Math.sin(t*Math.PI)*10*s;
b.fillStyle=bulbs[(i+k)%4]; b.beginPath(); b.arc(xx,yy,1.5*s,0,7); b.fill(); }
}
// Cathedral of the Immaculate Conception — floodlit, twin spires
const glow=b.createRadialGradient(cx,wy-50*s,10*s,cx,wy-50*s,150*s); glow.addColorStop(0,'rgba(255,240,200,.22)'); glow.addColorStop(1,'rgba(255,240,200,0)');
b.fillStyle=glow; b.fillRect(cx-160*s,wy-210*s,320*s,210*s);
const c=s*1.12, bw=112*c, L=cx-bw/2, tw=24*c;
const lit=(y0,y1)=>{ const gg=b.createLinearGradient(0,y0,0,y1); gg.addColorStop(0,'#f2ecd6'); gg.addColorStop(1,'#9d9680'); return gg; };
const lancet=(x,y,w,h,col)=>{ b.fillStyle=col; b.beginPath(); b.moveTo(x,y); b.lineTo(x,y-h+w*.6); b.quadraticCurveTo(x,y-h,x+w/2,y-h-w*.15); b.quadraticCurveTo(x+w,y-h,x+w,y-h+w*.6); b.lineTo(x+w,y); b.closePath(); b.fill(); };
// nave
b.fillStyle=lit(wy-95*c,wy); b.fillRect(L+tw,wy-78*c,bw-2*tw,78*c);
b.beginPath(); b.moveTo(L+tw,wy-78*c); b.lineTo(cx,wy-108*c); b.lineTo(L+bw-tw,wy-78*c); b.closePath(); b.fill();
b.fillStyle='#c9c1a6'; b.fillRect(cx-1*c,wy-122*c,2*c,16*c); b.fillRect(cx-6*c,wy-117*c,12*c,2*c);
// towers + spires
for(const tx of [L,L+bw-tw]){
b.fillStyle=lit(wy-112*c,wy); b.fillRect(tx,wy-112*c,tw,112*c);
b.fillStyle='#d9d2b8'; b.fillRect(tx-2*c,wy-114*c,tw+4*c,4*c);
const sg=b.createLinearGradient(tx,0,tx+tw,0); sg.addColorStop(0,'#cfc8ae'); sg.addColorStop(1,'#8c8672');
b.fillStyle=sg; b.beginPath(); b.moveTo(tx+1*c,wy-114*c); b.lineTo(tx+tw/2,wy-176*c); b.lineTo(tx+tw-1*c,wy-114*c); b.closePath(); b.fill();
b.fillStyle='#e8e1c8'; b.fillRect(tx+tw/2-.8*c,wy-188*c,1.6*c,13*c); b.fillRect(tx+tw/2-4*c,wy-184*c,8*c,1.6*c);
lancet(tx+7*c,wy-70*c,10*c,22*c,'#ffbe62'); lancet(tx+7*c,wy-30*c,10*c,18*c,'#f2a24a');
lancet(tx+8*c,wy-92*c,8*c,12*c,'#ffd48a');
}
// rose window, door, side windows
b.fillStyle='rgba(255,210,130,.35)'; b.beginPath(); b.arc(cx,wy-62*c,15*c,0,7); b.fill();
b.fillStyle='#ffc86a'; b.beginPath(); b.arc(cx,wy-62*c,11*c,0,7); b.fill();
b.strokeStyle='#8a5a2a'; b.lineWidth=1*c; for(let k=0;k<8;k++){ const a=k*Math.PI/4; b.beginPath(); b.moveTo(cx,wy-62*c); b.lineTo(cx+Math.cos(a)*11*c,wy-62*c+Math.sin(a)*11*c); b.stroke(); }
b.fillStyle='#e8a94f'; b.beginPath(); b.arc(cx,wy-62*c,3*c,0,7); b.fill();
lancet(cx-10*c,wy,20*c,32*c,'#6a4424'); lancet(cx-7*c,wy,14*c,26*c,'#ffcf7a');
lancet(L+tw+8*c,wy-12*c,8*c,22*c,'#f7b85a'); lancet(L+bw-tw-16*c,wy-12*c,8*c,22*c,'#f7b85a');
// embankment
b.fillStyle='#8a6466'; b.fillRect(0,wy-3*s,W,3*s+1);
decor(b,wy,s,rnd,'river',[cx-cw*0.75,cx+cw*0.75]);
return cvs;
}
function drawLantern(l){
ctx.save(); ctx.translate(l.x,l.y); ctx.globalAlpha=l.a;
const g=ctx.createRadialGradient(0,0,0,0,0,l.s*2.6); g.addColorStop(0,'rgba(255,190,90,.45)'); g.addColorStop(1,'rgba(255,190,90,0)');
ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,l.s*2.6,0,7); ctx.fill();
ctx.fillStyle='#f39a3e'; ctx.beginPath(); ctx.moveTo(-l.s*.7,-l.s); ctx.lineTo(l.s*.7,-l.s); ctx.lineTo(l.s*.55,l.s); ctx.lineTo(-l.s*.55,l.s); ctx.closePath(); ctx.fill();
ctx.fillStyle='#ffe2a0'; ctx.fillRect(-l.s*.3,l.s*.4,l.s*.6,l.s*.45); ctx.restore();
}
const FW=['#f7d58a','#ff8fb1','#7fe0d0','#ffffff','#f2b544'];
function burstAt(x,y){
if(reduce) return;
y = y ?? H*(0.12+Math.random()*0.2);
const col=FW[Math.floor(Math.random()*FW.length)], n=90;
for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, v=1.9+Math.random()*2.6; sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,col}); }
}
function drawWalkway(){
const wh=walkH(), y0=H-wh, off=((pan*1.8)%90+90)%90;
// railing posts and rail along the water's edge (behind the walkers)
ctx.strokeStyle='#b88a5a'; ctx.lineWidth=3;
ctx.beginPath(); ctx.moveTo(0,y0-22); ctx.lineTo(W,y0-22); ctx.stroke();
ctx.strokeStyle='#d6ae7a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,y0-12); ctx.lineTo(W,y0-12); ctx.stroke();
for(let x=-off;x<W+90;x+=90){
ctx.fillStyle='#a87a4e'; ctx.fillRect(x-3,y0-30,6,32);
ctx.fillStyle='#d9a441'; ctx.fillRect(x-4,y0-33,8,4);
if(Math.round((x+off+pan*1.8)/90)%2===0){ // little hanging lantern
const g=ctx.createRadialGradient(x+45,y0-14,0,x+45,y0-14,16); g.addColorStop(0,'rgba(255,200,110,.55)'); g.addColorStop(1,'rgba(255,200,110,0)');
ctx.fillStyle=g; ctx.fillRect(x+29,y0-30,32,32);
ctx.fillStyle='#e8584f'; ctx.beginPath(); ctx.ellipse(x+45,y0-14,5,6.5,0,0,7); ctx.fill();
ctx.fillStyle='#ffd27a'; ctx.fillRect(x+43,y0-16,4,5);
}
}
// planks
const g=ctx.createLinearGradient(0,y0,0,H); g.addColorStop(0,'#f6e6d0'); g.addColorStop(.15,'#ead3b6'); g.addColorStop(1,'#c9a585');
ctx.fillStyle=g; ctx.fillRect(0,y0,W,wh);
ctx.fillStyle='#fff6e8'; ctx.fillRect(0,y0,W,3);
ctx.strokeStyle='rgba(150,105,75,.3)'; ctx.lineWidth=1;
for(let r=1;r<6;r++){ const yy=y0+wh*(r/6)*(0.6+r*0.07); ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(W,yy); ctx.stroke(); }
for(let r=0;r<6;r++){ const yy=y0+wh*(r/6)*(0.6+r*0.07), step=120+r*14, o=((pan*1.8*(1+r*0.08)+r*37)%step+step)%step;
for(let x=-o;x<W;x+=step){ ctx.beginPath(); ctx.moveTo(x,yy); ctx.lineTo(x,yy+wh/7); ctx.stroke(); } }
// warm glow of the walkers' lanterns on the planks
const lg=ctx.createRadialGradient(W/2,y0+wh*0.45,0,W/2,y0+wh*0.45,W*0.35); lg.addColorStop(0,'rgba(255,200,120,.18)'); lg.addColorStop(1,'rgba(255,200,120,0)');
ctx.fillStyle=lg; ctx.fillRect(0,y0,W,wh);
}
let lastLantern=0,nextRocket=performance.now()+2500;
function frame(now){
ctx.clearRect(0,0,W,H);
const wy=WATER();
let g=ctx.createLinearGradient(0,0,0,wy); g.addColorStop(0,'#2b2d66'); g.addColorStop(.3,'#5a4f8f'); g.addColorStop(.58,'#b97ea6'); g.addColorStop(.82,'#f4a896'); g.addColorStop(1,'#ffd6a8');
ctx.fillStyle=g; ctx.fillRect(0,0,W,wy);
g=ctx.createLinearGradient(0,wy*0.72,0,wy); g.addColorStop(0,'rgba(255,214,170,0)'); g.addColorStop(1,'rgba(255,214,170,.45)'); ctx.fillStyle=g; ctx.fillRect(0,wy*0.72,W,wy*0.28);
for(const s of stars){ if(s.y>wy*0.5) continue; ctx.globalAlpha=.6*(.25+.55*Math.abs(Math.sin(now/1400+s.p)))*(1-s.y/(wy*0.55)); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill(); }
ctx.globalAlpha=1;
const mx=W*(W<560?0.8:0.17), my=H*(W<560?0.3:0.24), mr=Math.min(W,H)*(W<560?0.07:0.095);
g=ctx.createRadialGradient(mx,my,mr*.95,mx,my,mr*5); g.addColorStop(0,'rgba(255,240,210,.7)'); g.addColorStop(.22,'rgba(255,226,190,.25)'); g.addColorStop(1,'rgba(255,220,180,0)');
ctx.fillStyle=g; ctx.beginPath(); ctx.arc(mx,my,mr*5,0,7); ctx.fill();
if(mr>2){ if(!moonCv || moonR!==Math.round(mr)) buildMoon(mr); if(moonCv.width) ctx.drawImage(moonCv,mx-mr,my-mr,mr*2,mr*2); }
if(clouds && clouds.width && clouds.height) ctx.drawImage(clouds,0,0,W,clouds.height/DPR);
// fireworks
if(!reduce && now>nextRocket){ rockets.push({x:W*(0.15+Math.random()*0.7),y:wy,ty:H*(0.1+Math.random()*0.2)}); try{ if(playing) sfxWhoosh(.1); }catch(e){} nextRocket=now+3500+Math.random()*4500; }
for(let i=rockets.length-1;i>=0;i--){ const r=rockets[i]; r.y-=4.5; ctx.fillStyle='#ffe2a0'; ctx.fillRect(r.x-1,r.y,2,8); if(r.y<=r.ty){ burstAt(r.x,r.y); try{ sfxBoom(r.loud?.55:(playing?.16:0)); }catch(e){} rockets.splice(i,1);} }
for(let i=sparks.length-1;i>=0;i--){ const p=sparks[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=.03; p.vx*=.985; p.vy*=.985; p.life-=.011;
if(p.life<=0){sparks.splice(i,1);continue;} ctx.globalAlpha=p.life; ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,2.3,0,7); ctx.fill(); }
ctx.globalAlpha=1;
// lanterns
if(now-lastLantern>(reduce?6000:520) && lanterns.length<(reduce?6:46)){ lastLantern=now; lanterns.push({x:Math.random()*W,y:wy-10,s:4+Math.random()*5,vy:.18+Math.random()*.25,sw:Math.random()*6,a:0}); }
for(let i=lanterns.length-1;i>=0;i--){ const l=lanterns[i]; l.y-=reduce?0.05:l.vy; l.x+=Math.sin(now/2000+l.sw)*.15; l.a=Math.min(1,l.a+.01)*(l.y<H*0.08?0.98:1);
if(l.y<-20||l.a<0.02){lanterns.splice(i,1);continue;} drawLantern(l); }
const dt=lastNow?Math.min(100,now-lastNow):0; lastNow=now;
if(!reduce) pan+=dt*0.034;
composeView();
if(bank && bank.width && bank.height) ctx.drawImage(bank,0,0,W,bank.height/DPR);
// water
g=ctx.createLinearGradient(0,wy,0,H); g.addColorStop(0,'#ffd6c6'); g.addColorStop(.22,'#e9a9bb'); g.addColorStop(.7,'#a681b4'); g.addColorStop(1,'#6f578f'); ctx.fillStyle=g; ctx.fillRect(0,wy,W,H-wy);
if(bank && bank.width && bank.height){ // rippled reflection of the waterfront
const depth=Math.min(H-wy,wy*0.75), sh=3;
for(let y=0;y<depth;y+=sh){
const off=reduce?0:Math.sin(now/650+y*0.18)*(0.8+y*0.05);
ctx.globalAlpha=0.42*(1-y/depth);
const sy=Math.max(0,(wy-y-sh)*DPR);
ctx.drawImage(bank,0,sy,bank.width,sh*DPR,off,wy+y,W,sh);
}
ctx.globalAlpha=1;
}
for(let i=0;i<14;i++){ const yy=wy+6+i*((H-wy)/15); const w=mr*(1.6-i*0.05)*(0.6+0.4*Math.sin(now/500+i*1.7));
ctx.globalAlpha=.55-i*0.03; ctx.fillStyle='#f8edc6'; ctx.fillRect(mx-w/2+Math.sin(now/700+i)*4,yy,w,2); }
ctx.globalAlpha=1;
for(const l of lanterns){ if(l.y<wy){ ctx.globalAlpha=l.a*.25; ctx.fillStyle='#f2a24a'; ctx.fillRect(l.x-2,wy+(wy-l.y)*0.4,4,2);} }
ctx.globalAlpha=1; ctx.strokeStyle='rgba(255,245,250,.4)'; ctx.lineWidth=1;
for(const w of waves){ w.x+=reduce?0:w.s; if(w.x>W+50) w.x=-50; ctx.beginPath(); ctx.moveTo(w.x,w.y); ctx.lineTo(w.x+w.l,w.y); ctx.stroke(); }
drawWalkway();
tickBoats(now);
requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
