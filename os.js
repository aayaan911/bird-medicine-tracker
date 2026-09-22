/* KinBird Aviary OS — batch calculator, today view, give log, offline.
   Runs on every page. Pure localStorage, no server, no login. */
/* ================= THEME — the single source of truth for every page =================
   Six pages used to carry their own hand-rolled copy of this and treatment.html had
   none, so it launched stuck in light mode. This module runs LAST on every page and
   takes ownership: it clones the button, which drops every listener any older inline
   copy attached, then wires exactly one. Never add a theme handler to a page again. */
(function(){
  var SUN='M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z';
  var MOON='M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-12.09-8.43-8.32-14.96z';
  var K='bmt-theme';

  function saved(){ try{ return localStorage.getItem(K); }catch(e){ return null; } }
  function osDark(){ return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }
  function paint(t){
    document.documentElement.setAttribute('data-theme', t);
    var ic=document.getElementById('themeIcon');
    if(ic) ic.innerHTML='<path d="'+(t==='dark'?SUN:MOON)+'"/>';
    var b=document.getElementById('themeBtn');
    if(b) b.setAttribute('aria-label', t==='dark'?'Switch to light mode':'Switch to dark mode');
    var m=document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content', t==='dark'?'#0e1418':'#1d9e75');
  }

  function init(){
    paint(saved() || (osDark()?'dark':'light'));
    var old=document.getElementById('themeBtn');
    if(!old) return;
    /* cloning strips every listener and every .onclick an older inline copy set */
    var b=old.cloneNode(true);
    old.parentNode.replaceChild(b, old);
    paint(document.documentElement.getAttribute('data-theme'));
    b.addEventListener('click', function(){
      var t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
      try{ localStorage.setItem(K,t); }catch(e){}
      paint(t);
    });
    /* follow the operating system only while he has never chosen manually */
    if(window.matchMedia){
      var mq=window.matchMedia('(prefers-color-scheme: dark)');
      var onOS=function(e){ if(!saved()) paint(e.matches?'dark':'light'); };
      if(mq.addEventListener) mq.addEventListener('change', onOS);
      else if(mq.addListener) mq.addListener(onOS);
    }
    /* another tab toggled it */
    window.addEventListener('storage', function(e){ if(e.key===K && e.newValue) paint(e.newValue); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

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
          {k:'fv',  n:'Ferti-Vit', d:'1 g per 250 ml water',    r:'water',every:1, d3:true} ]},
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

/* the filter bar is itself sticky at 56px and 60px tall, so the table header must park BELOW it */
function kbStick(){
  var tb=document.querySelector('.topbar'), sz=document.querySelector('.searchzone');
  if(!tb) return;
  var h=Math.round(tb.getBoundingClientRect().height + (sz?sz.getBoundingClientRect().height:0));
  document.documentElement.style.setProperty('--stickTop', h+'px');
}
window.addEventListener('resize', kbStick);
window.addEventListener('load', kbStick);
kbStick();

/* ---------------- small screens: 10 chips become one native dropdown ---------------- */
function kbFilterSelect(){
  var row=document.querySelector('.srow');
  var chipRow=document.querySelector('.fchips');
  if(!row||!chipRow||document.getElementById('fsel')) return;
  var chips=[].slice.call(document.querySelectorAll('.fchip'));
  if(!chips.length) return;
  var JOBS=['all','daily','breeding','emerg'];
  var sel=document.createElement('select');
  sel.id='fsel'; sel.className='fsel'; sel.setAttribute('aria-label','Filter medicines');
  var g1=document.createElement('optgroup'); g1.label='Show';
  var g2=document.createElement('optgroup'); g2.label='Brand';
  chips.forEach(function(c){
    var o=document.createElement('option');
    o.value=c.dataset.f; o.textContent=c.textContent.trim();
    if(c.classList.contains('on')) o.selected=true;
    (JOBS.indexOf(c.dataset.f)>-1?g1:g2).appendChild(o);
  });
  sel.appendChild(g1); sel.appendChild(g2);
  /* the chip click handler already owns the filtering, so just forward to it */
  sel.addEventListener('change', function(){
    var c=document.querySelector('.fchip[data-f="'+sel.value+'"]');
    if(c) c.click();
  });
  chips.forEach(function(c){ c.addEventListener('click', function(){ sel.value=c.dataset.f; }); });
  row.insertBefore(sel, chipRow);
}
kbFilterSelect();
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function(){});

/* ---------------- compare popup: square the header corners while stuck ----------------
   scroll does not bubble, so listen in the capture phase. Works for every popup
   instance without wiring, because the popup is built after page load. */
document.addEventListener('scroll', function(e){
  var bd = e.target;
  if(!bd || !bd.classList || !bd.classList.contains('cbd')) return;
  var head = bd.querySelector('.crow.chead');
  if(!head) return;
  var stuck = head.getBoundingClientRect().top <= bd.getBoundingClientRect().top + 0.5;
  head.classList.toggle('cstuck', stuck);
}, true);

})();

/* ================= MOBILE LAYER — runs on every page =================
   1. Any table with 4+ columns gets per-cell labels so mobile.css can stack it
      into readable cards instead of forcing a 778px sideways scroll.
   2. The Trackers menu becomes a real bottom sheet on a phone: backdrop,
      scroll lock, swipe down to close, Escape, and it restores scroll position.
   3. A generic tab controller, so no page ever writes its own again. */
(function(){

  /* ---------- 1. wide tables become labelled cards ---------- */
  function labelTables(){
    /* every table on the page, whatever wrapper it sits in */
    Array.prototype.forEach.call(document.querySelectorAll('table'), function(t){
      var w=t.closest('.kctw,.tw,.tblwrap');
      if(!w){ /* a bare table: give it a wrapper so the card rules have a hook */
        if(t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('autotw')){ w=t.parentNode; }
        else { w=document.createElement('div'); w.className='kctw autotw'; t.parentNode.insertBefore(w,t); w.appendChild(t); }
      }
      var head=t.querySelector('thead tr');
      var cells=head?head.children:null;
      if(!cells||!cells.length){ var fr=t.querySelector('tr'); cells=fr?fr.children:null; }
      if(!cells||cells.length<3){ w.classList.remove('mcard'); w.classList.add('mfit'); return; }
      var hs=[]; Array.prototype.forEach.call(cells,function(th){ hs.push((th.textContent||'').trim()); });
      w.classList.add('mcard');
      Array.prototype.forEach.call(t.querySelectorAll('tbody tr, tr'), function(tr){
        if(tr.parentNode && tr.parentNode.tagName==='THEAD') return;
        if(tr.classList.contains('gband')) return;
        var tds=tr.children;
        for(var i=0;i<tds.length;i++){
          if(tds[i].hasAttribute('colspan')) continue;
          if(tds[i].tagName==='TH' && tr.rowIndex===0) continue;
          if(!tds[i].hasAttribute('data-label') && hs[i]) tds[i].setAttribute('data-label', hs[i]);
        }
      });
    });
  }

  /* ---------- 2. the Trackers bottom sheet ---------- */
  function sheet(){
    var dd=document.getElementById('navdd'), bt=document.getElementById('navbtn'), mn=document.getElementById('navmenu');
    if(!dd||!bt||!mn) return;
    var bd=document.querySelector('.navbd');
    if(!bd){ bd=document.createElement('div'); bd.className='navbd'; document.body.appendChild(bd); }
    var scrollY=0;
    function phone(){ return window.matchMedia('(max-width:640px)').matches; }
    function open(){
      dd.classList.add('open'); bt.setAttribute('aria-expanded','true');
      if(phone()){ scrollY=window.scrollY; document.body.classList.add('navopen'); }
    }
    function close(){
      if(!dd.classList.contains('open')) return;
      dd.classList.remove('open'); bt.setAttribute('aria-expanded','false');
      if(document.body.classList.contains('navopen')){ document.body.classList.remove('navopen'); window.scrollTo(0,scrollY); }
      mn.style.transform='';
    }
    /* take ownership from the older per page handler */
    var nb=bt.cloneNode(true); bt.parentNode.replaceChild(nb,bt); bt=nb;
    bt.addEventListener('click', function(e){ e.stopPropagation(); dd.classList.contains('open')?close():open(); });
    bd.addEventListener('click', close);
    document.addEventListener('click', function(e){ if(!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
    Array.prototype.forEach.call(mn.querySelectorAll('a'), function(a){ a.addEventListener('click', close); });
    window.addEventListener('resize', function(){ if(!phone()&&document.body.classList.contains('navopen')){ document.body.classList.remove('navopen'); window.scrollTo(0,scrollY); } });

    /* swipe the sheet down to dismiss, the way a native sheet behaves */
    var y0=null, dy=0;
    mn.addEventListener('touchstart', function(e){ if(!phone()||mn.scrollTop>0) return; y0=e.touches[0].clientY; dy=0; mn.style.transition='none'; }, {passive:true});
    mn.addEventListener('touchmove', function(e){ if(y0===null) return; dy=e.touches[0].clientY-y0; if(dy>0) mn.style.transform='translateY('+dy+'px)'; }, {passive:true});
    mn.addEventListener('touchend', function(){ if(y0===null) return; mn.style.transition=''; (dy>90)?close():(mn.style.transform=''); y0=null; }, {passive:true});
  }

  /* ---------- 3. one tab controller for every page ---------- */
  function tabs(){
    Array.prototype.forEach.call(document.querySelectorAll('.kctabs'), function(bar){
      var scope=bar.closest('[data-tabscope]')||bar.parentNode;
      var btns=bar.querySelectorAll('.kctab');
      if(!btns.length || bar.dataset.wired) return;
      bar.dataset.wired='1';
      Array.prototype.forEach.call(btns, function(b){
        b.setAttribute('role','tab');
        b.addEventListener('click', function(){
          var k=b.dataset.t;
          Array.prototype.forEach.call(btns,function(x){ x.classList.toggle('on', x===b); x.setAttribute('aria-selected', x===b?'true':'false'); });
          Array.prototype.forEach.call(scope.querySelectorAll('.kcpanel'), function(p){ p.classList.toggle('on', p.dataset.p===k); });
          labelTables();
        });
      });
    });
  }

  function init(){ labelTables(); sheet(); tabs(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  /* the medicine list re renders on filter, so relabel when the DOM settles */
  var deb; document.addEventListener('click', function(){ clearTimeout(deb); deb=setTimeout(labelTables,120); });
})();

/* ---------- 4. a 40 row table needs a jump bar, a back to top, and copyable rows ---------- */
(function(){
  function init(){
    /* back to top */
    if(document.querySelector('.gtbl') && !document.querySelector('.totop')){
      var b=document.createElement('button');
      b.className='totop'; b.setAttribute('aria-label','Back to top');
      b.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>';
      document.body.appendChild(b);
      b.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
      var onScroll=function(){ b.classList.toggle('show', window.scrollY>700); };
      window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    }

    /* tapping a row number copies a shareable link to that exact row */
    Array.prototype.forEach.call(document.querySelectorAll('a.rnum'), function(a){
      a.addEventListener('click', function(e){
        var url=location.origin+location.pathname+a.getAttribute('href');
        if(navigator.clipboard){ navigator.clipboard.writeText(url).then(function(){
          var old=a.getAttribute('title'); a.setAttribute('title','Link copied');
          a.style.transform='scale(1.16)';
          setTimeout(function(){ a.style.transform=''; if(old) a.setAttribute('title',old); },550);
        }).catch(function(){}); }
      });
    });

    /* the jump bar marks where you actually are */
    var bar=document.getElementById('jumpbar');
    if(bar){
      var links=bar.querySelectorAll('a');
      var targets=[].map.call(links,function(l){ return document.querySelector(l.getAttribute('href')); });
      var mark=function(){
        var best=-1;
        for(var i=0;i<targets.length;i++){
          if(targets[i] && targets[i].getBoundingClientRect().top<=170) best=i;
        }
        for(var j=0;j<links.length;j++) links[j].classList.toggle('on', j===best);
        if(best>-1 && bar.scrollWidth>bar.clientWidth){
          var l=links[best], lr=l.getBoundingClientRect(), br=bar.getBoundingClientRect();
          if(lr.left<br.left+8 || lr.right>br.right-8) bar.scrollTo({left:l.offsetLeft-16,behavior:'smooth'});
        }
      };
      window.addEventListener('scroll',mark,{passive:true}); mark();
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
