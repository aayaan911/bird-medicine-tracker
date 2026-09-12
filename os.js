/* KinBird Aviary OS — batch calculator, today view, give log, offline.
   Runs on every page. Pure localStorage, no server, no login. */
(function(){
'use strict';
var LS={
  get:function(k,d){ try{var v=localStorage.getItem(k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set:function(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
};
var today=function(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
var daysAgo=function(iso){ if(!iso) return null; var a=new Date(iso+'T00:00:00'), b=new Date(today()+'T00:00:00'); return Math.round((b-a)/86400000); };

/* ---------------- Bangla calendar (Bangla Academy 2019 revision) ---------------- */
var BM=[['Boishakh','বৈশাখ',4,14],['Joishtho','জ্যৈষ্ঠ',5,15],
        ['Ashar','আষাঢ়',6,15],['Srabon','শ্রাবণ',7,16],
        ['Bhadro','ভাদ্র',8,16],['Ashwin','আশ্বিন',9,16],
        ['Kartik','কার্তিক',10,17],['Ogrohayon','অগ্রহায়ণ',11,16],
        ['Poush','পৌষ',12,16],['Magh','মাঘ',1,15],
        ['Falgun','ফাল্গুন',2,14],['Chaitro','চৈত্র',3,15]];
function banglaOf(d){
  var best=null;
  for(var yy=d.getFullYear()-1; yy<=d.getFullYear(); yy++)
    for(var i=0;i<12;i++){ var s=new Date(yy,BM[i][2]-1,BM[i][3]); if(s<=d&&(!best||s>best.s)) best={i:i,s:s}; }
  var by=d.getFullYear()-593; if(d<new Date(d.getFullYear(),3,14)) by=d.getFullYear()-594;
  return {en:BM[best.i][0], bn:BM[best.i][1], day:Math.round((d-best.s)/86400000)+1, year:by, idx:best.i};
}

/* ---------------- the FINAL supplement plan, by phase ---------------- */
var PHASES=[
 {id:'p1', name:'Phase 1 · 21 days before box',
  items:[ {k:'bs',  n:'Nekton Breed Star', d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'herb',n:'Herbs V3',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'acv', n:'ACV',               d:'Friday only',             r:'water',every:7},
          {k:'cav', n:'Calcivet (optional pre-load)', d:'5 ml per 250 ml water, 5 days', r:'water', every:1, d3:true} ]},
 {id:'p2', name:'Phase 2 · box in to FIRST EGG',
  items:[ {k:'bs',  n:'Nekton Breed Star', d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'msa', n:'Nekton MSA',        d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'herb',n:'Herbs V3',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'fv',  n:'Aviform Ferti-Vit', d:'1 g per 250 ml water',    r:'water',every:1, d3:true} ]},
 {id:'p3', name:'Phase 3 · first egg to hatch',
  items:[ {k:'ns',  n:'Nekton S',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'msa', n:'Nekton MSA',        d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'herb',n:'Herbs V3',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'cf',  n:'Calciform HiD3',    d:'2.5 ml per 1 litre water, Mon to Fri', r:'water', every:1, d3:true} ]},
 {id:'p4', name:'Phase 4 · hatch to chicks out',
  items:[ {k:'ns',  n:'Nekton S',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'msa', n:'Nekton MSA',        d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'herb',n:'Herbs V3',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'syn', n:'Synbiotic',         d:'3 g per 1 litre water, hatch +5 days', r:'water', every:1},
          {k:'cf',  n:'Calciform HiD3',    d:'2.5 ml per 1 litre water, 2 days a week', r:'water', every:3, d3:true} ]},
 {id:'p5', name:'Phase 5 · female rest 30 to 40 days',
  items:[ {k:'ns',  n:'Nekton S',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'msa', n:'Nekton MSA',        d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'herb',n:'Herbs V3',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'ely', n:'Nekton Elektrolyt', d:'7.5 g per 1 litre water, 3 to 5 days only', r:'water', every:1},
          {k:'cf',  n:'Calciform HiD3',    d:'2.5 ml per 1 litre water, 2 days a week', r:'water', every:3, d3:true} ]},
 {id:'pm', name:'Maintenance',
  items:[ {k:'ns',  n:'Nekton S',          d:'1 g per 100 g soft food, Mon and Thu', r:'food', every:3},
          {k:'msa', n:'Nekton MSA',        d:'1 g per 100 g soft food, Mon and Thu', r:'food', every:3},
          {k:'herb',n:'Herbs V3',          d:'1 g per 100 g soft food', r:'food', every:1},
          {k:'acv', n:'ACV',               d:'Friday only',             r:'water',every:7},
          {k:'syn', n:'Synbiotic',         d:'3 g per 1 litre water, days 1 to 5 monthly', r:'water', every:30} ]}
];
/* never-combine pairs that the log can actually catch */
var CLASH=[
 {a:'cf', b:'cav', m:'Calciform and Calcivet on the same day. One high-dose D3 product per day.'},
 {a:'cf', b:'fv',  m:'Calciform and Ferti-Vit both carry high-dose D3. Never the same day.'},
 {a:'cav',b:'fv',  m:'Calcivet and Ferti-Vit both carry high-dose D3. Never the same day.'},
 {a:'bs', b:'ns',  m:'Breed Star and Nekton S in the same mix. Never. Breed Star stops at the first egg.'},
 {a:'acv',b:'syn', m:'ACV with Synbiotic. Acid kills the live bacteria. Separate the days.'}
];

/* ---------------- batch calculator: rewrite every dose on the page ---------------- */
var RX=/(\d+(?:\.\d+)?)\s*(ml|g|mg)\s*(?:per|\/)\s*(\d+(?:\.\d+)?)?\s*(millilitre|ml|litres|litre|liter|l|g)\b/gi;
function baseToBase(num,unit){
  unit=unit.toLowerCase();
  if(unit==='l'||unit==='litre'||unit==='litres'||unit==='liter') return {v:(num||1)*1000, r:'water'};
  if(unit==='ml'||unit==='millilitre') return {v:(num||1), r:'water'};
  if(unit==='g') return {v:(num||1), r:'food'};
  return null;
}
function fmt(n){
  if(n>=100) return n.toFixed(0);
  if(n>=10)  return n.toFixed(1);
  if(n>=1)   return n.toFixed(2).replace(/0$/,'');
  return n.toFixed(3).replace(/0$/,'');
}
function applyBatch(){
  var wv=parseFloat(document.getElementById('kbWater')?.value)||0;
  var fv=parseFloat(document.getElementById('kbFood')?.value)||0;
  document.querySelectorAll('.dose-line').forEach(function(el){
    if(!el.dataset.kbOrig) el.dataset.kbOrig=el.innerHTML;
    var html=el.dataset.kbOrig;
    if(!wv && !fv){ el.innerHTML=html; return; }
    html=html.replace(RX,function(m,amt,aunit,bnum,bunit){
      var b=baseToBase(bnum?parseFloat(bnum):null,bunit); if(!b) return m;
      var target = b.r==='water' ? wv : fv;
      if(!target) return m;
      var scaled=parseFloat(amt)*target/b.v;
      var tlab = b.r==='water' ? (target>=1000 ? fmt(target/1000)+' L' : fmt(target)+' ml') : fmt(target)+' g';
      return m+' <span class="kbcalc" title="Scaled for your batch">= '+fmt(scaled)+' '+aunit+' for '+tlab+'</span>';
    });
    el.innerHTML=html;
  });
}

/* ---------------- today view + give log ---------------- */
function phaseNow(){ return LS.get('kb-phase','p2'); }
function log(){ return LS.get('kb-log',{}); }
function renderToday(){
  var host=document.getElementById('kbToday'); if(!host) return;
  var ph=PHASES.filter(function(p){return p.id===phaseNow();})[0]||PHASES[1];
  var lg=log(), t=today(), givenToday=[];
  var rows=ph.items.map(function(it){
    var last=lg[it.k], ago=daysAgo(last), due = ago===null || ago>=it.every;
    if(last===t) givenToday.push(it.k);
    var state = last===t ? 'done' : (due?'due':'ok');
    var when  = last===t ? 'Given today' : (ago===null ? 'Never logged' : ago+' day'+(ago===1?'':'s')+' ago');
    return '<div class="kbrow '+state+'" data-k="'+it.k+'">'+
      '<div class="kbi"><div class="kbn">'+it.n+'</div><div class="kbd dose-line">'+it.d+'</div></div>'+
      '<div class="kbs"><span class="kbwhen">'+when+'</span>'+
      '<button class="kbgive" data-give="'+it.k+'">'+(last===t?'Undo':'Gave it')+'</button></div></div>';
  }).join('');
  var warn='';
  CLASH.forEach(function(c){ if(givenToday.indexOf(c.a)>-1 && givenToday.indexOf(c.b)>-1) warn+='<div class="kbclash">'+c.m+'</div>'; });
  var b=banglaOf(new Date());
  host.innerHTML=
    '<div class="kbhead"><div><div class="kbeyebrow">Today · '+b.day+' '+b.en+' '+b.year+' <span class="bn">'+b.bn+'</span></div>'+
    '<select id="kbPhase" class="kbsel">'+PHASES.map(function(p){return '<option value="'+p.id+'"'+(p.id===ph.id?' selected':'')+'>'+p.name+'</option>';}).join('')+'</select></div>'+
    '<div class="kbbatch"><label>Water<input id="kbWater" type="number" min="0" step="50" placeholder="ml" value="'+(LS.get('kb-wv','')||'')+'"></label>'+
    '<label>Soft food<input id="kbFood" type="number" min="0" step="10" placeholder="g" value="'+(LS.get('kb-fv','')||'')+'"></label></div></div>'+
    warn+'<div class="kblist">'+rows+'</div>';
  host.querySelectorAll('[data-give]').forEach(function(btn){
    btn.onclick=function(){ var k=btn.dataset.give, l=log(); if(l[k]===today()) delete l[k]; else l[k]=today(); LS.set('kb-log',l); renderToday(); applyBatch(); };
  });
  document.getElementById('kbPhase').onchange=function(){ LS.set('kb-phase',this.value); renderToday(); applyBatch(); };
  ['kbWater','kbFood'].forEach(function(id){
    var el=document.getElementById(id);
    el.addEventListener('input',function(){ LS.set(id==='kbWater'?'kb-wv':'kb-fv', el.value); applyBatch(); });
  });
}

/* ---------------- boot ---------------- */
function boot(){ renderToday(); applyBatch(); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
/* the medicine list renders async, so re-apply once it lands */
var tries=0, iv=setInterval(function(){ if(document.querySelector('.dose-line')||++tries>40){ applyBatch(); if(tries>40||document.querySelector('.dose-line')) clearInterval(iv); } },250);
window.addEventListener('kb:rendered', applyBatch);
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function(){});
})();
