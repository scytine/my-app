/* Squidge core: synthesized squish sounds, spring engine, cart storage */
(function(){
/* ---------- sound (Web Audio, no audio files) ---------- */
var AC=null,master=null,noiseBuf=null,muted=false;
try{muted=localStorage.getItem('sq-muted')==='1'}catch(e){}
function ctx(){
  if(!AC){
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    AC=new C();master=AC.createGain();master.gain.value=.75;
    var comp=AC.createDynamicsCompressor();master.connect(comp);comp.connect(AC.destination);
    var len=AC.sampleRate,d;noiseBuf=AC.createBuffer(1,len,AC.sampleRate);d=noiseBuf.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=Math.random()*2-1;
  }
  if(AC.state==='suspended')AC.resume();
  return AC;
}
function env(g,t,peak,att,dur){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur)}
function noise(o){
  var a=ctx();if(!a)return;
  var t=a.currentTime+(o.t||0),s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
  s.buffer=noiseBuf;s.loop=true;f.type=o.type||'bandpass';f.Q.value=o.q||1;
  f.frequency.setValueAtTime(o.f0,t);if(o.f1)f.frequency.exponentialRampToValueAtTime(o.f1,t+o.dur);
  env(g,t,o.g,o.att||.005,o.dur);
  s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*.5);s.stop(t+o.dur+.03);
}
function tone(o){
  var a=ctx();if(!a)return;
  var t=a.currentTime+(o.t||0),x=a.createOscillator(),g=a.createGain();
  x.type=o.w||'sine';x.frequency.setValueAtTime(o.f0,t);x.frequency.exponentialRampToValueAtTime(o.f1,t+o.dur);
  env(g,t,o.g,o.att||.008,o.dur);x.connect(g);g.connect(master);x.start(t);x.stop(t+o.dur+.03);
}
function crunch(n,span,g){for(var i=0;i<n;i++)noise({t:Math.random()*span,dur:.012+Math.random()*.02,type:'highpass',f0:2200+Math.random()*3500,q:.7,g:g*(.4+Math.random()*.6),att:.001})}
var S={
  /* gooey wet squelch, then a bloop */
  vaseline:{
    press:function(){noise({dur:.3,type:'lowpass',f0:250,f1:1100,q:9,g:.9,att:.03});tone({f0:190,f1:80,dur:.22,g:.35})},
    release:function(){tone({f0:110,f1:340,dur:.18,g:.45});noise({dur:.16,type:'bandpass',f0:600,f1:1400,q:6,g:.4});tone({t:.1,f0:200,f1:480,dur:.1,g:.25})}
  },
  /* crackly foam-bead crunch */
  crunchy:{
    press:function(){crunch(16,.28,.6);tone({f0:140,f1:70,dur:.1,g:.2})},
    release:function(){crunch(6,.14,.35)}
  },
  /* soft, low, dense thud */
  butter:{
    press:function(){noise({dur:.2,type:'lowpass',f0:380,f1:200,q:1,g:.8,att:.02});tone({f0:120,f1:62,dur:.2,g:.5})},
    release:function(){tone({f0:80,f1:150,dur:.2,g:.4,att:.02});noise({dur:.12,type:'lowpass',f0:300,q:1,g:.3})}
  },
  /* airy sigh out, slow inhale back */
  slow:{
    press:function(){noise({dur:.35,type:'bandpass',f0:1400,f1:500,q:.8,g:.45,att:.05})},
    release:function(){noise({dur:1,type:'bandpass',f0:350,f1:950,q:1.2,g:.3,att:.35})}
  },
  /* sticky pat, then a peel */
  mochi:{
    press:function(){tone({f0:230,f1:130,dur:.12,g:.4,w:'triangle'});noise({dur:.09,type:'lowpass',f0:700,g:.45})},
    release:function(){tone({f0:220,f1:950,dur:.11,g:.35,w:'triangle'});noise({t:.07,dur:.06,type:'highpass',f0:3000,g:.25})}
  },
  /* bubbly bloops */
  jelly:{
    press:function(){tone({f0:520,f1:190,dur:.15,g:.5})},
    release:function(){tone({f0:240,f1:720,dur:.17,g:.5});tone({t:.09,f0:360,f1:900,dur:.12,g:.28})}
  }
};
function ui(){document.querySelectorAll('.snd').forEach(function(b){b.textContent=muted?'Sound off':'Sound on';b.setAttribute('aria-pressed',muted?'false':'true')})}
var Snd={
  play:function(el,phase){if(muted)return;var k=(el&&el.dataset&&el.dataset.type)||'butter',s=S[k]||S.butter;s[phase]()},
  toggle:function(){muted=!muted;try{localStorage.setItem('sq-muted',muted?'1':'0')}catch(e){}if(!muted)ctx();ui()}
};
window.addEventListener('pointerdown',function(){if(!muted)ctx()},{capture:true,once:true});
document.addEventListener('click',function(e){if(e.target.closest('.snd'))Snd.toggle()});
ui();

/* ---------- spring engine (squash, wobble, hop, blink, eye tracking, moods) ---------- */
var Sq=(function(){
    var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches,all=[],mx=-9999,my=-9999,last=performance.now();
    function mood(st,m){st.el.classList.remove('m-wow','m-happy');if(m)st.el.classList.add('m-'+m);st.m=m}
    function settle(st){st.hold=false;mood(st,st.hov?'happy':'')}
    function later(st,fn,ms){st.tm.push(setTimeout(fn,ms))}
    function clear(st){st.tm.forEach(clearTimeout);st.tm=[]}
    function init(el,i){
      var st={el:el,s:0,v:0,target:0,k:420,c:26,y:0,yv:0,tilt:0,ex:1,ey:1,lx:0,ly:0,m:'',tm:[],hov:false,hold:false,pressed:false,ph:i*1.7,blinkAt:performance.now()+1200+Math.random()*2500,blinkEnd:0};
      el.__sq=st;all=all.filter(function(s){return s.el.isConnected});all.push(st);
      el.addEventListener('pointerenter',function(){st.hov=true;if(!st.pressed&&!st.hold)mood(st,'happy')});
      el.addEventListener('pointerleave',function(){st.hov=false;if(!st.pressed&&!st.hold)mood(st,'')});
    }
    function press(el,e){
      var st=el.__sq;if(!st)return;
      clear(st);st.hold=false;st.pressed=true;mood(st,'');
      var r=el.getBoundingClientRect(),nx=(e&&e.clientX!=null)?((e.clientX-r.left)/r.width-.5)*2:0;
      st.tilt=Math.max(-1,Math.min(1,nx))*5;st.target=1;st.k=420;st.c=26;Snd.play(el,'press');
    }
    function release(el){
      var st=el.__sq;if(!st||!st.pressed)return;
      st.pressed=false;st.target=0;st.k=200;st.c=6.5;st.hold=true;mood(st,'wow');Snd.play(el,'release');
      clear(st);later(st,function(){mood(st,'happy')},200);later(st,function(){settle(st)},1100);
    }
    function hop(el){
      var st=el.__sq;if(!st)return;
      clear(st);st.hold=true;st.pressed=false;st.target=0;st.k=200;st.c=6.5;
      st.v-=9;st.yv=-el.offsetHeight*2.2;Snd.play(el,'release');st.tilt=(Math.random()<.5?-1:1)*4;
      mood(st,'happy');later(st,function(){settle(st)},1000);
    }
    function frame(now){
      var dt=Math.min(.033,Math.max(.001,(now-last)/1000));last=now;
      all.forEach(function(st){
        var el=st.el,t=now/1000;
        if(rm){st.s=st.target;st.v=0;st.y=0;st.yv=0}
        else{
          var n=Math.max(1,Math.ceil(dt/.004)),h=dt/n;
          for(var i=0;i<n;i++){
            st.v+=((st.target-st.s)*st.k-st.v*st.c)*h;st.s+=st.v*h;
            st.yv+=(-st.y*300-st.yv*13)*h;st.y+=st.yv*h;
          }
        }
        var br=rm?0:Math.sin(t*2.2+st.ph);
        var sy=Math.max(.5,1-.28*st.s+.012*br),sx=1+.2*st.s-.006*br;
        el.style.transform='translateY('+st.y.toFixed(2)+'px) rotate('+(st.tilt*st.s).toFixed(2)+'deg) scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
        var r=el.getBoundingClientRect(),tx=0,ty=0;
        if(mx>-9000&&!st.pressed){
          tx=Math.max(-1,Math.min(1,(mx-(r.left+r.width/2))/300))*40;
          ty=Math.max(-1,Math.min(1,(my-(r.top+r.height/2))/300))*40;
        }
        var tex=1,tey=1;
        if(st.pressed){tex=1.3;tey=.14}
        else if(st.m==='wow'){tex=1.2;tey=1.25}
        else if(st.m==='happy'){tey=.6}
        if(now<st.blinkEnd)tey=Math.min(tey,.08);
        else if(now>st.blinkAt){st.blinkEnd=now+130;st.blinkAt=now+2200+Math.random()*3600}
        var a=1-Math.exp(-dt*14),b=1-Math.exp(-dt*32);
        st.lx+=(tx-st.lx)*a;st.ly+=(ty-st.ly)*a;st.ex+=(tex-st.ex)*b;st.ey+=(tey-st.ey)*b;
        el.style.setProperty('--lx',st.lx.toFixed(1)+'%');
        el.style.setProperty('--ly',st.ly.toFixed(1)+'%');
        el.style.setProperty('--ex',st.ex.toFixed(3));
        el.style.setProperty('--ey',st.ey.toFixed(3));
      });
      requestAnimationFrame(frame);
    }
    document.querySelectorAll('.jelly').forEach(init);
    window.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY},{passive:true});
    document.documentElement.addEventListener('pointerleave',function(){mx=-9999;my=-9999});
    requestAnimationFrame(frame);
    return {press:press,release:release,hop:hop,init:function(el){init(el,all.length)}};
  })();

/* ---------- press / hold / release wiring ---------- */
function wire(el,onUp){
  function down(e){el.classList.add('press');Sq.press(el,e)}
  function up(){if(!el.classList.contains('press'))return;el.classList.remove('press');Sq.release(el);if(onUp)onUp()}
  el.addEventListener('pointerdown',down);
  el.addEventListener('pointerup',up);
  el.addEventListener('pointerleave',up);
  el.addEventListener('pointercancel',up);
  el.addEventListener('keydown',function(e){if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();down()}});
  el.addEventListener('keyup',function(e){if(e.key===' '||e.key==='Enter')up()});
}

/* ---------- cart storage shared by both pages ---------- */
var cart={
  load:function(){try{return JSON.parse(localStorage.getItem('sq-cart'))||{}}catch(e){return {}}},
  save:function(c){try{localStorage.setItem('sq-cart',JSON.stringify(c))}catch(e){}},
  count:function(c){return Object.keys(c).reduce(function(a,k){return a+((c[k]&&c[k].q)||0)},0)}
};

window.Squidge={wire:wire,cart:cart,Sq:Sq,Snd:Snd};
})();
