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
const OL='#3b2a20';
const ol=(w)=>`stroke="${OL}" stroke-width="${w||1.1}" stroke-linejoin="round"`;
function hairBack(c){
const h=c.hairColor, d=shade(h,-.25);
switch(c.hair){
case 'long': return `<path d="M84 78 Q82 50 110 50 Q138 50 136 78 L140 126 Q133 132 125 126 L122 104 L98 104 L95 126 Q87 132 80 126Z" fill="${h}" ${ol()}/><path d="M88 96 L86 124 M132 96 L134 124" stroke="${d}" stroke-width="1.2" fill="none"/>`;
case 'bob': return `<path d="M84 80 Q82 50 110 50 Q138 50 136 80 L138 104 Q128 110 120 104 L100 104 Q92 110 82 104Z" fill="${h}" ${ol()}/>`;
case 'ponytail': return `<path d="M128 62 Q156 66 150 104 Q147 122 140 128 Q142 108 134 90Z" fill="${h}" ${ol()}/><path d="M138 74 Q148 90 142 116" stroke="${d}" stroke-width="1.2" fill="none"/><circle cx="131" cy="66" r="3.6" fill="${c.outfitColor}" ${ol(.8)}/>`;
case 'bun': return `<circle cx="110" cy="50" r="11" fill="${h}" ${ol()}/><path d="M103 46 Q110 42 117 46" stroke="${shade(h,.3)}" stroke-width="1.4" fill="none"/><path d="M100 57 Q110 53 120 57" stroke="${c.outfitColor}" stroke-width="2.6" fill="none"/>`;
default: return '';
}
}
function hairFront(c){
const h=c.hairColor, d=shade(h,-.3), hi=shade(h,.45);
const shine=`<path d="M95 60 Q110 54 125 60" stroke="${hi}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>`;
switch(c.hair){
case 'spiky': return `<path d="M85 82 L83 64 L91 67 L92 54 L101 61 L108 48 L115 60 L125 53 L127 65 L136 63 L135 82 Q130 70 122 68 Q116 74 108 68 Q100 74 94 68 Q88 72 85 82Z" fill="${h}" ${ol()}/><path d="M100 60 L104 68 M116 58 L114 67" stroke="${d}" stroke-width="1" fill="none"/>`+shine;
case 'side': return `<path d="M85 84 Q82 52 112 51 Q140 53 135 84 Q133 70 124 66 Q108 64 96 74 Q90 78 85 84Z" fill="${h}" ${ol()}/><path d="M96 74 Q110 60 132 66 M102 70 Q114 62 128 64" stroke="${d}" stroke-width="1" fill="none"/>`+shine;
case 'short': return `<path d="M85 82 Q83 51 110 50 Q137 51 135 82 Q133 70 127 66 Q119 72 109 66 Q99 72 93 66 Q87 72 85 82Z" fill="${h}" ${ol()}/><path d="M99 67 L101 61 M115 66 L117 60" stroke="${d}" stroke-width="1" fill="none"/>`+shine;
default: // soft fringe for long / bob / ponytail / bun
return `<path d="M85 86 Q84 52 110 52 Q136 52 135 86 Q131 72 122 69 Q118 78 110 73 Q102 79 97 69 Q89 73 85 86Z" fill="${h}" ${ol()}/><path d="M97 69 Q99 76 98 82 M122 69 Q121 76 123 82 M110 73 L110 78" stroke="${d}" stroke-width="1" fill="none"/>`+shine;
}
}
function face(c){
const ink='#2a1a14', f=c.gender==='f';
const eye=(x)=>`<ellipse cx="${x}" cy="88" rx="2.7" ry="3.5" fill="${ink}"/><circle cx="${x+1}" cy="86.6" r="1.1" fill="#fff"/><circle cx="${x-.9}" cy="89.8" r=".5" fill="#fff" opacity=".8"/>`;
const closed=(x,up)=>`<path d="M${x-3.4} ${up?89:87.5} Q${x} ${up?85:90} ${x+3.4} ${up?89:87.5}" stroke="${ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
let e='', m='', blush=f?.45:.28;
const lip=f?'#c2405a':ink;
switch(c.face){
case 'shy': e=closed(101,false)+closed(119,false); m=`<path d="M108 99.5 Q110 98.5 112 99.5" stroke="${lip}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`; blush+=.3; break;
case 'wink': e=eye(101)+closed(119,true); m=`<path d="M106 98 Q110 102 114 98" stroke="${lip}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`; break;
case 'laugh': e=closed(101,true)+closed(119,true); m=`<path d="M105.5 97.5 L114.5 97.5 Q114 104 110 104 Q106 104 105.5 97.5Z" fill="#8a2b3a" ${ol(.8)}/><path d="M107.5 102 Q110 100.6 112.5 102" fill="#e5788a"/>`; blush+=.1; break;
default: e=eye(101)+eye(119); m=`<path d="M107 98.5 Q110 101 113 98.5" stroke="${lip}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
}
if(f){ e+=`<path d="M103.6 85.6 l2.2 -1.6 M116.4 85.6 l-2.2 -1.6" stroke="${ink}" stroke-width="1" stroke-linecap="round"/>`; }
const bw=f?1.1:1.8, bc=f?shade(c.hairColor,-.1):c.hairColor;
e+=`<path d="M97 ${f?81:80.5} Q101 ${f?79:78.5} 105 ${f?81:80.5}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/><path d="M115 ${f?81:80.5} Q119 ${f?79:78.5} 123 ${f?81:80.5}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`;
e+=`<path d="M110 92.5 l-.8 2.2 h1.4" stroke="${shade(c.skin,-.3)}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
return e+m+`<ellipse cx="96" cy="95" rx="4.2" ry="2.4" fill="#ff8a9a" opacity="${blush}"/><ellipse cx="124" cy="95" rx="4.2" ry="2.4" fill="#ff8a9a" opacity="${blush}"/>`;
}
function head(c){
const sk=c.skin, sd=shade(sk,-.12);
return `<path d="M106 104 L106 114 L114 114 L114 104Z" fill="${sd}" ${ol(1)}/>`
+ `<ellipse cx="86.5" cy="87" rx="3.4" ry="4.4" fill="${sk}" ${ol(1)}/><ellipse cx="133.5" cy="87" rx="3.4" ry="4.4" fill="${sk}" ${ol(1)}/>`
+ `<path d="M86 82 Q86 57 110 57 Q134 57 134 82 Q134 99 123 105.5 Q110 111 97 105.5 Q86 99 86 82Z" fill="${sk}" ${ol()}/>`
+ `<path d="M124 64 Q134 74 132 90 Q130 100 123 105 Q131 92 124 64Z" fill="#000" opacity=".05"/>`;
}
function body(c){
const o=c.outfitColor, od=shade(o,-.22), sk=c.skin, gold='#e2b64e', goldD='#b8862a';
const shade_r=(d)=>`<path d="${d}" fill="#000" opacity=".1"/>`;
const legs=(col,y1,y2)=>`<path d="M100.5 ${y1} L109.6 ${y1} L109 ${y2} L101.5 ${y2}Z" fill="${col}" ${ol(1)}/><path d="M110.4 ${y1} L119.5 ${y1} L118.5 ${y2} L111 ${y2}Z" fill="${col}" ${ol(1)}/>`;
const shoes=(col)=>`<path d="M99 172 Q99 168 105 168 Q110 168 110 172 L110 175.5 L98.5 175.5Z" fill="${col}" ${ol(1)}/><path d="M110 172 Q110 168 115 168 Q121 168 121 172 L121.5 175.5 L110 175.5Z" fill="${col}" ${ol(1)}/>`;
const sneakers=`<path d="M98.5 171 Q99 167 105 167 Q110.5 167 110.5 171 L111 175.5 L98 175.5Z" fill="#f6f3ec" ${ol(1)}/><path d="M109.5 171 Q110 167 115 167 Q121 167 121.5 171 L122 175.5 L109.5 175.5Z" fill="#f6f3ec" ${ol(1)}/><path d="M98.3 173.6 H111 M109.6 173.6 H122" stroke="${o}" stroke-width="1.4"/>`;
const torso=(col)=>`<path d="M96 113 Q110 109 124 113 L127 141 L93 141Z" fill="${col}" ${ol()}/>`+shade_r('M118 112 L124 113 L127 141 L120 141Z');
let s='';
switch(c.outfit){
case 'thaiF': // sabai over a wrapped top, long pha sin with gold hem
s+=`<path d="M97 139 L123 139 L124 174 L96 174Z" fill="${o}" ${ol()}/>`
+`<path d="M97 150 H123 M97 158 H123" stroke="${shade(o,.25)}" stroke-width="1.6"/><path d="M96.3 166 L123.7 166 L124 174 L96 174Z" fill="${gold}" ${ol(1)}/><path d="M104 140 L102 165" stroke="${od}" stroke-width="1.2"/>`
+`<path d="M99 174 h5 M115 174 h5" stroke="${shade(sk,-.15)}" stroke-width="2.4" stroke-linecap="round"/>`
+`<path d="M96 113 Q110 109 124 113 L126 140 L94 140Z" fill="${sk}" ${ol()}/>`
+`<path d="M95 122 Q110 119 125.5 122 L126 140 L94 140Z" fill="${shade(o,.35)}" ${ol(1)}/>`
+`<path d="M95.5 113 L104 112 L127 139 L117 141Z" fill="${o}" ${ol(1)}/><path d="M97 114 L125 139" stroke="${gold}" stroke-width="1.6"/>`
+`<rect x="94" y="137" width="32" height="4" rx="1" fill="${gold}" ${ol(.9)}/>`;
break;
case 'dress':
s+=legs(sk,152,170)+shoes(od)
+torso(o)+`<path d="M94 138 L126 138 L136 160 Q110 166 84 160Z" fill="${o}" ${ol()}/><path d="M86 157 Q110 163 134 157" stroke="${shade(o,.4)}" stroke-width="2" fill="none"/>`
+`<path d="M101 112 Q110 118 119 112" stroke="${shade(o,.45)}" stroke-width="1.6" fill="none"/><rect x="94" y="135.5" width="32" height="3.5" rx="1" fill="${shade(o,.45)}" ${ol(.8)}/>`;
break;
case 'thaiM': // raj pattern jacket + chong kraben
s+=`<path d="M101 158 L109.5 158 L109 170 L102 170Z M110.5 158 L119 158 L118 170 L111 170Z" fill="#f2eee4" ${ol(1)}/>`+shoes('#1e1814')
+`<path d="M94 139 Q90 156 100 160 L120 160 Q130 156 126 139Z" fill="${shade(o,-.4)}" ${ol()}/><path d="M110 140 L110 158 M101 146 Q104 154 102 158 M119 146 Q116 154 118 158" stroke="${shade(o,-.6)}" stroke-width="1" fill="none"/>`
+torso('#f4f1e8')+`<path d="M103 110 L117 110 L117 115 Q110 117 103 115Z" fill="#f4f1e8" ${ol(1)}/><path d="M110 115 V140" stroke="#cfc8b4" stroke-width="1"/>`
+`<g fill="${gold}" ${ol(.6)}><circle cx="110" cy="120" r="1.3"/><circle cx="110" cy="126" r="1.3"/><circle cx="110" cy="132" r="1.3"/></g><rect x="93" y="136" width="34" height="4" fill="${o}" ${ol(.9)}/>`;
break;
case 'shirt':
s+=legs('#2b2f45',139,170)+shoes('#3a2416')
+torso(o)+`<path d="M103 111 L110 119 L104 121Z M117 111 L110 119 L116 121Z" fill="${shade(o,.55)}" ${ol(.9)}/><path d="M110 119 V139" stroke="${od}" stroke-width="1"/>`
+`<g fill="${shade(o,.6)}"><circle cx="110" cy="125" r="1"/><circle cx="110" cy="131" r="1"/></g><rect x="93.5" y="137" width="33" height="3.5" fill="#3a2416"/><rect x="108" y="137" width="4" height="3.5" fill="${gold}"/>`;
break;
case 'mohom':
s+=legs(od,139,170)+shoes('#1e1814')
+torso(o)+`<path d="M104 111 L110 121 L116 111" fill="${sk}" ${ol(.9)}/><path d="M110 121 V136" stroke="${od}" stroke-width="1"/>`
+`<rect x="93" y="135" width="34" height="5" fill="#d8443a" ${ol(.9)}/><g fill="#f2f2ea" opacity=".8"><rect x="96" y="135" width="3" height="5"/><rect x="103" y="135" width="3" height="5"/><rect x="110" y="135" width="3" height="5"/><rect x="117" y="135" width="3" height="5"/></g>`;
break;
default: // t-shirt, jeans, sneakers
s+=legs('#3c5f92',139,169)+sneakers
+`<path d="M101 145 V168 M119 145 V168" stroke="#2c4a75" stroke-width=".8"/>`
+torso(o)+`<path d="M103 111.5 Q110 117 117 111.5" stroke="${od}" stroke-width="1.5" fill="none"/><path d="M106 124 Q110 120 114 124 Q110 130 106 124Z" fill="${shade(o,.5)}"/>`
+`<rect x="93.5" y="137.5" width="33" height="3" fill="#2c4a75"/>`;
}
return s;
}
// arms are separate groups so gestures can swing them from the shoulder
function arms(c){
const sk=c.skin;
const long = c.outfit==='thaiM'||c.outfit==='shirt'||c.outfit==='mohom';
const sleeve = c.outfit==='thaiF' ? null : (c.outfit==='thaiM' ? '#f4f1e8' : c.outfitColor);
const arm=(x0,x1,x2,cls,extra)=>{
const p=`M${x0} 121 Q${x1} 133 ${x2} 145`;
let a=`<path d="${p}" stroke="${OL}" stroke-width="7.6" stroke-linecap="round" fill="none"/><path d="${p}" stroke="${sk}" stroke-width="5.4" stroke-linecap="round" fill="none"/>`;
if(sleeve){ const sp = long ? p : `M${x0} 121 Q${(x0+x1)/2} 126 ${x1} 130`;
a+=`<path d="${sp}" stroke="${OL}" stroke-width="8.6" stroke-linecap="round" fill="none"/><path d="${sp}" stroke="${sleeve}" stroke-width="6.4" stroke-linecap="round" fill="none"/>`; }
a+=`<circle cx="${x2}" cy="146.5" r="3.4" fill="${sk}" ${ol(1)}/>`;
return `<g class="${cls}">${a}${extra||''}</g>`;
};
return arm(95,90,88,'armL') + arm(125,130,132,'armR',`<g transform="translate(-5 0)">${holding(c)}</g>`);
}
function figure(c){ return `${hairBack(c)}${body(c)}${head(c)}${face(c)}${hairFront(c)}${arms(c)}`; }
function characterSVG(cfg){
const c=clean(cfg); U='k'+(++UID)+'_';
return `<svg viewBox="58 40 104 144" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="110" cy="177" rx="18" ry="3.2" fill="#000" opacity=".25"/><g class="fig">${figure(c)}</g></svg>`;
}
function holding(c){
switch(c.hold){
case 'flower': return `<path d="M139 148 Q144 132 142 120" stroke="#4f8a4a" stroke-width="2" fill="none"/>`+flowerAt(142,117,c.flower,6);
case 'heart': return `<path d="M138 146 C130 138 132 128 139 131 C146 128 148 138 140 146Z" transform="translate(4 -8)" fill="#ff5c86" ${ol(.9)}/>`;
case 'lantern': return `<line x1="138" y1="146" x2="146" y2="118" stroke="#8a6a3a" stroke-width="1.4"/><circle cx="146" cy="133" r="16" fill="#f2b544" opacity=".15"/><path d="M139 124 L153 124 L155 140 L137 140Z" fill="#f08a3a" ${ol(.9)}/><path d="M141 127 L151 127 L152 137 L140 137Z" fill="#ffd27a"/>`;
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
