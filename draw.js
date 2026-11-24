"use strict";
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const OPT = {
gender:[['f','หญิง'],['m','ชาย']],
base:[['leaf','ใบตอง'],['lotus','ดอกบัว'],['heart','หัวใจ'],['swan','หงส์'],['gold','พานทอง'],['coconut','กะลามะพร้าว'],['bread','ขนมปัง']],
flower:[['#f5a623','ดาวเรือง'],['#e5566f','กุหลาบ'],['#fff4e0','มะลิ'],['#a66bd6','กล้วยไม้'],['#f29bb8','บัวชมพู']],
skin:[['#f8d9c0','ผิว 1'],['#eec09a','ผิว 2'],['#d9a072','ผิว 3'],['#b07850','ผิว 4'],['#7d5236','ผิว 5']],
hair:[['long','ยาว'],['bob','บ็อบ'],['ponytail','หางม้า'],['bun','มวย'],['short','สั้น'],['side','ปัดข้าง'],['spiky','ตั้งชี้']],
hairColor:[['#1c1412','ดำ'],['#4a2d1f','น้ำตาลเข้ม'],['#8a5a35','น้ำตาล'],['#d9b26b','บลอนด์'],['#c9455c','แดง'],['#5b6bd6','น้ำเงิน']],
face:[['smile','ยิ้ม'],['shy','เขิน'],['wink','ขยิบตา'],['laugh','หัวเราะ']],
outfit:[['thaiF','ชุดไทยสไบ'],['dress','ชุดกระโปรง'],['thaiM','ราชปะแตน'],['shirt','เชิ้ตกางเกงขายาว'],['mohom','ม่อฮ่อม'],['casual','เสื้อยืด']],
outfitColor:[['#c23b4e','แดง'],['#e0a526','ทอง'],['#2f7d6d','เขียว'],['#3d5bb3','น้ำเงิน'],['#8a4fb8','ม่วง'],['#e57fa4','ชมพู'],['#efeadb','ขาว']],
hold:[['none','ไม่ถือ'],['flower','ดอกไม้'],['heart','หัวใจ'],['lantern','โคม']]
};
const LABELS = {gender:'เพศ',base:'แบบกระทง',flower:'สีดอกไม้',skin:'สีผิว',hair:'ทรงผม',hairColor:'สีผม',face:'สีหน้า',outfit:'ชุด',outfitColor:'สีชุด',hold:'ถือในมือ'};
const SWATCH = new Set(['flower','skin','hairColor','outfitColor']);
const GROUPS = {gKrathong:['base','flower'],gLook:['gender','skin','hair','hairColor','face'],gOutfit:['outfit','outfitColor','hold']};
const DEFAULT = {gender:'f',base:'leaf',flower:'#f5a623',skin:'#eec09a',hair:'long',hairColor:'#1c1412',face:'smile',outfit:'thaiF',outfitColor:'#c23b4e',hold:'flower'};
// options that belong to one gender only; anything not listed suits both
const ONLY = {hair:{long:'f',bob:'f',ponytail:'f',bun:'f',side:'m',spiky:'m'}, outfit:{thaiF:'f',dress:'f',thaiM:'m',shirt:'m'}};
function allowed(k,v,g){ return !ONLY[k] || !ONLY[k][v] || ONLY[k][v]===g; }
function clean(cfg){
const out = {};
for (const k in OPT){ const v = cfg && cfg[k]; out[k] = OPT[k].some(o=>o[0]===v) ? v : DEFAULT[k]; }
if (!(cfg && cfg.gender)) out.gender = (out.outfit==='thaiM'||out.hair==='spiky') ? 'm' : 'f';
for (const k in ONLY){ if(!allowed(k,out[k],out.gender)) out[k] = OPT[k].find(o=>allowed(k,o[0],out.gender))[0]; }
return out;
}
function str(v,max){ return typeof v==='string' ? v.slice(0,max) : ''; }
function shade(hex,amt){
const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255;
const f=c=>Math.max(0,Math.min(255,Math.round(amt<0?c*(1+amt):c+(255-c)*amt)));
return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1);
}
const CX=110, RY=190, RX=92;
function rimPt(t){ return [CX+Math.cos(t)*RX, RY+Math.sin(t)*20]; }
let U='k0', UID=0;
const G=id=>`url(#${U}${id})`;
function kDefs(c){
const p=c.flower, lg=(id,stops,x2,y2)=>`<linearGradient id="${U}${id}" x1="0" y1="0" x2="${x2||0}" y2="${y2===undefined?1:y2}">${stops.map(([o,col])=>`<stop offset="${o}" stop-color="${col}"/>`).join('')}</linearGradient>`;
return `<defs>
${lg('lf',[[0,'#a8db78'],[.45,'#4f9a40'],[1,'#1f5320']])}
${lg('lb',[[0,'#6fae58'],[1,'#173f18']])}
${lg('pt',[[0,shade(p,.6)],[.5,p],[1,shade(p,-.35)]])}
${lg('lo',[[0,'#fff3f7'],[.5,'#f5a9c2'],[1,'#c8577f']])}
${lg('gd',[[0,'#fff3c4'],[.45,'#eab23a'],[1,'#94600c']])}
${lg('wh',[[0,'#ffffff'],[1,'#d8d0bd']])}
${lg('cn',[[0,'#9a6a40'],[1,'#3e2412']])}
${lg('br',[[0,'#f1c286'],[.5,'#c0803f'],[1,'#7a4a22']])}
${lg('hr',[[0,'#ff7d98'],[1,'#a8183a']])}
${lg('tk',[[0,'#f4eed8'],[1,'#b9ae86']])}
${lg('cd',[[0,'#fffaf0'],[1,'#e6d9b8']],1,0)}
<radialGradient id="${U}gl"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset=".4" stop-color="#ffb347" stop-opacity=".25"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
</defs>`;
}
function leafFold(x,y,h,w,lean,fill){
const tx=x+lean, ty=y-h;
return `<path d="M${x-w/2} ${y} Q${x-w*.32+lean*.3} ${y-h*.6} ${tx} ${ty} Q${x+w*.32+lean*.3} ${y-h*.6} ${x+w/2} ${y}Z" fill="${fill}"/>`
+ `<path d="M${tx} ${ty} Q${x+w*.32+lean*.3} ${y-h*.6} ${x+w/2} ${y} L${x} ${y}Z" fill="#000" opacity=".16"/>`
+ `<path d="M${tx} ${ty} L${x} ${y}" stroke="#e8ffd0" stroke-width=".8" opacity=".45"/>`;
}
function bulb(x,y,r,fill){
return `<path d="M${x-r} ${y} Q${x-r*1.05} ${y-r*1.1} ${x} ${y-r*1.55} Q${x+r*1.05} ${y-r*1.1} ${x+r} ${y} Q${x} ${y+r*.4} ${x-r} ${y}Z" fill="${fill}" stroke="#000" stroke-opacity=".18" stroke-width=".6"/>`
+ `<path d="M${x-r*.45} ${y-r*.25} Q${x-r*.2} ${y-r*1.15} ${x+r*.45} ${y-r*.55}" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
}
function flowerAt(x,y,col,r){
let s='';
for(let k=0;k<5;k++){ const a=k*72-90; s+=`<ellipse cx="${x}" cy="${y-r*.42}" rx="${(r*.36).toFixed(2)}" ry="${(r*.56).toFixed(2)}" fill="${col}" stroke="${shade(col,-.3)}" stroke-width=".5" transform="rotate(${a+90} ${x} ${y})"/>`; }
return s+`<circle cx="${x}" cy="${y}" r="${r*.3}" fill="#ffd34d"/><circle cx="${x-r*.08}" cy="${y-r*.08}" r="${r*.12}" fill="#fff6c8"/>`;
}
function rimFlowers(c,pts,r){ return pts.map(([x,y])=>flowerAt(x,y,c.flower,r||6)).join(''); }
function arcPts(n,cx,cy,rx,ry,t0,t1){ const a=[]; for(let i=0;i<n;i++){ const t=t0+(t1-t0)*(n===1?.5:i/(n-1)); a.push([cx+Math.cos(t)*rx, cy+Math.sin(t)*ry]); } return a; }
const HEART_OUT='M110 214 C62 204 12 186 28 166 C42 150 86 154 110 170 C134 154 178 150 192 166 C208 186 158 204 110 214Z';
const HEART_IN='M110 205 C68 196 30 182 42 168 C54 156 88 160 110 174 C132 160 166 156 178 168 C190 182 152 196 110 205Z';
function baseBack(c){
let s=`<ellipse cx="110" cy="214" rx="96" ry="9" fill="#000" opacity=".35"/>`;
switch(c.base){
case 'heart':
s+=`<path d="${HEART_OUT}" transform="translate(0 6)" fill="#6e1228"/><path d="${HEART_OUT}" fill="${G('hr')}"/><path d="${HEART_IN}" fill="#f9dbe2"/>`;
arcPts(9,110,172,66,14,Math.PI*1.05,Math.PI*1.95).forEach(([x,y])=>s+=bulb(x,y+4,9,'#e8445f'));
return s;
case 'swan':
s+=`<path d="M184 188 Q222 160 208 128 Q198 164 168 180Z" fill="${G('wh')}" stroke="#cfc6b0"/>`;
s+=`<path d="M28 186 Q110 228 198 182 Q200 198 182 206 Q110 232 42 206 Q24 198 28 186Z" fill="${G('wh')}" stroke="#cfc6b0"/>`;
s+=`<ellipse cx="112" cy="188" rx="82" ry="15" fill="#d7cfbb"/>`;
arcPts(11,112,188,82,15,Math.PI,Math.PI*2).forEach(([x,y],i)=>s+=leafFold(x,y+3,30+Math.sin(i)*4,20,6,G('wh')));
s+=`<path d="M46 194 Q12 172 26 138 Q36 116 30 100" stroke="#fffdf7" stroke-width="12" fill="none" stroke-linecap="round"/>`;
s+=`<path d="M46 194 Q12 172 26 138 Q36 116 30 100" stroke="#d8d0bd" stroke-width="1" fill="none" transform="translate(5 0)"/>`;
s+=`<circle cx="32" cy="98" r="9.5" fill="#fffdf7"/><path d="M24 95 L8 100 L24 104Z" fill="#f08a3a"/><circle cx="30" cy="95" r="1.7" fill="#222"/>`;
s+=`<path d="M22 90 L26 82 L31 88 L36 81 L40 90" fill="#e9c160"/>`;
return s;
case 'coconut':
s+=`<ellipse cx="110" cy="188" rx="88" ry="18" fill="#3e2412"/><ellipse cx="110" cy="189" rx="81" ry="14" fill="#fbf4e6"/>`;
arcPts(9,110,184,64,11,Math.PI*1.05,Math.PI*1.95).forEach(([x,y])=>s+=bulb(x,y+2,10,G('pt')));
return s;
case 'gold':
s+=`<ellipse cx="110" cy="186" rx="90" ry="18" fill="${G('gd')}"/><ellipse cx="110" cy="187" rx="82" ry="13" fill="#8a5a0c"/>`;
arcPts(12,110,186,86,17,Math.PI,Math.PI*2).forEach(([x,y])=>s+=leafFold(x,y+2,18,12,0,G('gd')));
arcPts(9,110,183,64,11,Math.PI*1.05,Math.PI*1.95).forEach(([x,y])=>s+=bulb(x,y+2,10,G('pt')));
return s;
case 'bread':
s+=`<ellipse cx="110" cy="203" rx="88" ry="17" fill="#5a3216"/>`;
s+=`<path d="M22 194 Q22 158 110 156 Q198 158 198 194 Q110 216 22 194Z" fill="${G('br')}"/>`;
s+=`<path d="M42 176 Q110 158 178 176" stroke="#f6d3a0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`;
for(let i=0;i<12;i++){const x=36+i*13.5, y=172+((i*7)%6); s+=`<ellipse cx="${x}" cy="${y}" rx="1.6" ry="1" fill="#6a3c18"/>`;}
return s;
case 'lotus':
s+=`<ellipse cx="110" cy="200" rx="86" ry="16" fill="#2a5a26"/>`;
arcPts(10,110,192,92,18,Math.PI*.98,Math.PI*2.02).forEach(([x,y])=>s+=`<path d="M${x-15} ${y+6} Q${x-14} ${y-26} ${x} ${y-44} Q${x+14} ${y-26} ${x+15} ${y+6}Z" fill="${G('lo')}" stroke="#fbd3e0" stroke-width=".8"/>`);
arcPts(8,110,186,62,12,Math.PI*1.04,Math.PI*1.96).forEach(([x,y])=>s+=`<path d="M${x-11} ${y+5} Q${x-10} ${y-22} ${x} ${y-36} Q${x+10} ${y-22} ${x+11} ${y+5}Z" fill="${G('lo')}" stroke="#fde6ee" stroke-width=".8"/>`);
return s;
default: // classic banana-leaf krathong on a banana-trunk slice
s+=`<ellipse cx="110" cy="202" rx="90" ry="17" fill="#8f8762"/><ellipse cx="110" cy="194" rx="90" ry="18" fill="${G('tk')}"/>`;
arcPts(13,110,192,94,19,Math.PI*.97,Math.PI*2.03).forEach(([x,y],i)=>s+=leafFold(x,y+2,34+(i%2)*6,19,(x-110)*.06,G('lb')));
arcPts(10,110,184,72,12,Math.PI*1.02,Math.PI*1.98).forEach(([x,y])=>s+=bulb(x,y+3,12.5,G('pt')));
arcPts(7,110,176,50,8,Math.PI*1.05,Math.PI*1.95).forEach(([x,y])=>s+=bulb(x,y,11,G('pt')));
return s;
}
}
function baseFront(c){
let s='';
switch(c.base){
case 'heart':
s+=`<path d="M28 172 C40 192 80 206 110 212 C140 206 180 192 192 172" stroke="#ffc2cf" stroke-width="1.5" fill="none" opacity=".8"/>`;
return s+rimFlowers(c,[[40,182],[60,194],[84,201],[110,205],[136,201],[160,194],[180,182]],7);
case 'swan':
arcPts(9,112,190,84,16,0,Math.PI).forEach(([x,y],i)=>s+=leafFold(x,y+6,20,18,-5,G('wh')));
return s+rimFlowers(c,[[60,196],[110,206],[160,196]],6.5);
case 'coconut':
s+=`<path d="M22 188 Q24 236 110 238 Q196 236 198 188 Q110 212 22 188Z" fill="${G('cn')}"/>`;
for(let i=0;i<16;i++){ const x=30+i*10.5, y=198+Math.sin(i*1.3)*5; s+=`<path d="M${x} ${y} q3 10 1 22" stroke="#2c180a" stroke-width="1.2" fill="none" opacity=".55"/>`; }
s+=`<path d="M22 188 Q110 212 198 188" stroke="#2c180a" stroke-width="3" fill="none"/>`;
arcPts(8,110,190,74,14,Math.PI*.1,Math.PI*.9).forEach(([x,y])=>s+=bulb(x,y,10,G('pt')));
return s+rimFlowers(c,[[48,196],[90,204],[130,204],[172,196]],6);
case 'gold':
s+=`<path d="M20 186 Q28 216 110 218 Q192 216 200 186 Q110 206 20 186Z" fill="${G('gd')}"/>`;
s+=`<path d="M26 196 Q110 218 194 196" stroke="#fff1b8" stroke-width="1.6" fill="none"/>`;
for(let i=0;i<12;i++){ const x=36+i*13.5, y=199+Math.sin((i/11)*Math.PI)*7; s+=`<path d="M${x-4} ${y} L${x} ${y+7} L${x+4} ${y}Z" fill="#b8243e"/>`; }
s+=`<rect x="94" y="216" width="32" height="8" fill="#94600c"/><ellipse cx="110" cy="226" rx="38" ry="7" fill="${G('gd')}"/>`;
arcPts(8,110,190,74,14,Math.PI*.1,Math.PI*.9).forEach(([x,y])=>s+=bulb(x,y-2,10,G('pt')));
return s+rimFlowers(c,[[50,190],[90,198],[130,198],[170,190]],6);
case 'bread':
return rimFlowers(c,[[46,188],[74,196],[110,199],[146,196],[174,188]],7);
case 'lotus':
arcPts(7,110,192,78,15,Math.PI*.08,Math.PI*.92).forEach(([x,y])=>s+=`<path d="M${x-14} ${y+8} Q${x-13} ${y-16} ${x} ${y-30} Q${x+13} ${y-16} ${x+14} ${y+8}Z" fill="${G('lo')}" stroke="#fde6ee" stroke-width=".8"/><path d="M${x} ${y-28} L${x} ${y+6}" stroke="#fff" stroke-opacity=".45" stroke-width=".8"/>`);
return s+rimFlowers(c,[[54,190],[110,200],[166,190]],6.5);
default:
arcPts(9,110,188,76,14,Math.PI*.06,Math.PI*.94).forEach(([x,y])=>s+=bulb(x,y,13,G('pt')));
arcPts(11,110,196,94,17,Math.PI*.02,Math.PI*.98).forEach(([x,y],i)=>s+=leafFold(x,y+6,22+(i%2)*4,19,(x-110)*.05,G('lf')));
s+=rimFlowers(c,[[52,184],[86,192],[134,192],[168,184]],6.5);
return s;
}
}
function candleIncense(c){
const dx=48; // candle and incense stand together in the middle of the krathong
return `<g transform="translate(${dx} 0)">
<circle cx="52" cy="112" r="30" fill="${G('gl')}"/>
<rect x="47" y="124" width="10" height="62" rx="2.5" fill="${G('cd')}"/>
<path d="M47 128 q2 6 0 10 M57 127 q-1.5 4 0 7" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>
<ellipse cx="52" cy="124" rx="5" ry="1.6" fill="#fffef8"/>
<line x1="52" y1="124" x2="52" y2="119" stroke="#3a2a1a" stroke-width="1"/>
<g class="flame"><path d="M52 98 Q59 110 56 116 Q52 121 48 116 Q45 110 52 98Z" fill="#ffb02e"/><path d="M52 105 Q55.5 112 54 116 Q52 118.5 50 116 Q48.5 112 52 105Z" fill="#fff3c0"/></g>
</g>
<g stroke="#7a3f22" stroke-width="1.6" stroke-linecap="round"><line x1="112" y1="184" x2="110" y2="134"/><line x1="116" y1="184" x2="117" y2="130"/><line x1="120" y1="184" x2="124" y2="134"/></g>
<g fill="#ff6a2a"><circle cx="110" cy="134" r="2"/><circle cx="117" cy="130" r="2"/><circle cx="124" cy="134" r="2"/></g>
<path d="M117 128 q-4 -8 1 -14 q5 -6 0 -12" stroke="#fff" stroke-opacity=".3" stroke-width="1.2" fill="none"/>`;
}
function hairBack(c){
const h=c.hairColor;
switch(c.hair){
case 'long': return `<path d="M80 92 Q80 60 110 60 Q140 60 140 92 L143 142 Q110 150 77 142Z" fill="${h}"/>`;
case 'bob': return `<path d="M81 92 Q81 61 110 61 Q139 61 139 92 L141 116 Q110 123 79 116Z" fill="${h}"/>`;
case 'ponytail': return `<path d="M133 78 Q166 84 156 132 Q148 112 132 100Z" fill="${h}"/><circle cx="136" cy="80" r="4" fill="${c.outfitColor}"/>`;
case 'bun': return `<circle cx="110" cy="60" r="14" fill="${h}"/><path d="M98 70 Q110 64 122 70" stroke="${c.outfitColor}" stroke-width="3" fill="none"/>`;
default: return '';
}
}
function hairFront(c){
const h=c.hairColor;
if(c.hair==='spiky') return `<path d="M82 94 L80 74 L90 78 L92 62 L102 72 L110 56 L118 72 L128 62 L130 78 L140 74 L138 94 Q128 80 110 82 Q92 80 82 94Z" fill="${h}"/>`;
if(c.hair==='side') return `<path d="M83 94 Q80 62 112 61 Q142 63 138 94 Q136 80 126 76 Q106 72 92 82 Q86 86 83 94Z" fill="${h}"/><path d="M92 80 Q110 66 132 74 Q114 70 100 82Z" fill="${shade(h,.2)}" opacity=".6"/>`;
if(c.hair==='short') return `<path d="M83 93 Q81 64 110 63 Q139 64 137 93 Q130 79 110 80 Q94 79 83 93Z" fill="${h}"/>`;
return `<path d="M83 95 Q83 63 110 63 Q137 63 137 95 Q128 80 117 82 Q112 73 104 82 Q92 82 83 95Z" fill="${h}"/>`;
}
function face(c){
const ink='#2a1c1c'; let e='',m='';
const eye=(x)=>`<ellipse cx="${x}" cy="96" rx="2.8" ry="3.4" fill="${ink}"/><circle cx="${x+1}" cy="94.8" r="1" fill="#fff"/>`;
const arcUp=(x)=>`<path d="M${x-4} 97 Q${x} 92 ${x+4} 97" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
let blush=.35;
switch(c.face){
case 'shy': e=`<path d="M96 96 Q100 98 104 96" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M116 96 Q120 98 124 96" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`; m=`<path d="M107 106 Q110 104 113 106" stroke="${ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`; blush=.7; break;
case 'wink': e=eye(100)+`<path d="M116 97 L121 94.5 L116 92" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; m=`<path d="M104 104 Q110 110 116 104" stroke="${ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; break;
case 'laugh': e=arcUp(100)+arcUp(120); m=`<path d="M103 103 Q110 103 117 103 Q116 112 110 112 Q104 112 103 103Z" fill="#8a2b3a"/><path d="M106 109 Q110 107 114 109" fill="#e5788a"/>`; blush=.5; break;
default: e=eye(100)+eye(120); m=`<path d="M105 104 Q110 108.5 115 104" stroke="${ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
}
const f=c.gender==='f';
if(f){ blush+=.15; if(c.face==='smile'||c.face==='wink') m=m.replace(`stroke="${ink}"`,'stroke="#c2405a"');
e+=`<path d="M103 94 l3 -2.5 M102.5 96 l3.4 -1" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/>`;
if(c.face!=='wink') e+=`<path d="M117 94 l-3 -2.5 M117.5 96 l-3.4 -1" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/>`; }
const bw=f?1.2:2.4, bc=f?ink:c.hairColor;
e+=`<path d="M95 ${f?88:87} Q100 ${f?85.5:85} 105 ${f?88:87.5}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/><path d="M115 ${f?88:87.5} Q120 ${f?85.5:85} 125 ${f?88:87}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`;
return e+m+`<ellipse cx="94" cy="104" rx="5" ry="3" fill="#ff7f8f" opacity="${blush}"/><ellipse cx="126" cy="104" rx="5" ry="3" fill="#ff7f8f" opacity="${blush}"/>`;
}
function body(c){
const o=c.outfitColor, od=shade(o,-.25), sk=c.skin, gold='#e9c160';
const legs=(y1)=>`<rect x="100" y="${y1}" width="8" height="${176-y1}" rx="3" fill="${sk}"/><rect x="112" y="${y1}" width="8" height="${176-y1}" rx="3" fill="${sk}"/>`;
const shoes=(col)=>`<ellipse cx="103" cy="177" rx="7" ry="3.5" fill="${col}"/><ellipse cx="117" cy="177" rx="7" ry="3.5" fill="${col}"/>`;
let s='', sleeve=o;
switch(c.outfit){
case 'thaiF':
sleeve=sk;
s+=`<path d="M88 146 L132 146 L136 176 L84 176Z" fill="${o}"/><path d="M86 168 L134 168 L135 174 L85 174Z" fill="${gold}"/><line x1="110" y1="148" x2="110" y2="166" stroke="${od}" stroke-width="1.5"/>`;
s+=`<rect x="93" y="117" width="34" height="31" rx="9" fill="${sk}"/><path d="M93 128 Q110 124 127 128 L127 146 L93 146Z" fill="${shade(o,.15)}"/>`;
s+=`<path d="M92 120 L101 118 L128 146 L118 147Z" fill="${gold}"/>`;
break;
case 'thaiM':
s+=legs(160)+shoes('#2a1c1c');
s+=`<path d="M93 144 Q88 160 98 163 L122 163 Q132 160 127 144Z" fill="${shade(o,-.45)}"/>`;
s+=`<rect x="92" y="116" width="36" height="31" rx="8" fill="#efeadb"/><rect x="104" y="114" width="12" height="6" rx="2" fill="#efeadb" stroke="#cfc6a8"/>`;
s+=`<g fill="${gold}"><circle cx="110" cy="124" r="1.6"/><circle cx="110" cy="131" r="1.6"/><circle cx="110" cy="138" r="1.6"/></g><rect x="92" y="141" width="36" height="4" fill="${o}"/>`;
sleeve='#efeadb';
break;
case 'shirt':
s+=`<path d="M96 145 L124 145 L123 174 L113 174 L110 152 L107 174 L97 174Z" fill="#2b2f45"/>`+shoes('#3a2416');
s+=`<rect x="92" y="117" width="36" height="30" rx="8" fill="${o}"/><rect x="95" y="142" width="30" height="3" fill="#3a2416"/>`;
s+=`<path d="M103 116 L110 124 L105 126Z M117 116 L110 124 L115 126Z" fill="${shade(o,.5)}"/><line x1="110" y1="124" x2="110" y2="142" stroke="${od}" stroke-width="1"/>`;
s+=`<g fill="${shade(o,.5)}"><circle cx="110" cy="129" r="1"/><circle cx="110" cy="135" r="1"/></g>`;
break;
case 'mohom':
s+=`<path d="M96 145 L124 145 L123 174 L113 174 L110 156 L107 174 L97 174Z" fill="${od}"/>`+shoes('#2a1c1c');
s+=`<rect x="92" y="117" width="36" height="30" rx="8" fill="${o}"/><path d="M104 117 L110 127 L116 117" fill="${sk}"/>`;
s+=`<rect x="92" y="141" width="36" height="5" fill="#d8443a"/><g fill="#f2f2ea" opacity=".75"><rect x="95" y="141" width="3" height="5"/><rect x="103" y="141" width="3" height="5"/><rect x="111" y="141" width="3" height="5"/><rect x="119" y="141" width="3" height="5"/></g>`;
break;
case 'dress':
s+=legs(166)+shoes(od);
s+=`<path d="M96 140 L124 140 L138 168 Q110 174 82 168Z" fill="${o}"/><path d="M84 164 Q110 170 136 164 L138 168 Q110 174 82 168Z" fill="${shade(o,.35)}"/>`;
s+=`<rect x="95" y="117" width="30" height="26" rx="8" fill="${o}"/><rect x="95" y="137" width="30" height="4" fill="${shade(o,.35)}"/>`;
break;
default:
s+=legs(156)+shoes('#f2f2ea');
s+=`<rect x="95" y="143" width="30" height="16" rx="3" fill="#3b5b8c"/><line x1="110" y1="148" x2="110" y2="159" stroke="#2a4570" stroke-width="1.4"/>`;
s+=`<rect x="92" y="117" width="36" height="29" rx="8" fill="${o}"/><path d="M104 118 Q110 124 116 118" stroke="${od}" stroke-width="2" fill="none"/>`;
}
return s;
}
// arms are separate groups so gestures can swing them from the shoulder
function arms(c){
const sk=c.skin, sleeve = c.outfit==='thaiF' ? sk : (c.outfit==='thaiM' ? '#efeadb' : c.outfitColor);
return `<g class="armL"><path d="M95 121 Q86 132 83 145" stroke="${sleeve}" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="83" cy="147" r="4.2" fill="${sk}"/></g>`
+ `<g class="armR"><path d="M125 121 Q134 132 137 145" stroke="${sleeve}" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="137" cy="147" r="4.2" fill="${sk}"/>${holding(c)}</g>`;
}
function figure(c){
return `${hairBack(c)}${body(c)}<rect x="105" y="112" width="10" height="8" fill="${c.skin}"/><circle cx="110" cy="92" r="27" fill="${c.skin}"/><circle cx="83.5" cy="96" r="4" fill="${c.skin}"/><circle cx="136.5" cy="96" r="4" fill="${c.skin}"/>${face(c)}${hairFront(c)}${arms(c)}`;
}
function characterSVG(cfg){
const c=clean(cfg); U='k'+(++UID)+'_';
return `<svg viewBox="58 42 104 142" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs></defs><ellipse cx="110" cy="179" rx="26" ry="4" fill="#000" opacity=".25"/><g class="fig">${figure(c)}</g></svg>`;
}
function holding(c){
switch(c.hold){
case 'flower': return `<path d="M139 148 Q144 132 142 120" stroke="#4f8a4a" stroke-width="2" fill="none"/>`+flowerAt(142,117,c.flower,6);
case 'heart': return `<path d="M138 146 C130 138 132 128 139 131 C146 128 148 138 140 146Z" transform="translate(4 -8)" fill="#ff5c86" stroke="#ffd2df" stroke-width="1"/>`;
case 'lantern': return `<line x1="138" y1="146" x2="146" y2="118" stroke="#8a6a3a" stroke-width="1.4"/><line x1="146" y1="118" x2="146" y2="124" stroke="#8a6a3a"/><circle cx="146" cy="133" r="16" fill="#f2b544" opacity=".15"/><path d="M139 124 L153 124 L155 140 L137 140Z" fill="#f08a3a"/><path d="M141 127 L151 127 L152 137 L140 137Z" fill="#ffd27a"/>`;
default: return '';
}
}
function krathongSVG(cfg, uid){
const c=clean(cfg); U='k'+(++UID)+'_';
// krathong only: the character now walks on the boardwalk beside it
return `<svg viewBox="0 84 220 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
${kDefs(c)}${baseBack(c)}${candleIncense(c)}${baseFront(c)}
</svg>`;
}
